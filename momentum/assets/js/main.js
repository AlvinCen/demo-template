// Momentum – Event Template JS
(function(){
  const html = document.documentElement;
  const saved = localStorage.getItem('momentum-theme');
  if(saved==='dark') html.classList.add('dark');
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-theme-toggle]');
    if(t){ html.classList.toggle('dark'); localStorage.setItem('momentum-theme', html.classList.contains('dark')?'dark':'light'); }
  });

  // Countdown to next March 15, 09:00 local
  const cEl = document.querySelector('[data-countdown]');
  if(cEl){
    const now = new Date();
    const year = (now.getMonth()>2 || (now.getMonth()==2 && now.getDate()>15)) ? now.getFullYear()+1 : now.getFullYear();
    const target = new Date(year, 2, 15, 9, 0, 0);
    function tick(){
      const diff = target - new Date();
      const d = Math.max(0, Math.floor(diff/86400000));
      const h = Math.max(0, Math.floor(diff%86400000/3600000));
      const m = Math.max(0, Math.floor(diff%3600000/60000));
      const s = Math.max(0, Math.floor(diff%60000/1000));
      const nums = cEl.querySelectorAll('.n');
      if(nums.length>=4){ nums[0].textContent=d; nums[1].textContent=h; nums[2].textContent=m; nums[3].textContent=s; }
    }
    tick(); setInterval(tick, 1000);
  }

  // Tabs
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('.tab');
    if(!t) return;
    const tabs = t.parentElement.querySelectorAll('.tab');
    const panels = t.parentElement.nextElementSibling.querySelectorAll('.tabpanel');
    tabs.forEach((tab, i)=>{
      tab.classList.toggle('active', tab===t);
      panels[i].classList.toggle('active', tab===t);
    });
  });

  // Speaker modal
  const modal = document.querySelector('.modal');
  document.addEventListener('click', (e)=>{
    const open = e.target.closest('[data-speaker]');
    if(open && modal){
      const name = open.getAttribute('data-name') || 'Speaker';
      const bio = open.getAttribute('data-bio') || 'Bio goes here.';
      modal.querySelector('.dialog h3').textContent = name;
      modal.querySelector('.dialog p').textContent = bio;
      modal.classList.add('open');
    }
    if(e.target.classList.contains('modal')) modal?.classList.remove('open');
  });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') modal?.classList.remove('open'); });

  // Schedule filter (by track/day)
  const filter = document.querySelector('[data-sched-filter]');
  if(filter){
    filter.addEventListener('change', (e)=>{
      const v = e.target.value;
      document.querySelectorAll('[data-track]').forEach(row=>{
        row.style.display = (v==='all'||row.getAttribute('data-track')===v) ? '' : 'none';
      });
    });
  }

  // Demo ajax form
  document.addEventListener('submit', (e)=>{
    const form = e.target.closest('[data-ajax]'); if(!form) return;
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]'); btn.disabled = true; const prev = btn.textContent; btn.textContent = 'Sending...';
    setTimeout(()=>{ btn.disabled=false; btn.textContent = prev; form.reset(); alert('Thank you! (Demo)') }, 800);
  });
})();