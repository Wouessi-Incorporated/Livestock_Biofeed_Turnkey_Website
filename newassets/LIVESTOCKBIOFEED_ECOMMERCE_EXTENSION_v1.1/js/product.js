(async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || "ponte";
  const res = await fetch("/shop/data/products.json");
  const products = await res.json();
  const p = products.find(x=>x.id===id) || products[0];
  const rules = await (await fetch("/shop/data/commerce_rules.json")).json();

  document.getElementById("productName").textContent = p.name;
  document.getElementById("crumbName").textContent = p.name;
  document.getElementById("productType").textContent = (p.type === "solution") ? "AGRISTACK" : "BIOFEED";
  document.getElementById("productWeight").textContent = p.weight || "";
  document.getElementById("productPrice").textContent = p.price ? `$${p.price.toFixed(2)} ${rules.currency}` : "";
  document.getElementById("productDesc").textContent =
    (p.type === "solution") ?
      "Integrated production system (aquaculture + poultry + hydroponics).":
      "High-efficiency biological feed formulated for performance.";

  const benefits = {
    ponte:["Higher laying rate","Stronger eggshells","Lower stress & mortality"],
    broiler:["Better FCR","Uniform flock","Cleaner environment"],
    tilapia:["Lower FCR","Cleaner water","Faster growth cycles"],
    rumi:["Better digestion","Reduced waste","Stable weight gain"],
    porc:["Improved FCR","Lower cost per kg","Uniform carcasses"]
  };
  document.getElementById("benefits").innerHTML = "<b>Benefits:</b> " + (benefits[id]||["Performance","Stability","Quality"]).join(" • ");
  document.getElementById("details").textContent = "This page is bilingual and uses server-validated pricing at checkout.";

  // Cross-sell AGRISTACK cards (only)
  const agri = products.filter(x=>x.type==="solution");
  const box = document.getElementById("agriCards");
  box.innerHTML = "";
  agri.forEach(s => {
    const c = document.createElement("div");
    c.className="card";
    c.innerHTML = `
      <div class="p">
        <div class="h2">${s.name}</div>
        <div class="muted">${s.cta === "buy" ? "Pilot & Training Unit" : "Request a Quote"}</div>
        <div class="line"></div>
        <div class="btnrow">
          <a class="cta ${s.cta==='buy'?'':'secondary'}" href="/shop/pages/product.html?id=${encodeURIComponent(s.id)}">${s.cta==='buy'?'Buy Now':'Request a Quote'}</a>
        </div>
      </div>`;
    box.appendChild(c);
  });

  if(window.LBB_ANALYTICS) window.LBB_ANALYTICS.viewProduct(id);

  // Buttons
  document.getElementById("addCart").addEventListener("click", () => {
    if(!p.price){ window.LBB_CART.toast("Quote request on this page"); return; }
    window.LBB_CART.add(p.id, 1);
    window.LBB_CART.toast("Added to cart");
  });

  document.getElementById("buyNow").addEventListener("click", () => {
    if(!p.price){ location.href="/shop/pages/checkout.html"; return; }
    window.LBB_CART.add(p.id, 1);
    location.href="/shop/pages/checkout.html";
  });
})();
