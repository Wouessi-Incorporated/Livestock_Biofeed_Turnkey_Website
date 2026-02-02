(async () => {
  const res = await fetch("/shop/data/products.json");
  const products = await res.json();
  const bio = products.filter(p => !p.type || p.type === "feed");
  const sol = products.filter(p => p.type === "solution");

  const bioGrid = document.getElementById("biofeedGrid");
  const agriGrid = document.getElementById("agriGrid");

  function money(n){ return `$${Number(n).toFixed(2)}`; }

  function card(p){
    const div = document.createElement("div");
    div.className="card";
    div.innerHTML = `
      <div class="imgph"></div>
      <div class="p">
        <div class="h2">${p.name}</div>
        <div class="muted">${p.weight || ""}</div>
        <div class="line"></div>
        <div class="row" style="justify-content:space-between">
          <div class="price">${p.price ? money(p.price) : ""}</div>
          <div class="btnrow">
            <a class="cta secondary" href="/shop/pages/product.html?id=${encodeURIComponent(p.id)}">View</a>
            ${p.price ? `<button class="cta" data-add="${p.id}">${window.LBB_I18N.t("cta.add_to_cart")}</button>` : `<a class="cta" href="/shop/pages/product.html?id=${encodeURIComponent(p.id)}">Explore</a>`}
          </div>
        </div>
      </div>`;
    return div;
  }

  bio.forEach(p => bioGrid.appendChild(card(p)));
  sol.forEach(p => agriGrid.appendChild(card(p)));

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-add");
      window.LBB_CART.add(id, 1);
      window.LBB_CART.toast("Added to cart");
    });
  });
})();
