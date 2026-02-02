(async () => {
  const res = await fetch("../shop/data/products.json");
  const products = await res.json();
  const box = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");

  function render() {
    const cart = window.LBB_CART ? window.LBB_CART.getCart() : [];
    box.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      box.innerHTML = `<div class="ecommerce-p ecommerce-muted" style="text-align:center">Your cart is empty.</div>`;
      totalEl.textContent = "$0.00";
      return;
    }

    const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';

    cart.forEach(item => {
      const p = products.find(x => x.id === item.id);
      if (!p) return;
      const sub = p.price * item.qty;
      total += sub;

      const name = (lang === 'fr' && p.name_fr) ? p.name_fr : p.name;

      const div = document.createElement("div");
      div.className = "ecommerce-p";
      div.style.borderBottom = "1px solid var(--lbb-border)";
      div.innerHTML = `
        <div class="ecommerce-row" style="justify-content:space-between">
          <div class="ecommerce-row">
            ${p.image ? `<div style="width:50px; height:50px; background-image:url('${p.image}'); background-size:cover; background-position:center; border-radius:8px"></div>` : ''}
            <div>
              <div class="ecommerce-h2" style="margin:0">${name}</div>
              <div class="ecommerce-muted" style="font-size:12px">${p.weight || ""}</div>
            </div>
          </div>
          <div class="ecommerce-row">
            <div class="ecommerce-row" style="background:var(--lbb-bg); border-radius:8px; padding:4px">
               <button class="ecommerce-cta secondary" style="padding:4px 10px; border:0" onclick="LBB_CART.setQty('${p.id}', ${item.qty - 1}); location.reload()">-</button>
               <span style="min-width:30px; text-align:center; font-weight:800">${item.qty}</span>
               <button class="ecommerce-cta secondary" style="padding:4px 10px; border:0" onclick="LBB_CART.add('${p.id}', 1); location.reload()">+</button>
            </div>
            <div style="font-weight:900; min-width:80px; text-align:right">$${sub.toFixed(2)}</div>
            <button class="ecommerce-cta secondary" style="padding:4px 8px; border:0; color:red" onclick="LBB_CART.remove('${p.id}'); location.reload()">✕</button>
          </div>
        </div>
      `;
      box.appendChild(div);
    });
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  render();
})();
