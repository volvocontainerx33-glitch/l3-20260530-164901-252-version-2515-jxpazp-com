(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function initCoverFallbacks() {
    document.querySelectorAll('[data-cover-box] img, .hero-image img, .detail-backdrop img').forEach(function (image) {
      image.addEventListener('error', function () {
        var box = image.closest('[data-cover-box]');
        if (box) {
          box.classList.add('is-missing');
        } else {
          image.style.opacity = '0';
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (slides.length > 1) {
      start();
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }
  }

  function initLocalFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }

    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function applyFilters() {
      var keyword = (keywordInput.value || '').trim().toLowerCase();
      var type = typeSelect.value || '';
      var region = regionSelect.value || '';

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matchesKeyword = !keyword || title.indexOf(keyword) !== -1 || card.textContent.toLowerCase().indexOf(keyword) !== -1;
        var matchesType = !type || cardType === type;
        var matchesRegion = !region || cardRegion === region;
        card.classList.toggle('is-hidden', !(matchesKeyword && matchesType && matchesRegion));
      });
    }

    [keywordInput, typeSelect, regionSelect].forEach(function (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    });
  }

  function initSearchPage() {
    var input = document.getElementById('site-search-input');
    var button = document.getElementById('site-search-button');
    var results = document.getElementById('site-search-results');

    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function render(query) {
      var text = (query || '').trim().toLowerCase();
      var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category].join(' ').toLowerCase();
        return !text || haystack.indexOf(text) !== -1;
      }).slice(0, 80);

      if (!matches.length) {
        results.innerHTML = '<article class="search-result-card"><h2>没有找到匹配影片</h2><p>可以尝试输入年份、地区、类型或更短的片名关键词。</p></article>';
        return;
      }

      results.innerHTML = matches.map(function (movie) {
        return [
          '<article class="search-result-card">',
          '  <h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
          '  <p>' + escapeHtml(movie.oneLine) + '</p>',
          '  <div class="ranking-meta">',
          '    <span>' + escapeHtml(movie.year) + '</span>',
          '    <span>' + escapeHtml(movie.region) + '</span>',
          '    <span>' + escapeHtml(movie.type) + '</span>',
          '    <span>' + escapeHtml(movie.category) + '</span>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    input.addEventListener('input', function () {
      render(input.value);
    });

    if (button) {
      button.addEventListener('click', function () {
        render(input.value);
      });
    }

    render(initialQuery);
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-button]');
      var src = player.getAttribute('data-src') || (video && video.getAttribute('data-video-src'));
      var loaded = false;

      if (!video || !button || !src) {
        return;
      }

      function playVideo() {
        if (loaded) {
          video.play();
          player.classList.add('is-playing');
          return;
        }

        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
            player.classList.add('is-playing');
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              player.classList.remove('is-playing');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', function () {
            video.play();
            player.classList.add('is-playing');
          }, { once: true });
        } else {
          video.src = src;
          video.play();
          player.classList.add('is-playing');
        }
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initCoverFallbacks();
    initHero();
    initLocalFilters();
    initSearchPage();
    initPlayers();
  });
}());
