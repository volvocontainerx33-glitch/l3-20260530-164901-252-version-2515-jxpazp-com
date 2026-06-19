(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  function normalize(text){
    return (text || '').toString().toLowerCase();
  }

  function setupFilterInput(input){
    if(!input) return;
    const cards = $$('[data-card="1"]', document);
    const counts = $$('[data-filter-count]', document);
    const empties = $$('[data-empty-state]', document);

    const apply = () => {
      const q = normalize(input.value.trim());
      let visible = 0;
      cards.forEach(card => {
        const hay = normalize(card.dataset.search || card.textContent);
        const hit = !q || hay.includes(q);
        card.style.display = hit ? '' : 'none';
        if(hit) visible++;
      });
      counts.forEach(el => el.textContent = visible);
      empties.forEach(el => el.style.display = visible ? 'none' : 'block');
    };

    input.addEventListener('input', apply);
    apply();
  }

  function setupCategoryButtons(){
    $$('.filter[data-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        const scope = btn.closest('[data-filter-scope]') || document;
        const q = btn.dataset.category || '';
        const input = $('[data-search-input]', scope);
        if(input){ input.value = q; input.dispatchEvent(new Event('input', {bubbles:true})); }
        $$('.filter[data-category]', scope).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  function setupHero(){
    const shell = $('[data-hero-shell]');
    const track = $('[data-hero-track]');
    if(!shell || !track) return;
    const slides = $$('.hero-slide', track);
    if(slides.length <= 1) return;
    let index = 0;
    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      $$('.hero-dot', shell).forEach((dot, i) => dot.classList.toggle('active', i === index));
    };
    const next = () => { index = (index + 1) % slides.length; update(); };
    let timer = setInterval(next, 5000);
    shell.addEventListener('mouseenter', () => clearInterval(timer));
    shell.addEventListener('mouseleave', () => timer = setInterval(next, 5000));
    $$('.hero-dot', shell).forEach((dot, i) => dot.addEventListener('click', () => { index = i; update(); }));
    const prev = $('[data-hero-prev]', shell);
    const nxt = $('[data-hero-next]', shell);
    prev && prev.addEventListener('click', () => { index = (index - 1 + slides.length) % slides.length; update(); });
    nxt && nxt.addEventListener('click', () => { index = (index + 1) % slides.length; update(); });
    update();
  }

  function setupPlayers(){
    $$('video[data-m3u8]').forEach(video => {
      const m3u8 = video.dataset.m3u8;
      const mp4 = video.dataset.mp4;
      if(m3u8 && window.Hls && Hls.isSupported && Hls.isSupported()){
        const hls = new Hls({
          maxBufferLength: 30,
          backBufferLength: 0,
          lowLatencyMode: false
        });
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        video.dataset.hlsBound = '1';
      } else if(mp4 && !video.getAttribute('src')) {
        video.src = mp4;
      }
      const box = video.closest('.player-shell');
      const btn = box && $('[data-play-button]', box);
      if(btn){
        btn.addEventListener('click', async () => {
          try { await video.play(); } catch(e) {}
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupFilterInput($('[data-search-input]'));
    setupCategoryButtons();
    setupHero();
    setupPlayers();
  });
})();
