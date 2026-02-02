(() => {
    const KEY = "lbb_cart_v1";
    function getCart() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
    function setCart(items) { localStorage.setItem(KEY, JSON.stringify(items || [])); }
    function count() { return getCart().reduce((a, i) => a + (i.qty || 0), 0); }
    function toast(msg) {
        const t = document.getElementById("toast");
        if (!t) return;
        t.textContent = msg;
        t.style.display = "block";
        clearTimeout(window.__toastTimer);
        window.__toastTimer = setTimeout(() => { t.style.display = "none"; }, 2200);
    }
    function updateCartLink() {
        const link = document.getElementById("cartLink");
        if (link) link.textContent = `${window.t ? window.t('cart.title') : 'Cart'} (${count()})`;
    }
    function add(id, qty = 1) {
        const cart = getCart();
        const idx = cart.findIndex(x => x.id === id);
        if (idx >= 0) cart[idx].qty += qty;
        else cart.push({ id, qty });
        setCart(cart);
        updateCartLink();
        if (window.LBB_ANALYTICS) window.LBB_ANALYTICS.addToCart(id, qty);
    }
    function remove(id) {
        const cart = getCart().filter(x => x.id !== id);
        setCart(cart); updateCartLink();
    }
    function setQty(id, qty) {
        const cart = getCart();
        const idx = cart.findIndex(x => x.id === id);
        if (idx >= 0) { cart[idx].qty = Math.max(1, qty | 0); }
        setCart(cart); updateCartLink();
    }
    window.LBB_CART = { getCart, setCart, count, add, remove, setQty, toast, updateCartLink };
    updateCartLink();
})();
