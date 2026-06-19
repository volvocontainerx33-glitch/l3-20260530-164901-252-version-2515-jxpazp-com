(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector(".hero-slider");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var active = 0;
    if (!slides.length) {
      return;
    }
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
      });
    }
    window.setInterval(function () {
      show(active + 1);
    }, 5000);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initFilters() {
    var root = document.querySelector("[data-filter-root]");
    if (!root) {
      return;
    }
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
    var search = root.querySelector(".js-search");
    var region = root.querySelector(".js-region");
    var type = root.querySelector(".js-type");
    var year = root.querySelector(".js-year");
    var empty = root.querySelector(".no-result");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && search) {
      search.value = q;
    }
    function apply() {
      var keyword = normalize(search && search.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var y = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-desc"));
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (r && normalize(card.getAttribute("data-region")) !== r) {
          ok = false;
        }
        if (t && normalize(card.getAttribute("data-type")) !== t) {
          ok = false;
        }
        if (y && normalize(card.getAttribute("data-year")) !== y) {
          ok = false;
        }
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-hidden", visible !== 0);
      }
    }
    [search, region, type, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.setupPlayer = function (url) {
    ready(function () {
      var video = document.getElementById("mainVideo");
      var layer = document.getElementById("playLayer");
      if (!video || !url) {
        return;
      }
      var prepared = false;
      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }
      function play() {
        prepare();
        if (layer) {
          layer.classList.add("is-hidden");
        }
        video.controls = true;
        var action = video.play();
        if (action && action.catch) {
          action.catch(function () {});
        }
      }
      if (layer) {
        layer.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
