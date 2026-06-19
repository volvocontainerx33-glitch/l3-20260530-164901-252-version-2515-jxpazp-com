(() => {
  const mobileButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach((hero) => {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const restart = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5000);
    };

    prev?.addEventListener('click', () => {
      show(index - 1);
      restart();
    });

    next?.addEventListener('click', () => {
      show(index + 1);
      restart();
    });

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        show(dotIndex);
        restart();
      });
    });

    restart();
  });

  const filterInput = document.querySelector('[data-filter-input]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const emptyState = document.querySelector('[data-empty-state]');
  const chips = Array.from(document.querySelectorAll('[data-filter-chip]'));

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const applyFilter = (rawValue) => {
    const value = normalize(rawValue);
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize(card.dataset.search);
      const shouldShow = !value || haystack.includes(value);
      card.classList.toggle('is-hidden', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  };

  if (filterInput && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query) {
      filterInput.value = query;
      applyFilter(query);
    }

    filterInput.addEventListener('input', () => {
      applyFilter(filterInput.value);
      chips.forEach((chip) => chip.classList.remove('is-active'));
    });

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const value = chip.dataset.filterChip || '';
        chips.forEach((item) => item.classList.remove('is-active'));
        chip.classList.add('is-active');
        filterInput.value = value === '全部' ? '' : value;
        applyFilter(filterInput.value);
      });
    });
  }

  document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');
    const source = player.dataset.src;
    let prepared = false;
    let hls = null;

    const prepare = () => {
      if (prepared || !video || !source) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    };

    const playVideo = () => {
      prepare();
      player.classList.add('is-playing');
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          player.classList.remove('is-playing');
        });
      }
    };

    overlay?.addEventListener('click', playVideo);

    video?.addEventListener('play', () => {
      player.classList.add('is-playing');
    });

    video?.addEventListener('pause', () => {
      if (video.currentTime === 0) {
        player.classList.remove('is-playing');
      }
    });

    video?.addEventListener('ended', () => {
      player.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
