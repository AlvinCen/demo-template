(() => {
  const base = '../_shared/img/';
  const cats = ['jobs','marketplace','portfolio','real-estate','blog-&-magazine','saas-dashboard','education','food-&-restaurant','travel','events'];
  const sizes = [['hero',1600,900],['wide',1400,800],['card',1000,700],['thumb',700,500]];
  const list=[]; cats.forEach((c,i)=>sizes.forEach(([n,w,h])=>list.push(${String(i+1).padStart(2,'0')}---x.jpg)));
  const pick = (arr)=>arr[Math.floor(Math.random()*arr.length)];
  const choose = (w)=> w>=1100? pick(list.filter(f=>f.includes('-hero-')))
                        : w>=900? pick(list.filter(f=>f.includes('-wide-')))
                        : w>=700? pick(list.filter(f=>f.includes('-card-')))
                                : pick(list.filter(f=>f.includes('-thumb-')));
  const badSrc = (s)=> !s || /placeholder|dummy|blank|temp|no[-_]?image|^data:image\/svg\+xml|\.svg(\?|$)/i.test(s);

  function setImg(el, w){
    const file = base + choose(w || el.getBoundingClientRect().width || 800);
    el.src = file; el.loading = el.loading || 'lazy'; el.decoding='async';
    el.style.objectFit = el.style.objectFit || 'cover';
  }
  function swapInlineSVG(){
    document.querySelectorAll('svg').forEach(svg=>{
      const w = svg.getBoundingClientRect().width, h = svg.getBoundingClientRect().height;
      if (Math.max(w,h) >= 200) {
        const img = new Image();
        img.style.width='100%'; img.style.height='100%'; img.style.display='block'; img.style.objectFit='cover';
        setImg(img, w);
        svg.replaceWith(img);
      }
    });
  }
  function patchPictures(){
    document.querySelectorAll('picture').forEach(pic=>{
      let img = pic.querySelector('img');
      if(!img){ img = new Image(); pic.appendChild(img); }
      setImg(img, pic.getBoundingClientRect().width);
      pic.querySelectorAll('source').forEach(s=>s.remove());
    });
  }
  function patchBackgrounds(){
    const sel = ['[style*=\"background-image\"]','.hero','.banner','.cover','.bg-image','.thumb','.media'];
    document.querySelectorAll(sel.join(',')).forEach(el=>{
      const bg = getComputedStyle(el).backgroundImage || '';
      if (!bg || /placeholder|data:image\/svg\+xml|none/i.test(bg)) {
        const w = el.getBoundingClientRect().width || 1200;
        const file = base + choose(w);
        el.style.backgroundImage = url();
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.borderRadius = el.style.borderRadius || '12px';
        el.style.minHeight = el.style.minHeight || '220px';
      }
    });
  }
  function patchImgs(){
    document.querySelectorAll('img').forEach(img=>{
      const src = img.getAttribute('src')||'';
      const large = (img.clientWidth||0) >= 220;
      const tiny = img.naturalWidth && img.naturalWidth <= 5;
      if (badSrc(src) || tiny || large) {
        img.addEventListener('error', ()=>setImg(img), {once:true});
        if (badSrc(src) || tiny) setImg(img);
      }
    });
    document.querySelectorAll('img[data-src],img[data-original]').forEach(img=>{
      if(!img.getAttribute('src')) img.setAttribute('src', img.getAttribute('data-src')||img.getAttribute('data-original'));
    });
  }
  function run(root=document){ patchImgs(); patchPictures(); swapInlineSVG(); patchBackgrounds(); }
  window.addEventListener('DOMContentLoaded', ()=>run());
  new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{ if(n.nodeType===1) run(n); })))
    .observe(document.documentElement,{childList:true,subtree:true});
})();
