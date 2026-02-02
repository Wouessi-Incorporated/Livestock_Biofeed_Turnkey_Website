
# LIVESTOCK BIOFEED – E-COMMERCE DEPLOYMENT INSTRUCTIONS
## (READ CAREFULLY – DO NOT IMPROVISE)

This task is a STRICT INTEGRATION, not a redesign.

You are adding a proprietary e-commerce funnel under /shop
WITHOUT modifying the existing Livestockbiofeed.com website design.

--------------------------------------------------
1. FILE YOU RECEIVED
--------------------------------------------------

ZIP:
LIVESTOCKBIOFEED_ECOMMERCE_EXTENSION_v1.1.zip

--------------------------------------------------
2. SERVER REQUIREMENTS
--------------------------------------------------

- Linux hosting
- Node.js 18+ mandatory
- npm available
- Domain already live

--------------------------------------------------
3. DEPLOYMENT – STEP BY STEP (NO SKIP)
--------------------------------------------------

1) Upload and unzip the package
   Target path (example):
   /public_html/shop

2) Enter the folder:
   cd public_html/shop

3) Install dependencies:
   npm install

4) Environment setup:
   cp .env.example .env

5) Edit .env with REAL values:
   - STRIPE_PUBLIC_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - PAYPAL_CLIENT_ID
   - PAYPAL_SECRET
   - SMTP credentials (Mailjet SMTP recommended)
   - SITE_BASE_URL=https://livestockbiofeed.com

6) Start the server:
   node server/server.js
   (OR with PM2 if available)

--------------------------------------------------
4. WEBSITE INTEGRATION (VERY IMPORTANT)
--------------------------------------------------

⚠️ DO NOT TOUCH EXISTING CSS / HTML / JS ⚠️

ONLY add ONE menu link:

<a href="/shop">Boutique</a>

Nothing else.

--------------------------------------------------
5. TESTING CHECKLIST (MANDATORY)
--------------------------------------------------

✅ Open:
https://livestockbiofeed.com/shop

✅ Check:
- Shop page loads
- Product page opens
- Add to cart works
- Cart updates quantity
- Checkout loads

✅ Stripe TEST:
- Use Stripe test card
- Payment success redirects to /success
- Email confirmation received

✅ PayPal SANDBOX:
- Redirects correctly
- Payment completes
- Returns to success page

--------------------------------------------------
6. SECURITY RULES
--------------------------------------------------

- NEVER expose .env publicly
- NEVER hardcode keys in JS
- NEVER change prices in frontend
- Prices are validated SERVER-SIDE

--------------------------------------------------
7. WHAT NOT TO DO (ZERO TOLERANCE)
--------------------------------------------------

❌ No design changes
❌ No framework replacement
❌ No Shopify / WooCommerce
❌ No new CSS on main site
❌ No refactor of existing pages

--------------------------------------------------
8. FINAL VALIDATION
--------------------------------------------------

Send confirmation ONLY when:
✔ All tests pass
✔ Payments work
✔ No visual regression

Failure to follow instructions = rejection.

— END —
