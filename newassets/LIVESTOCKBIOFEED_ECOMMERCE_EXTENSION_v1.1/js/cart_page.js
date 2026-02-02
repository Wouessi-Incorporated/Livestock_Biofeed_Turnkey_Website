(async () => {
  const products = await (await fetch("/shop/data/products.json")).json();
  const rules = await (await fetch("/shop/data/commerce_rules.json")).json();
  function money(n){ return `$${Number(n).toFixed(2)} ${rules.currency}`; }
  const itemsDiv = document.getElementById("cartItems");
  const totalDiv = document.getElementById("cartTotal");

  function render(){
    const cart = window.LBB_CART.getCart();
    itemsDiv.innerHTML="";
    let total = 0;
    cart.forEach(ci => {
      const p = products.find(x=>x.id===ci.id);
      if(!p) return;
      const line = (p.price||0) * (ci.qty||1);
      total += line;
      const row = document.createElement("div");
      row.className="card";
      row.innerHTML = `
        <div class="p">
          <div class="row" style="justify-content:space-between">
            <div>
              <div class="h2">${p.name}</div>
              <div class="muted">${p.weight || ""}</div>
            </div>
            <div class="row">
              <input style="width:90px" type="number" min="1" value="${ci.qty||1}" data-qty="${p.id}"/>
              <button class="cta secondary" data-rm="${p.id}">Remove</button>
            </div>
          </div>
          <div class="line"></div>
          <div class="row" style="justify-content:space-between">
            <div class="muted">Line</div>
            <div>${money(line)}</div>
          </div>
        </div>`;
      itemsDiv.appendChild(row);
    });
    totalDiv.textContent = money(total);
  }

  itemsDiv.addEventListener("change", (e)=>{
    const el = e.target;
    if(el && el.getAttribute("data-qty")){
      window.LBB_CART.setQty(el.getAttribute("data-qty"), Number(el.value||1));
      render();
    }
  });
  itemsDiv.addEventListener("click", (e)=>{
    const el = e.target;
    if(el && el.getAttribute("data-rm")){
      window.LBB_CART.remove(el.getAttribute("data-rm"));
      render();
    }
  });

  render();
})();
