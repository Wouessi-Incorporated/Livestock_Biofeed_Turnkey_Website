(async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || "ponte";
  const res = await fetch("../shop/data/products.json");
  const products = await res.json();
  const p = products.find(x => x.id === id) || products[0];

  const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';
  const name = (lang === 'fr' && p.name_fr) ? p.name_fr : p.name;

  document.getElementById("productName").textContent = name;
  document.getElementById("productCat").textContent = p.category;
  document.getElementById("productPrice").textContent = p.price > 0 ? `$${p.price.toFixed(2)}` : "Contact for Quote";
  document.getElementById("productMainImg").style.backgroundImage = `url('${p.image}')`;
  document.getElementById("productDesc").textContent =
    p.description || "Premium high-efficiency biological feed architected for predictable outcomes and stable growth cycles. Built with laboratory-tested organic inputs.";

  if (p.badge) {
    const badge = document.getElementById("productBadge");
    badge.textContent = p.badge;
    badge.style.display = "inline-flex";
  }

  // Ratings
  function getStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += `<span class="ecommerce-star" style="font-size: 18px">${i < Math.floor(rating) ? '★' : '☆'}</span>`;
    }
    return stars;
  }
  document.getElementById("starRating").innerHTML = getStars(p.rating || 4.5);
  document.getElementById("reviewCount").textContent = `(${p.reviews || 40} reviews)`;

  const benefits = {
    ponte: ["Higher laying rate", "Stronger eggshells", "Lower stress & mortality"],
    broiler: ["Better FCR", "Uniform flock", "Cleaner environment"],
    tilapia: ["Lower FCR", "Cleaner water", "Faster growth cycles"],
    rumi: ["Better digestion", "Reduced waste", "Stable weight gain"],
    porc: ["Improved FCR", "Lower cost per kg", "Uniform carcasses"]
  };
  const bList = benefits[id] || ["Premium Quality", "Lab Tested", "Organic Certified"];
  document.getElementById("benefits").innerHTML = `<h3 style="font-size: 16px; margin-bottom: 10px;">Key Benefits:</h3><ul style="padding-left: 20px;">${bList.map(b => `<li>${b}</li>`).join('')}</ul>`;

  // Qty
  const qtyInput = document.getElementById("qtyInput");
  document.getElementById("qtyPlus").addEventListener('click', () => qtyInput.value = parseInt(qtyInput.value) + 1);
  document.getElementById("qtyMinus").addEventListener('click', () => {
    if (qtyInput.value > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
  });

  // Related (Random 3 from same category)
  const related = products.filter(x => x.id !== id).sort(() => 0.5 - Math.random()).slice(0, 3);
  const box = document.getElementById("agriCards");
  box.innerHTML = related.map(s => `
        <div class="ecommerce-product-card">
            <a href="product.html?id=${encodeURIComponent(s.id)}" class="ecommerce-product-img" style="background-image: url('${s.image}')"></a>
            <div class="ecommerce-product-info">
                <h3 class="ecommerce-product-title">${s.name}</h3>
                <div class="ecommerce-product-price-row">
                    <div class="ecommerce-product-price">${s.price > 0 ? `$${s.price.toFixed(2)}` : 'Custom'}</div>
                    <a href="product.html?id=${encodeURIComponent(s.id)}" class="ecommerce-add-btn" style="text-decoration:none">View</a>
                </div>
            </div>
        </div>
    `).join('');

  // Cart Count
  if (window.LBB_CART) {
    document.getElementById("cartCount").textContent = window.LBB_CART.count();
  }

  // Buttons
  document.getElementById("addCart").addEventListener("click", () => {
    if (p.price <= 0) { window.LBB_CART.toast("Redirecting to Quote Request..."); return; }
    window.LBB_CART.add(p.id, parseInt(qtyInput.value));
    window.LBB_CART.toast(`Added ${qtyInput.value} units to cart`);
    document.getElementById("cartCount").textContent = window.LBB_CART.count();
  });

  document.getElementById("buyNow").addEventListener("click", () => {
    if (p.price <= 0) { location.href = "checkout.html"; return; }
    window.LBB_CART.add(p.id, parseInt(qtyInput.value));
    location.href = "cart.html";
  });
})();
