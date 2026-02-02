(async () => {
    const res = await fetch("../shop/data/products.json");
    const products = await res.json();
    const bio = products.filter(p => !p.type || p.type === "feed");
    const sol = products.filter(p => p.type === "solution");

    const bioGrid = document.getElementById("biofeedGrid");
    const agriGrid = document.getElementById("agriGrid");

    function money(n) { return `$${Number(n).toFixed(2)}`; }

    function card(p) {
        const div = document.createElement("div");
        div.className = "ecommerce-card";
        div.innerHTML = `
      <div class="ecommerce-imgph"></div>
      <div class="ecommerce-p">
        <div class="ecommerce-h2">${p.name}</div>
        <div class="ecommerce-muted">${p.weight || ""}</div>
        <div class="ecommerce-line"></div>
        <div class="ecommerce-row" style="justify-content:space-between">
          <div class="ecommerce-price">${p.price ? money(p.price) : ""}</div>
          <div class="ecommerce-btnrow">
            <a class="ecommerce-cta secondary" href="product.html?id=${encodeURIComponent(p.id)}">Details</a>
            ${p.price ? `<button class="ecommerce-cta" data-add="${p.id}">${window.t ? window.t("cta.add_to_cart") : "Add to cart"}</button>` : `<a class="ecommerce-cta" href="product.html?id=${encodeURIComponent(p.id)}">Explore</a>`}
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
