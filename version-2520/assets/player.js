const Hls = window.Hls;
const players = document.querySelectorAll('.js-player');

players.forEach(function (player) {
  const video = player.querySelector('video');
  const overlay = player.querySelector('.player-overlay');
  const src = player.dataset.video;
  let ready = false;
  let hlsInstance = null;

  const prepare = function () {
    if (!video || !src || ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    } else {
      video.src = src;
    }
  };

  const play = function () {
    prepare();

    if (overlay) {
      overlay.classList.add('hidden');
    }

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!ready) {
        play();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
});
