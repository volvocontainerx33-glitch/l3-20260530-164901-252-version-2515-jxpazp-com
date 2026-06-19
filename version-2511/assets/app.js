
(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function bindMobileNav() {
    var toggle = qs('[data-nav-toggle]');
    var nav = qs('[data-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function bindSearch() {
    qsa('[data-search-form]').forEach(function (form) {
      var input = qs('input[type="search"]', form);
      var targetSelector = form.getAttribute('data-target');
      var empty = targetSelector ? qs(targetSelector + ' .search-result-empty') : null;
      var cards = targetSelector ? qsa(targetSelector + ' [data-card]') : [];
      var submit = function (e) {
        if (e) e.preventDefault();
        if (!input) return;
        var kw = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-keywords') || card.textContent || '').toLowerCase();
          var show = !kw || text.indexOf(kw) > -1;
          card.style.display = show ? '' : 'none';
          if (show) visible += 1;
        });
        if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
      };
      form.addEventListener('submit', submit);
      if (input) input.addEventListener('input', submit);
    });
  }

  function bindHeroCarousel() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) return;
    var track = qs('[data-hero-track]', carousel);
    var slides = qsa('.hero-slide', carousel);
    var dotsWrap = qs('[data-hero-dots]', carousel);
    if (!track || !slides.length || !dotsWrap) return;

    var index = 0;
    var dots = slides.map(function (_, i) {
      var btn = document.createElement('button');
      btn.className = 'hero-dot' + (i === 0 ? ' active' : '');
      btn.type = 'button';
      btn.setAttribute('aria-label', '切换到第 ' + (i + 1) + ' 张');
      btn.addEventListener('click', function () {
        go(i);
      });
      dotsWrap.appendChild(btn);
      return btn;
    });

    function go(next) {
      index = (next + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    var timer = setInterval(function () {
      go(index + 1);
    }, 4500);

    carousel.addEventListener('mouseenter', function () { clearInterval(timer); });
    carousel.addEventListener('mouseleave', function () {
      timer = setInterval(function () {
        go(index + 1);
      }, 4500);
    });
  }

  function bindPlayer() {
    qsa('[data-player-shell]').forEach(function (shell) {
      var video = qs('video', shell);
      var overlay = qs('[data-player-overlay]', shell);
      var button = qs('[data-player-toggle]', shell);
      if (!video || !button) return;
      var hlsSrc = video.getAttribute('data-hls');
      var mp4Src = video.getAttribute('data-mp4');

      function setPaused(paused) {
        shell.setAttribute('data-paused', paused ? 'true' : 'false');
        button.textContent = paused ? '播放预览' : '暂停预览';
      }

      setPaused(true);

      if (hlsSrc && mp4Src && !video.src) {
        video.src = mp4Src;
      }

      if (hlsSrc && video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSrc;
      }

      button.addEventListener('click', function () {
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
              video.src = mp4Src || video.src;
              video.play().catch(function () {});
            });
          }
          setPaused(false);
        } else {
          video.pause();
          setPaused(true);
        }
      });

      video.addEventListener('play', function () { setPaused(false); });
      video.addEventListener('pause', function () { setPaused(true); });
      video.addEventListener('ended', function () { setPaused(true); });

      if (overlay) {
        overlay.addEventListener('click', function () {
          button.click();
        });
      }
    });
  }

  function bindFilters() {
    qsa('[data-filter-group]').forEach(function (group) {
      var buttons = qsa('[data-filter]', group);
      var targetSel = group.getAttribute('data-target');
      var cards = targetSel ? qsa(targetSel + ' [data-card]') : [];
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var value = btn.getAttribute('data-filter');
          buttons.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          cards.forEach(function (card) {
            var tags = (card.getAttribute('data-tags') || '').toLowerCase();
            var year = (card.getAttribute('data-year') || '').toLowerCase();
            var genre = (card.getAttribute('data-genre') || '').toLowerCase();
            var region = (card.getAttribute('data-region') || '').toLowerCase();
            var show = !value || value === 'all';
            if (!show) {
              var token = value.toLowerCase();
              show = tags.indexOf(token) > -1 || genre.indexOf(token) > -1 || region.indexOf(token) > -1 || year.indexOf(token) > -1;
            }
            card.style.display = show ? '' : 'none';
          });
        });
      });
    });
  }

  bindMobileNav();
  bindSearch();
  bindHeroCarousel();
  bindPlayer();
  bindFilters();
})();
