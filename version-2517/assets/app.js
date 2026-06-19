(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var toggle = qs("[data-menu-toggle]");
    var menu = qs("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
        dot.setAttribute("aria-pressed", i === current ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function initFilters() {
    qsa("[data-filter-panel]").forEach(function (panel) {
      var gridSelector = panel.getAttribute("data-grid");
      var grid = qs(gridSelector);
      if (!grid) {
        return;
      }

      var input = qs("[data-filter-input]", panel);
      var category = qs("[data-filter-category]", panel);
      var sort = qs("[data-filter-sort]", panel);
      var empty = qs("[data-empty-state]");
      var cards = qsa(".movie-card", grid);
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function apply() {
        var query = input ? normalize(input.value) : "";
        var categoryValue = category ? category.value : "";
        var visibleCards = [];

        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute("data-search"));
          var cardCategory = card.getAttribute("data-category") || "";
          var matchQuery = !query || searchText.indexOf(query) !== -1;
          var matchCategory = !categoryValue || cardCategory === categoryValue;
          var visible = matchQuery && matchCategory;

          card.classList.toggle("is-hidden", !visible);

          if (visible) {
            visibleCards.push(card);
          }
        });

        if (sort) {
          var mode = sort.value;
          visibleCards.sort(function (a, b) {
            if (mode === "views") {
              return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
            }
            if (mode === "year") {
              return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
            }
            if (mode === "date-asc") {
              return String(a.getAttribute("data-date")).localeCompare(String(b.getAttribute("data-date")));
            }
            return String(b.getAttribute("data-date")).localeCompare(String(a.getAttribute("data-date")));
          });
          visibleCards.forEach(function (card) {
            grid.appendChild(card);
          });
        }

        if (empty) {
          empty.classList.toggle("is-visible", visibleCards.length === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (category) {
        category.addEventListener("change", apply);
      }
      if (sort) {
        sort.addEventListener("change", apply);
      }

      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
