import { H as Hls } from "./hls-dru42stk.js";

function bindPlayer(container) {
  var video = container.querySelector("video");
  var cover = container.querySelector(".player-cover");
  if (!video) {
    return;
  }
  var source = video.getAttribute("data-src");
  var loaded = false;

  function loadAndPlay() {
    if (!source) {
      return;
    }
    if (!loaded) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", loadAndPlay);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      loadAndPlay();
    }
  });
}

document.querySelectorAll(".player-panel").forEach(bindPlayer);
