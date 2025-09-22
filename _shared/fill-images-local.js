(() => {
  const base = '../_shared/img/';
  const cats = ['jobs','marketplace','portfolio','real-estate','blog-&-magazine','saas-dashboard','education','food-&-restaurant','travel','events'];
  const sizes = [
    ['hero',1600,900],['wide',1400,800],['card',1000,700],['thumb',700,500]
  ];
  const fileList = []; // prebuild semua nama file
  cats.forEach((c, i) => {
    const n = String(i+1).padStart(2,'0');
    sizes.forEach(([name,w,h]) => fileList.push(${n}---x.jpg));
  });
  const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
  const chooseByWidth = (w) => {
    if (w >= 1100) return pick(fileList.filter(f=>f.includes('-hero-')));
    if (w >= 900)  return pick(fileList.filter(f=>f.includes('-wide-')));
    if (w >= 700)  return pick(fileList.filter(f=>f.includes('-card-')));
    return           pick(fileList.filter(f=>f.includes('-thumb-')));
  };
  const badSrc = (s) => !s || /placeholder|dummy|blank|temp|no[-_]?image|^data:image\/svg\+xml|\.svg(\?|$)/i.test(s);

  function swapImg(img){
    const w = img.getBoundingClientRect().width || parseInt(img.getAttribute('width')||800);
    const f = chooseByWidth(w);
    img.src = base + f;
    img.loading = img.loading || 'lazy';
    img.decoding = 'async';
    img.style.objectFit = img.style.objectFit || 'cover';
  }

  function processImgs(root=document){
    root.querySelectorAll('img').forEach(img=>{
      const src = img.getAttribute('src') || '';
      const large = (img.clientWidth||0) >= 220;
      const tiny  = img.naturalWidth && img.naturalWidth <= 5;
      if (badSrc(src) || tiny || large) {
        img.addEventListener('error', ()=>swapImg(img), {once:true});
        if (badSrc(src) || tiny) swapImg(img);
      }
    });

    // Lazy: data-src / data-original
    root.querySelectorAll('img[data-src], img[data-original]').forEach(img=>{
      if (!img.getAttribute('src')) img.setAttribute('src', img.getAttribute('data-src') || img.getAttribute('data-original'));
    });

    // Background images
    root.querySelectorAll('[style*="background"], .hero, .banner, .cover, .bg-image, .card .thumb')
      .forEach(el=>{
        const bg = getComputedStyle(el).backgroundImage || '';
        if (!bg || /placeholder|data:image\/svg\+xml|none/i.test(bg)) {
          const w = el.getBoundingClientRect().width || 1200;
          const f = chooseByWidth(w);
          el.style.backgroundImage = url();
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
        }
      });
  }

  window.addEventListener('DOMContentLoaded', ()=>processImgs());
  // Observe node yang muncul belakangan (lazy rendering)
  new MutationObserver(muts=>{
    muts.forEach(m=>m.addedNodes.forEach(n=>{
      if(n.nodeType===1) processImgs(n);
    }));
  }).observe(document.documentElement,{childList:true,subtree:true});
})();
