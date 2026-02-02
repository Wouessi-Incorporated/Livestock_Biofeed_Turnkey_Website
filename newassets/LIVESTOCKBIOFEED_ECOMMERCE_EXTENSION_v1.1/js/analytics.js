(() => {
  window.dataLayer = window.dataLayer || [];
  function push(evt){ window.dataLayer.push(evt); }

  window.LBB_ANALYTICS = {
    viewProduct: (id) => push({event:"view_product", product_id:id}),
    addToCart: (id, qty) => push({event:"add_to_cart", product_id:id, qty:qty||1}),
    beginCheckout: (total) => push({event:"begin_checkout", total: total || 0}),
    purchase: (orderId, total, provider) => push({event:"purchase", order_id:orderId, total:total, provider})
  };
})();
