const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const fs = require("fs");
const crypto = require("crypto");
const Stripe = require("stripe");
const nodemailer = require("nodemailer");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 5055;
const BASE = process.env.SITE_BASE_URL || "https://livestockbiofeed.com";

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_PER_MIN || 120),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

const ROOT = path.join(__dirname, "..");
const SHOP = ROOT; // deployed as /shop folder

function loadJson(rel){
  return JSON.parse(fs.readFileSync(path.join(SHOP, rel), "utf-8"));
}

function money(n){ return Math.round(Number(n) * 100) / 100; }

function computeTotals(cart, country){
  const products = loadJson("data/products.json");
  const rules = loadJson("data/commerce_rules.json");

  // server-side validation of prices
  let subtotal = 0;
  const lines = [];
  for(const item of (cart||[])){
    const p = products.find(x=>x.id===item.id);
    if(!p || !p.price) continue;
    const qty = Math.max(1, Number(item.qty||1));
    const line = money(p.price * qty);
    subtotal = money(subtotal + line);
    lines.push({id:p.id, name:p.name, price:p.price, qty, line});
  }

  // shipping (flat fee by selected method later; default standard)
  let shipping = 0;
  if(rules.shipping && rules.shipping.enabled){
    const standard = (rules.shipping.methods||[]).find(m=>m.id==="standard") || {flat_fee:0};
    shipping = money(standard.flat_fee || 0);
  }

  // taxes
  let taxes = 0;
  if(rules.taxes && rules.taxes.enabled){
    const rate = (rules.taxes.by_country && rules.taxes.by_country[country]) ?? (rules.taxes.default_rate || 0);
    taxes = money((subtotal + shipping) * rate);
  }

  const total = money(subtotal + shipping + taxes);

  return {currency: rules.currency || "CAD", lines, subtotal, shipping, taxes, total};
}

// Email (SMTP)
function mailer(){
  const host = process.env.SMTP_HOST;
  if(!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE||"false") === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
}

const emailTemplates = {
  en: (orderId, totals) => ({
    subject: `Order confirmed: ${orderId}`,
    html: `<p>Thank you. Your order <b>${orderId}</b> is confirmed.</p>
           <p>Total: <b>$${totals.total.toFixed(2)} ${totals.currency}</b></p>`
  }),
  fr: (orderId, totals) => ({
    subject: `Commande confirmée : ${orderId}`,
    html: `<p>Merci. Votre commande <b>${orderId}</b> est confirmée.</p>
           <p>Total : <b>$${totals.total.toFixed(2)} ${totals.currency}</b></p>`
  })
};

async function sendEmails(lang, to, orderId, totals){
  const tx = mailer();
  if(!tx) return {ok:false, error:"SMTP not configured"};
  const t = (lang === "fr") ? emailTemplates.fr(orderId, totals) : emailTemplates.en(orderId, totals);
  const from = process.env.MAIL_FROM || "no-reply@livestockbiofeed.com";
  await tx.sendMail({ from, to, subject: t.subject, html: t.html });
  const admin = process.env.ADMIN_NOTIFY_EMAIL;
  if(admin){
    await tx.sendMail({ from, to: admin, subject: `[ADMIN] ${t.subject}`, html: t.html });
  }
  return {ok:true};
}

// Static: serve pages, css, js, data under /shop
app.use("/shop", express.static(SHOP, { index: false }));
// Convenience route
app.get("/shop", (req,res)=> res.redirect("/shop/pages/shop.html"));

// Quote API
app.post("/shop/api/quote", (req,res)=>{
  try{
    const {cart, country} = req.body || {};
    const totals = computeTotals(cart, country || "CA");
    res.json(totals);
  }catch(e){
    res.status(500).json({error:"quote_failed"});
  }
});

// Stripe/PayPal create-payment
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

function orderId(){
  return "LBB-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

app.post("/shop/api/create-payment", async (req,res)=>{
  try{
    const {provider, customer, cart, country} = req.body || {};
    const totals = computeTotals(cart, country || "CA");
    if(totals.total <= 0){
      return res.status(400).json({ok:false, error:"cart_empty_or_invalid"});
    }
    const oid = orderId();

    if(provider === "stripe"){
      if(!stripe) return res.status(500).json({ok:false, error:"stripe_not_configured"});
      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: customer.email,
        line_items: totals.lines.map(l => ({
          quantity: l.qty,
          price_data: {
            currency: totals.currency.toLowerCase(),
            unit_amount: Math.round(l.price * 100),
            product_data: { name: l.name }
          }
        })),
        success_url: `${BASE}/shop/pages/success.html?oid=${encodeURIComponent(oid)}&provider=stripe`,
        cancel_url: `${BASE}/shop/pages/cancel.html?oid=${encodeURIComponent(oid)}&provider=stripe`,
        metadata: { order_id: oid, lang: customer.lang || "en" }
      });
      return res.json({ok:true, url: session.url, order_id: oid});
    }

    if(provider === "paypal"){
      // Create PayPal order via REST (simple)
      const mode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
      const base = mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
      const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64");

      const tokenResp = await fetch(`${base}/v1/oauth2/token`, {
        method:"POST",
        headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials"
      });
      const tokenJson = await tokenResp.json();
      if(!tokenJson.access_token) return res.status(500).json({ok:false, error:"paypal_auth_failed"});

      const orderResp = await fetch(`${base}/v2/checkout/orders`, {
        method:"POST",
        headers: { "Authorization": `Bearer ${tokenJson.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            reference_id: oid,
            amount: {
              currency_code: totals.currency,
              value: totals.total.toFixed(2)
            }
          }],
          application_context: {
            return_url: `${BASE}/shop/api/paypal/return?oid=${encodeURIComponent(oid)}&lang=${encodeURIComponent(customer.lang||"en")}`,
            cancel_url: `${BASE}/shop/pages/cancel.html?oid=${encodeURIComponent(oid)}&provider=paypal`
          }
        })
      });
      const orderJson = await orderResp.json();
      const approve = (orderJson.links || []).find(l => l.rel === "approve");
      if(!approve) return res.status(500).json({ok:false, error:"paypal_order_failed"});
      return res.json({ok:true, url: approve.href, order_id: oid});
    }

    return res.status(400).json({ok:false, error:"unknown_provider"});
  }catch(e){
    res.status(500).json({ok:false, error:"payment_create_failed"});
  }
});

// PayPal return handler (captures order)
app.get("/shop/api/paypal/return", async (req,res)=>{
  try{
    const { token, oid, lang } = req.query;
    const mode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
    const base = mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64");

    const tokenResp = await fetch(`${base}/v1/oauth2/token`, {
      method:"POST",
      headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials"
    });
    const tokenJson = await tokenResp.json();
    if(!tokenJson.access_token) return res.redirect(`/shop/pages/cancel.html?oid=${encodeURIComponent(oid||"")}&provider=paypal`);

    const capResp = await fetch(`${base}/v2/checkout/orders/${token}/capture`, {
      method:"POST",
      headers: { "Authorization": `Bearer ${tokenJson.access_token}`, "Content-Type": "application/json" }
    });
    const capJson = await capResp.json();
    const status = (capJson.status || "").toUpperCase();

    if(status === "COMPLETED"){
      // Optional: send email confirmation if SMTP configured (no cart here; we send minimal)
      // In a production system, you'd store order details; here we only send a confirmation stub.
      // We'll still attempt a confirmation if email can be derived from payer info.
      const payerEmail = capJson.payer && capJson.payer.email_address;
      if(payerEmail){
        await sendEmails(lang === "fr" ? "fr":"en", payerEmail, oid || "LBB-ORDER", {total:Number(capJson.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value||0), currency: capJson.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code||"CAD"});
      }
      return res.redirect(`/shop/pages/success.html?oid=${encodeURIComponent(oid||"")}&provider=paypal`);
    }
    return res.redirect(`/shop/pages/cancel.html?oid=${encodeURIComponent(oid||"")}&provider=paypal`);
  }catch(e){
    return res.redirect(`/shop/pages/cancel.html?provider=paypal`);
  }
});

// Stripe webhook endpoint (for production-grade confirmation + email)
app.post("/shop/api/stripe/webhook", express.raw({type: "application/json"}), async (req,res)=>{
  try{
    if(!stripe) return res.status(500).send("stripe_not_configured");
    const sig = req.headers["stripe-signature"];
    const whsec = process.env.STRIPE_WEBHOOK_SECRET;
    if(!whsec) return res.status(500).send("webhook_secret_missing");
    const event = stripe.webhooks.constructEvent(req.body, sig, whsec);

    if(event.type === "checkout.session.completed"){
      const session = event.data.object;
      const oid = session.metadata && session.metadata.order_id;
      const lang = session.metadata && session.metadata.lang;
      const email = session.customer_email;
      const amountTotal = (session.amount_total || 0) / 100;
      const currency = (session.currency || "cad").toUpperCase();
      if(email){
        await sendEmails(lang === "fr" ? "fr":"en", email, oid || "LBB-ORDER", {total: amountTotal, currency});
      }
    }
    res.json({received:true});
  }catch(err){
    res.status(400).send(`Webhook Error`);
  }
});

app.listen(PORT, ()=>{
  console.log(`LBB shop running on port ${PORT}`);
  console.log(`Open: ${BASE}/shop`);
});
