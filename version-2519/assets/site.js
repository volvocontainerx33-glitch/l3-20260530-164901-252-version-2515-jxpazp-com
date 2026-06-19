(function () {
  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) return;
    var active = 0;
    function show(index) {
      active = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show((active + 1) % slides.length);
    }, 5600);
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    if (!cards.length) return;
    var input = document.querySelector('[data-search-input]');
    var category = 'all';
    var year = 'all';
    function norm(text) {
      return String(text || '').toLowerCase().trim();
    }
    function update() {
      var q = norm(input ? input.value : '');
      cards.forEach(function (card) {
        var text = norm([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category')
        ].join(' '));
        var okQ = !q || text.indexOf(q) !== -1;
        var okCategory = category === 'all' || card.getAttribute('data-category') === category;
        var okYear = year === 'all' || card.getAttribute('data-year') === year;
        card.classList.toggle('hidden-card', !(okQ && okCategory && okYear));
      });
    }
    if (input) {
      input.addEventListener('input', update);
    }
    document.querySelectorAll('[data-filter-category]').forEach(function (button) {
      button.addEventListener('click', function () {
        category = button.getAttribute('data-filter-category');
        document.querySelectorAll('[data-filter-category]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        update();
      });
    });
    document.querySelectorAll('[data-filter-year]').forEach(function (button) {
      button.addEventListener('click', function () {
        year = button.getAttribute('data-filter-year');
        document.querySelectorAll('[data-filter-year]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        update();
      });
    });
  }

  window.setupVideoPlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    var button = cover ? cover.querySelector('button') : null;
    var hlsInstance = null;
    if (!video || !cover || !options.url) return;
    function play() {
      cover.classList.add('hidden');
      if (!video.getAttribute('src')) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = options.url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(options.url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = options.url;
        }
      }
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    cover.addEventListener('click', play);
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  };

  window.setupSite = function () {
    setupMenu();
    setupHero();
    setupFilters();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.setupSite);
  } else {
    window.setupSite();
  }
})();
