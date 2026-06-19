(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var cover = player.querySelector("[data-player-cover]");
    var startButton = player.querySelector("[data-player-start]");
    var message = player.querySelector("[data-player-message]");
    var source = player.getAttribute("data-video");
    var hls = null;
    var initialized = false;

    function setMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      player.classList.add("has-message");
    }

    function initVideo() {
      if (initialized || !video || !source) {
        return;
      }

      initialized = true;

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
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("视频暂时无法播放，请稍后再试");
          }
        });
        return;
      }

      setMessage("视频暂时无法播放，请稍后再试");
    }

    function playVideo() {
      initVideo();
      if (!video) {
        return;
      }

      player.classList.add("is-playing");
      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          player.classList.remove("is-playing");
        });
      }
    }

    function toggleVideo() {
      if (!video) {
        return;
      }

      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (startButton) {
      startButton.addEventListener("click", playVideo);
    }

    if (cover) {
      cover.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", toggleVideo);
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove("is-playing");
        }
      });
      video.addEventListener("error", function () {
        setMessage("视频暂时无法播放，请稍后再试");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
