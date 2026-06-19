window.SitePlayer = (function () {
    function mount(options) {
        var video = document.getElementById(options.videoId);
        var cover = document.getElementById(options.coverId);
        var playButton = document.getElementById(options.playButtonId);
        var source = options.source;
        var hls = null;
        var prepared = false;
        var requestedPlay = false;

        if (!video || !source) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (requestedPlay) {
                        playVideo();
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        video.setAttribute("data-state", "error");
                    }
                });
                return;
            }
            video.src = source;
        }

        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }

        function showCover() {
            if (cover && video.paused && video.currentTime === 0) {
                cover.classList.remove("is-hidden");
            }
        }

        function playVideo() {
            hideCover();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    window.setTimeout(function () {
                        video.play().catch(function () {});
                    }, 350);
                });
            }
        }

        function start() {
            requestedPlay = true;
            prepare();
            playVideo();
        }

        if (playButton) {
            playButton.addEventListener("click", start);
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("play", hideCover);
        video.addEventListener("pause", showCover);
        video.addEventListener("ended", function () {
            requestedPlay = false;
            showCover();
        });
        prepare();
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    return {
        mount: mount
    };
})();
