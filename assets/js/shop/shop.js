(async () => {
  const res = await fetch("../shop/data/products.json");
  const products = await res.json();

  const bioGrid = document.getElementById("biofeedGrid");
  const agriGrid = document.getElementById("agriGrid");
  const feedSection = document.getElementById("feedSection");
  const agriSection = document.getElementById("agriSection");
  const filterContainer = document.getElementById("filterContainer");
  const searchInput = document.getElementById("searchInput");
  const resultCount = document.getElementById("productResultCount");

  function money(n) { return `$${Number(n).toFixed(2)}`; }

  function getStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += `<span class="ecommerce-star">${i < Math.floor(rating) ? '★' : '☆'}</span>`;
    }
    return stars;
  }

  function card(p) {
    const lang = window.getCurrentLang ? window.getCurrentLang() : 'en';
    const name = (lang === 'fr' && p.name_fr) ? p.name_fr : p.name;

    return `
            <div class="ecommerce-product-card" data-p-id="${p.id}">
                ${p.badge ? `<div class="ecommerce-product-badge">${p.badge}</div>` : ''}
                <a href="product.html?id=${encodeURIComponent(p.id)}" class="ecommerce-product-img" style="background-image: url('${p.image}')"></a>
                <div class="ecommerce-product-info">
                    <div class="ecommerce-product-cat">${p.category}</div>
                    <h3 class="ecommerce-product-title">${name}</h3>
                    <div class="ecommerce-product-rating">
                        ${getStars(p.rating || 4.5)}
                        <span style="font-size: 11px; color: var(--e-muted)">(${p.reviews || 0})</span>
                    </div>
                    <div class="ecommerce-product-price-row">
                        <div class="ecommerce-product-price">${p.price > 0 ? money(p.price) : 'Custom'}</div>
                        <button class="ecommerce-add-btn" data-add="${p.id}">${p.price > 0 ? 'Add to Cart' : 'Explore'}</button>
                    </div>
                </div>
            </div>
        `;
  }

  function render() {
    const query = searchInput.value.toLowerCase();
    const activeFilter = filterContainer.querySelector('.active').dataset.filter;

    const filtered = products.filter(p => {
      const matchesQuery = p.name.toLowerCase().includes(query) || (p.name_fr && p.name_fr.toLowerCase().includes(query)) || p.category.toLowerCase().includes(query);
      const matchesCategory = activeFilter === "all" || p.category === activeFilter;
      return matchesQuery && matchesCategory;
    });

    const bio = filtered.filter(p => p.category === "feed");
    const sol = filtered.filter(p => p.category === "solution");

    bioGrid.innerHTML = bio.map(p => card(p)).join('');
    agriGrid.innerHTML = sol.map(p => card(p)).join('');

    feedSection.style.display = bio.length > 0 ? "block" : "none";
    agriSection.style.display = sol.length > 0 ? "block" : "none";

    resultCount.textContent = filtered.length;

    // Re-attach listeners
    document.querySelectorAll("[data-add]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = btn.getAttribute("data-add");
        const prod = products.find(x => x.id === id);
        if (prod && prod.price > 0) {
          window.LBB_CART.add(id, 1);
          window.LBB_CART.toast(`Added ${prod.name} to cart`);
        } else {
          location.href = `product.html?id=${encodeURIComponent(id)}`;
        }
      });
    });
  }

  // Events
  filterContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('ecommerce-filter-chip')) {
      filterContainer.querySelectorAll('.ecommerce-filter-chip').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      render();
    }
  });

  searchInput.addEventListener('input', render);

  // Initial
  render();

  // Update cart count
  if (window.LBB_CART) {
    document.getElementById("cartCount").textContent = window.LBB_CART.count();
  }
})();
