# LivestockBiofeed E-commerce Extension v1.1 (Turnkey)

This package adds a **proprietary e-commerce funnel** to Livestockbiofeed.com
**without redesigning or modifying** the current brochure site.

## What's new in v1.1
- Stripe + PayPal production-ready flow (test/live via env)
- Tax & shipping configuration (simple defaults + extensible)
- Transactional emails (FR/EN templates) via SMTP (or Mailjet SMTP)
- Security hardening: server-side amount validation, signature checks, rate limiting (basic), webhook verification
- Analytics events (dataLayer + optional GA4 / Matomo)

## Deployment (Junior-proof)
1. Upload this folder as `/shop` on your server (e.g. `/public_html/shop`).
2. On the server, run:
   - `npm install`
   - `node server/server.js`
   (or use PM2: `pm2 start server/server.js --name lbb-shop`)
3. Copy `.env.example` to `.env` and fill keys (Stripe + PayPal + SMTP).
4. Add one menu link on the existing site:
   `<a href="/shop">Boutique</a>`

## URLs
- `/shop/` → Shop landing
- `/shop/product.html?id=broiler` → Product page (example)
- `/shop/cart.html` → Cart
- `/shop/checkout.html` → Checkout

## Notes
- Product prices are validated on the server from `data/products.json`.
- Taxes/shipping rules in `data/commerce_rules.json`.
- Emails are sent by the server after payment confirmation.

