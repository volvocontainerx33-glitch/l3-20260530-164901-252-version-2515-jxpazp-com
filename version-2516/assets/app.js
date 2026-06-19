(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var previous = document.querySelector(".hero-arrow.prev");
    var next = document.querySelector(".hero-arrow.next");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function startAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5000);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startAutoPlay();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(index - 1);
        startAutoPlay();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startAutoPlay();
      });
    }

    showSlide(0);
    startAutoPlay();

    var localSearch = document.querySelector("[data-local-search]");
    if (localSearch) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      localSearch.addEventListener("input", function () {
        var value = localSearch.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          card.style.display = text.indexOf(value) === -1 ? "none" : "";
        });
      });
    }
  });
})();
