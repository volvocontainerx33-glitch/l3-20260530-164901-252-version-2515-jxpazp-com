(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs(".nav-toggle");
        var panel = qs(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = qs(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = qsa(".hero-slide", slider);
        var dots = qsa(".hero-dot", slider);
        var prev = qs(".hero-prev", slider);
        var next = qs(".hero-next", slider);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var grids = qsa(".filter-grid");
        grids.forEach(function (grid) {
            var section = grid.closest("section") || document;
            var input = qs(".filter-input", section);
            var year = qs(".filter-year", section);
            var sort = qs(".filter-sort", section);
            var cards = qsa(".movie-card", grid);

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var matchedKeyword = !keyword || text.indexOf(keyword) >= 0;
                    var matchedYear = !selectedYear || cardYear === selectedYear;
                    card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear));
                });
            }

            function applySort() {
                if (!sort) {
                    return;
                }
                var value = sort.value;
                var sorted = cards.slice();
                if (value === "year-desc") {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                    });
                }
                if (value === "year-asc") {
                    sorted.sort(function (a, b) {
                        return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
                    });
                }
                if (value === "title") {
                    sorted.sort(function (a, b) {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                    });
                }
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            if (sort) {
                sort.addEventListener("change", function () {
                    applySort();
                    apply();
                });
            }
        });
    }

    function buildCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"card-cover\" href=\"" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span>" + escapeHtml(movie.year) + "</span>" +
            "</a>" +
            "<div class=\"card-body\">" +
            "<a class=\"card-title\" href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a>" +
            "<p>" + escapeHtml(movie.description) + "</p>" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
            "<div class=\"card-tags\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearchPage() {
        var results = qs("#search-results");
        var status = qs("#search-status");
        var input = qs("#search-page-input");
        if (!results || !status || !window.MovieIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }
        if (!query) {
            status.textContent = "请输入关键词开始搜索。";
            return;
        }
        var lower = query.toLowerCase();
        var matched = window.MovieIndex.filter(function (movie) {
            return [
                movie.title,
                movie.region,
                movie.year,
                movie.genre,
                movie.description,
                (movie.tags || []).join(" ")
            ].join(" ").toLowerCase().indexOf(lower) >= 0;
        });
        status.textContent = "搜索 “" + query + "” 找到 " + matched.length + " 部相关影片";
        results.innerHTML = matched.map(buildCard).join("");
    }

    function initBackToTop() {
        var button = qs(".back-to-top");
        if (!button) {
            return;
        }
        window.addEventListener("scroll", function () {
            button.classList.toggle("is-visible", window.scrollY > 420);
        });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
        initSearchPage();
        initBackToTop();
    });
})();
