// Mawar Template JS
(function(){
  const html = document.documentElement;
  const saved = localStorage.getItem('mawar-theme');
  if(saved==='dark') html.classList.add('dark');
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-theme-toggle]');
    if(t){ html.classList.toggle('dark'); localStorage.setItem('mawar-theme', html.classList.contains('dark')?'dark':'light'); }
  });

  // Filters
  const filterBar = document.querySelector('[data-filters]');
  if(filterBar){
    const items = Array.from(document.querySelectorAll('[data-item]'));
    filterBar.addEventListener('click', (e)=>{
      const b = e.target.closest('button[data-filter]');
      if(!b) return;
      filterBar.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const f = b.getAttribute('data-filter');
      items.forEach(it=>{
        const cat = it.getAttribute('data-item');
        it.style.display = (f==='all' || cat.includes(f)) ? '' : 'none';
      });
    });
  }

  // Lightbox
  const modal = document.querySelector('.modal');
  if(modal){
    document.addEventListener('click', (e)=>{
      const trigger = e.target.closest('[data-lightbox]');
      if(trigger){
        const src = trigger.getAttribute('data-lightbox');
        modal.querySelector('img').src = src;
        modal.classList.add('open');
      }
      if(e.target.classList.contains('modal')) modal.classList.remove('open');
    });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') modal.classList.remove('open'); });
  }

  // Demo ajax form
  document.addEventListener('submit', (e)=>{
    const form = e.target.closest('[data-ajax]'); if(!form) return;
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]'); btn.disabled = true; const prev = btn.textContent; btn.textContent = 'Sending...';
    setTimeout(()=>{ btn.disabled=false; btn.textContent = prev; form.reset(); alert('Thank you! (Demo)') }, 800);
  });
})();