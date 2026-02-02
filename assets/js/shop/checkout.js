(async () => {
    const res = await fetch("../shop/data/products.json");
    const products = await res.json();
    const rules = await (await fetch("../shop/data/commerce_rules.json")).json();

    const cart = (window.LBB_CART) ? window.LBB_CART.getCart() : [];
    const box = document.getElementById("summaryItems");
    let subtotal = 0;

    const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';

    cart.forEach(item => {
        const p = products.find(x => x.id === item.id);
        if (!p) return;
        const sub = p.price * item.qty;
        subtotal += sub;

        const name = (lang === 'fr' && p.name_fr) ? p.name_fr : p.name;

        const div = document.createElement("div");
        div.className = "ecommerce-row";
        div.style.justifyContent = "space-between";
        div.style.marginBottom = "8px";
        div.innerHTML = `
      <span style="font-size:14px">${name} (x${item.qty})</span>
      <span style="font-weight:700">$${sub.toFixed(2)}</span>
    `;
        box.appendChild(div);
    });

    const shipping = subtotal > 0 ? rules.shipping_flat : 0;
    const tax = subtotal * rules.tax_rate;
    const total = subtotal + shipping + tax;

    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("shipping").textContent = `$${shipping.toFixed(2)}`;
    document.getElementById("taxes").textContent = `$${tax.toFixed(2)}`;
    document.getElementById("total").textContent = `$${total.toFixed(2)}`;
    document.getElementById("btnTotal").textContent = `($${total.toFixed(2)})`;

    const form = document.getElementById("checkoutForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (subtotal === 0) { alert("Your cart is empty"); return; }

        // Simulate payment redirect
        const btn = document.getElementById("payBtn");
        btn.disabled = true;
        btn.textContent = (lang === 'fr') ? "Redirection vers le paiement sécurisé..." : "Redirecting to Secure Payment...";

        setTimeout(() => {
            // In a real app, this would redirect to Stripe/PayPal
            // For this demo, we'll just go to success
            location.href = "success.html";
        }, 1500);
    });
})();
