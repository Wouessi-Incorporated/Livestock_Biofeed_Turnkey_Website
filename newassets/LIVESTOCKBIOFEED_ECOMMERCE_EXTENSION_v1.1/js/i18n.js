(() => {
  const dict = {
    en: {
      "shop.subtitle":"Shop",
      "shop.title":"Shop Livestock Biofeed",
      "shop.desc":"Premium biological feed and AGRISTACK solutions. Add products to cart and checkout with Stripe or PayPal.",
      "shop.biofeed":"BioFeed products",
      "shop.agristack":"AGRI-STACK™ solutions",
      "shop.footer":"Secure checkout. Proprietary funnel.",
      "crumb.home":"Home",
      "crumb.shop":"Shop",
      "cta.buy_now":"Buy now",
      "cta.add_to_cart":"Add to cart",
      "product.cross":"Optimize with AGRISTACK™",
      "product.details":"Details",
      "product.footer":"Secure checkout. Proprietary funnel.",
      "cart.title":"Cart",
      "cart.total":"Total",
      "cart.continue":"Continue shopping",
      "cart.checkout":"Checkout",
      "cart.footer":"Secure checkout.",
      "checkout.title":"Checkout",
      "checkout.customer":"Customer info",
      "checkout.name":"Full name",
      "checkout.country":"Country",
      "checkout.address":"Address",
      "checkout.pay":"Pay",
      "checkout.summary":"Order summary",
      "checkout.subtotal":"Subtotal",
      "checkout.shipping":"Shipping",
      "checkout.taxes":"Taxes",
      "checkout.total":"Total",
      "checkout.footer":"Secure checkout. Proprietary funnel.",
      "pay.stripe":"Pay by Card (Stripe)",
      "pay.paypal":"Pay with PayPal"
    },
    fr: {
      "shop.subtitle":"Boutique",
      "shop.title":"Boutique Livestock Biofeed",
      "shop.desc":"Aliments biologiques premium et solutions AGRISTACK. Ajoutez au panier et payez via Stripe ou PayPal.",
      "shop.biofeed":"Produits BioFeed",
      "shop.agristack":"Solutions AGRI-STACK™",
      "shop.footer":"Paiement sécurisé. Funnel propriétaire.",
      "crumb.home":"Accueil",
      "crumb.shop":"Boutique",
      "cta.buy_now":"Acheter maintenant",
      "cta.add_to_cart":"Ajouter au panier",
      "product.cross":"Optimisez avec AGRISTACK™",
      "product.details":"Détails",
      "product.footer":"Paiement sécurisé. Funnel propriétaire.",
      "cart.title":"Panier",
      "cart.total":"Total",
      "cart.continue":"Continuer les achats",
      "cart.checkout":"Commander",
      "cart.footer":"Paiement sécurisé.",
      "checkout.title":"Paiement",
      "checkout.customer":"Informations client",
      "checkout.name":"Nom complet",
      "checkout.country":"Pays",
      "checkout.address":"Adresse",
      "checkout.pay":"Payer",
      "checkout.summary":"Récapitulatif",
      "checkout.subtotal":"Sous-total",
      "checkout.shipping":"Livraison",
      "checkout.taxes":"Taxes",
      "checkout.total":"Total",
      "checkout.footer":"Paiement sécurisé. Funnel propriétaire.",
      "pay.stripe":"Payer par carte (Stripe)",
      "pay.paypal":"Payer avec PayPal"
    }
  };

  function detect(){
    const saved = localStorage.getItem("lbb_lang");
    if (saved === "en" || saved === "fr") return saved;
    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("fr") ? "fr" : "en";
  }

  function apply(lang){
    document.documentElement.lang = lang;
    const tag = document.getElementById("langTag");
    if (tag) tag.textContent = lang.toUpperCase();
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n");
      if (dict[lang] && dict[lang][k]) el.textContent = dict[lang][k];
    });
    window.__LBB_LANG__ = lang;
  }

  window.LBB_I18N = {
    dict, detect, apply,
    t: (k) => (dict[window.__LBB_LANG__] && dict[window.__LBB_LANG__][k]) || k
  };

  const initial = detect();
  apply(initial);

  const toggle = document.getElementById("langToggle");
  if (toggle){
    toggle.addEventListener("click", () => {
      const next = (window.__LBB_LANG__ === "fr") ? "en" : "fr";
      localStorage.setItem("lbb_lang", next);
      apply(next);
    });
  }
})();
