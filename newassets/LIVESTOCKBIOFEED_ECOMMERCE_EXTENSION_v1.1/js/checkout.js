(async () => {
  const rules = await (await fetch("/shop/data/commerce_rules.json")).json();
  const products = await (await fetch("/shop/data/products.json")).json();

  function money(n){ return `$${Number(n).toFixed(2)} ${rules.currency}`; }

  const itemsBox = document.getElementById("summaryItems");
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const taxesEl = document.getElementById("taxes");
  const totalEl = document.getElementById("total");
  const payStatus = document.getElementById("payStatus");

  function getCustomer(){
    return {
      fullName: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      country: document.getElementById("country").value,
      address: document.getElementById("address").value.trim(),
      lang: window.__LBB_LANG__ || "en"
    };
  }

  async function compute(){
    const cart = window.LBB_CART.getCart();
    const country = document.getElementById("country").value;
    const payload = {cart, country};
    const res = await fetch("/shop/api/quote", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)});
    const q = await res.json();
    return q;
  }

  async function render(){
    const cart = window.LBB_CART.getCart();
    itemsBox.innerHTML="";
    cart.forEach(ci => {
      const p = products.find(x=>x.id===ci.id);
      if(!p) return;
      const row = document.createElement("div");
      row.className="row";
      row.style.justifyContent="space-between";
      row.innerHTML = `<div class="muted">${p.name} × ${ci.qty||1}</div><div>${p.price?money((p.price*(ci.qty||1))):""}</div>`;
      itemsBox.appendChild(row);
    });
    const q = await compute();
    subtotalEl.textContent = money(q.subtotal);
    shippingEl.textContent = money(q.shipping);
    taxesEl.textContent = money(q.taxes);
    totalEl.textContent = money(q.total);
    if(window.LBB_ANALYTICS) window.LBB_ANALYTICS.beginCheckout(q.total);
    return q;
  }

  document.getElementById("country").addEventListener("change", render);

  async function pay(provider){
    const customer = getCustomer();
    const cart = window.LBB_CART.getCart();
    if(!customer.email || !customer.fullName){
      window.LBB_CART.toast("Name + Email required");
      return;
    }
    payStatus.textContent = "Processing...";
    const res = await fetch("/shop/api/create-payment", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({provider, customer, cart, country: customer.country})
    });
    const data = await res.json();
    if(!data.ok){
      payStatus.textContent = data.error || "Payment error";
      return;
    }
    if(provider === "stripe"){
      // redirect to Stripe checkout URL (server returns)
      location.href = data.url;
    } else if(provider === "paypal"){
      location.href = data.url;
    }
  }

  document.getElementById("payStripe").addEventListener("click", ()=>pay("stripe"));
  document.getElementById("payPayPal").addEventListener("click", ()=>pay("paypal"));

  await render();
})();
