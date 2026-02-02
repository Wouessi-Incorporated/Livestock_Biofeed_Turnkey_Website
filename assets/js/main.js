// Hero Network Animation
class HeroNetworkAnimation {
  constructor() {
    this.init();
  }

  init() {
    this.animateCounters();
    this.initParallax();
    this.setupNodeInteractions();
  }

  animateCounters() {
    const counters = document.querySelectorAll("[data-count]");

    counters.forEach((counter) => {
      const target = parseInt(counter.dataset.count);
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          counter.textContent =
            target + (target === 95 ? "%" : target === 750 ? "K+" : "");
          clearInterval(timer);
        } else {
          counter.textContent =
            Math.floor(current) +
            (target === 95 ? "%" : target === 750 ? "K" : "");
        }
      }, 16);
    });
  }

  initParallax() {
    const hero = document.getElementById("heroNetwork");
    if (!hero) return;

    const svg = hero.querySelector(".network-svg");

    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const moveX = (x - 0.5) * 20;
      const moveY = (y - 0.5) * 20;

      svg.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    hero.addEventListener("mouseleave", () => {
      svg.style.transform = "translate(0, 0)";
    });
  }

  setupNodeInteractions() {
    document.querySelectorAll(".node").forEach((node) => {
      node.addEventListener("mouseenter", () => {
        node.style.filter = "drop-shadow(0 0 20px rgba(6, 214, 160, 0.8))";
      });

      node.addEventListener("mouseleave", () => {
        node.style.filter = "drop-shadow(0 0 10px rgba(6, 214, 160, 0.5))";
      });
    });
  }
}

// Process Diagram Animation
class ProcessDiagram {
  constructor() {
    this.currentStep = 1;
    this.isAutoPlay = true;
    this.autoPlayInterval = null;
    this.stepData = {
      1: {
        title: "IoT Data Collection",
        description:
          "Our sensor network continuously monitors your livestock and farm environment, collecting over 50 different data points every second.",
        stats: [
          { number: "99.2%", label: "Sensor Uptime" },
          { number: "±0.1°C", label: "Temperature Accuracy" },
          { number: "24/7", label: "Continuous Monitoring" },
        ],
      },
      2: {
        title: "Edge Processing Power",
        description:
          "Local AI processing enables immediate analysis and response, reducing latency and ensuring critical alerts reach you instantly.",
        stats: [
          { number: "<15ms", label: "Processing Latency" },
          { number: "95.7%", label: "Accuracy Rate" },
          { number: "Real-time", label: "Analysis Speed" },
        ],
      },
      3: {
        title: "Cloud Intelligence",
        description:
          "Advanced machine learning models analyze patterns across thousands of farms to improve prediction accuracy and detect subtle health changes.",
        stats: [
          { number: "48hrs", label: "Early Warning" },
          { number: "750K+", label: "Animals Learned" },
          { number: "97%", label: "Prediction Accuracy" },
        ],
      },
      4: {
        title: "Intelligent Alerts",
        description:
          "Smart notification system prioritizes critical alerts while reducing false positives, ensuring you focus on what matters most.",
        stats: [
          { number: "<5min", label: "Alert Response" },
          { number: "2.3%", label: "False Positive Rate" },
          { number: "Multiple", label: "Alert Channels" },
        ],
      },
      5: {
        title: "Actionable Insights",
        description:
          "Comprehensive dashboards translate complex data into clear, actionable recommendations that improve farm productivity and animal welfare.",
        stats: [
          { number: "32%", label: "Mortality Reduction" },
          { number: "4.2:1", label: "Average ROI" },
          { number: "94%", label: "Farmer Satisfaction" },
        ],
      },
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.startAutoPlay();
    this.updateDetailedView();
  }

  bindEvents() {
    document.querySelectorAll(".process-step").forEach((step) => {
      step.addEventListener("click", (e) => {
        const stepNumber = parseInt(e.currentTarget.dataset.step);
        this.goToStep(stepNumber);
      });
    });

    document.querySelectorAll(".control-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const control = e.target.dataset.control;
        this.handleControlAction(control);

        document
          .querySelectorAll(".control-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.3 },
    );

    const detailedView = document.querySelector(".detailed-view");
    if (detailedView) observer.observe(detailedView);
  }

  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 5) return;

    document.querySelectorAll(".process-step").forEach((step, index) => {
      step.classList.remove("active", "completed");
      const stepNum = index + 1;

      if (stepNum === stepNumber) {
        step.classList.add("active");
      } else if (stepNum < stepNumber) {
        step.classList.add("completed");
      }
    });

    this.currentStep = stepNumber;
    this.updateDetailedView();

    if (stepNumber === 4) {
      this.showAlertDemo();
    }
  }

  updateDetailedView() {
    const data = this.stepData[this.currentStep];
    const content = document.getElementById("detailContent");
    if (!content) return;

    content.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      <div class="accuracy-stats">
        ${data.stats
          .map(
            (stat) => `
          <div class="accuracy-item">
            <span class="accuracy-number">${stat.number}</span>
            <span class="accuracy-label">${stat.label}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }

  showAlertDemo() {
    const alert = document.getElementById("alertDemo");
    if (!alert) return;

    alert.classList.add("show");
    setTimeout(() => {
      alert.classList.remove("show");
    }, 3000);
  }

  startAutoPlay() {
    if (!this.isAutoPlay) return;

    this.autoPlayInterval = setInterval(() => {
      let nextStep = this.currentStep + 1;
      if (nextStep > 5) nextStep = 1;
      this.goToStep(nextStep);
    }, 4000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  handleControlAction(action) {
    switch (action) {
      case "auto":
        this.isAutoPlay = true;
        this.startAutoPlay();
        break;
      case "manual":
        this.isAutoPlay = false;
        this.stopAutoPlay();
        break;
      case "reset":
        this.stopAutoPlay();
        this.goToStep(1);
        setTimeout(() => {
          if (this.isAutoPlay) this.startAutoPlay();
        }, 1000);
        break;
    }
  }
}

function waLink() {
  const num =
    window.LB_CONFIG && window.LB_CONFIG.whatsapp_number_international
      ? window.LB_CONFIG.whatsapp_number_international
      : "";
  if (!num) return "#";
  return `https://wa.me/${num}`;
}

function setLinkOrDisable(el, url) {
  if (!el) return;
  if (!url || url.trim() === "") {
    el.classList.add("disabled-link");
    el.removeAttribute("href");
    el.setAttribute("title", "Coming soon");
  } else {
    el.href = url;
    el.classList.remove("disabled-link");
    el.removeAttribute("title");
  }
}

// Mobile menu toggle
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const mobileLangBtn = document.getElementById("mobileLangBtn");
const desktopLangBtn = document.getElementById("langBtn");

function toggleMobileMenu() {
  const isExpanded = menuBtn.getAttribute("aria-expanded") === "true" || false;
  menuBtn.setAttribute("aria-expanded", !isExpanded);
  menuBtn.setAttribute("aria-label", !isExpanded ? "Close menu" : "Open menu");
  mobileMenu.classList.toggle("show", !isExpanded);

  // Toggle body scroll when menu is open
  document.body.style.overflow = !isExpanded ? "hidden" : "";
}

function closeMobileMenu() {
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "Open menu");
  mobileMenu.classList.remove("show");
  document.body.style.overflow = "";
}

// Toggle mobile menu
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Close menu when clicking on a link
  const mobileLinks = mobileMenu.querySelectorAll("a");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      closeMobileMenu();
    }
  });
}

// Sync language buttons
if (mobileLangBtn && desktopLangBtn) {
  function updateLanguageButtons() {
    const currentLang = document.documentElement.lang || "en";
    const newLang = currentLang === "en" ? "fr" : "en";
    mobileLangBtn.textContent = newLang.toUpperCase();
    desktopLangBtn.textContent = newLang.toUpperCase();
    document.documentElement.lang = newLang;
  }

  mobileLangBtn.addEventListener("click", updateLanguageButtons);
  if (desktopLangBtn) {
    desktopLangBtn.addEventListener("click", updateLanguageButtons);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // Initialize animated components
  if (document.getElementById("heroNetwork")) {
    new HeroNetworkAnimation();
  }

  if (document.querySelector(".process-section")) {
    new ProcessDiagram();
  }

  // socials
  const s =
    window.LB_CONFIG && window.LB_CONFIG.socials
      ? window.LB_CONFIG.socials
      : {};
  setLinkOrDisable(document.getElementById("ig"), s.instagram);
  setLinkOrDisable(document.getElementById("fb"), s.facebook);
  setLinkOrDisable(document.getElementById("ln"), s.linkedin);
  setLinkOrDisable(document.getElementById("yt"), s.youtube);

  // whatsapp floating
  const wa = document.getElementById("waBtn");
  if (wa) wa.href = waLink();

  // catalog
  const cat = document.getElementById("catalogBtn");
  if (cat && window.LB_CONFIG && window.LB_CONFIG.catalog_pdf_url) {
    cat.href = window.LB_CONFIG.catalog_pdf_url;
  }

  // contact form mailto
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const to =
        window.LB_CONFIG && window.LB_CONFIG.email_to
          ? window.LB_CONFIG.email_to
          : "";
      const data = new FormData(form);
      const name = data.get("name") || "";
      const company = data.get("company") || "";
      const email = data.get("email") || "";
      const phone = data.get("phone") || "";
      const subject = data.get("subject") || "";
      const message = data.get("message") || "";
      const body = [
        `Name: ${name}`,
        `Company: ${company}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        "",
        message,
      ].join("\n");
      const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, observerOptions);

  // Observe all cards and sections for animation
  document
    .querySelectorAll(".card, .feature-card, .product-card")
    .forEach((el) => {
      observer.observe(el);
    });
});
