(() => {
    const log = (event, data) => {
        console.log(`[LBB-ANALYTICS] ${event}`, data);
        // Here you would send data to GA4, Facebook Pixel, etc.
    };

    window.LBB_ANALYTICS = {
        viewProduct: (id) => log("VIEW_ITEM", { id }),
        addToCart: (id, qty) => log("ADD_TO_CART", { id, qty }),
        beginCheckout: (items) => log("BEGIN_CHECKOUT", { items }),
        purchase: (id, total) => log("PURCHASE", { id, total })
    };
})();
