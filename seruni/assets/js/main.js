// Seruni Template JS
(function(){
  const html = document.documentElement;
  const saved = localStorage.getItem('seruni-theme');
  if(saved === 'dark') html.classList.add('dark');
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-theme-toggle]');
    if(t){
      html.classList.toggle('dark');
      localStorage.setItem('seruni-theme', html.classList.contains('dark') ? 'dark' : 'light');
    }
  });

  // Reading progress bar
  const bar = document.querySelector('.readbar');
  if(bar){
    const onScroll = ()=>{
      const el = document.querySelector('article');
      if(!el){ bar.style.width = '0%'; return; }
      const rect = el.getBoundingClientRect();
      const top = Math.max(0, -rect.top);
      const h = el.scrollHeight - window.innerHeight;
      const p = Math.min(100, Math.max(0, (top/h)*100));
      bar.style.width = p + '%';
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  // Build table of contents
  const toc = document.querySelector('[data-toc]');
  const article = document.querySelector('article');
  if(toc && article){
    const headers = article.querySelectorAll('h2, h3');
    const ul = document.createElement('ul');
    headers.forEach(h=>{
      if(!h.id){ h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-'); }
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      ul.appendChild(li);
    });
    toc.appendChild(ul);
  }

  // Fake search (demo)
  const form = document.querySelector('[data-search]');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const q = form.querySelector('input')?.value || '';
      location.href = 'search.html?q=' + encodeURIComponent(q);
    });
  }
})();