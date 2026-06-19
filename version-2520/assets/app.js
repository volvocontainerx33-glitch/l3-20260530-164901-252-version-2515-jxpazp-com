(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const opened = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const carousel = document.querySelector('[data-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    let index = 0;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const next = Number(dot.dataset.slide || 0);
        show(next);
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 6200);
  }

  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get('q');
  const searchInput = document.querySelector('.live-search');

  if (searchInput && queryValue) {
    searchInput.value = queryValue;
  }

  const grids = Array.from(document.querySelectorAll('.catalog-grid'));

  if (grids.length) {
    const cards = grids.flatMap(function (grid) {
      return Array.from(grid.querySelectorAll('.movie-card'));
    });

    const activeFilters = {};

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const applyFilters = function () {
      const term = normalize(searchInput ? searchInput.value : '');

      cards.forEach(function (card) {
        const searchable = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));

        const matchText = !term || searchable.includes(term);
        const matchFilters = Object.keys(activeFilters).every(function (key) {
          const expected = activeFilters[key];
          return !expected || expected === 'all' || normalize(card.dataset[key]) === normalize(expected);
        });

        card.classList.toggle('is-hidden', !(matchText && matchFilters));
      });
    };

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    document.querySelectorAll('.filter-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        const key = chip.dataset.filterKey || 'all';
        const value = chip.dataset.filterValue || 'all';
        const bar = chip.closest('.filter-bar');

        if (bar) {
          bar.querySelectorAll('.filter-chip').forEach(function (item) {
            item.classList.remove('active');
          });
        }

        chip.classList.add('active');

        if (value === 'all' && key === 'all') {
          Object.keys(activeFilters).forEach(function (filterKey) {
            delete activeFilters[filterKey];
          });
        } else if (value === 'all') {
          delete activeFilters[key];
        } else {
          activeFilters[key] = value;
        }

        applyFilters();
      });
    });

    applyFilters();
  }
})();
