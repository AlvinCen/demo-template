// Anggrek Dashboard JS
(function(){
  const html = document.documentElement;
  const saved = localStorage.getItem('anggrek-theme');
  if(saved==='light'){ html.classList.add('light'); }
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-theme-toggle]');
    if(btn){
      html.classList.toggle('light');
      localStorage.setItem('anggrek-theme', html.classList.contains('light') ? 'light' : 'dark');
    }
  });

  // Sidebar collapse (mobile)
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-sidebar-toggle]');
    if(t){ document.querySelector('.layout').classList.toggle('open'); }
  });

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

  // Modal
  const modal = document.querySelector('.modal');
  document.addEventListener('click', (e)=>{
    const openBtn = e.target.closest('[data-open-modal]');
    if(openBtn && modal){ modal.classList.add('open'); }
    if(e.target.classList.contains('modal')){ modal.classList.remove('open'); }
  });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') modal?.classList.remove('open'); });

  // Toast
  window.showToast = (msg)=>{
    let toast = document.querySelector('.toast');
    if(!toast){ toast = document.createElement('div'); toast.className='toast'; document.body.appendChild(toast); }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), 2000);
  };

  // Table filter
  const q = document.querySelector('[data-table-search]');
  if(q){
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    q.addEventListener('input', ()=>{
      const v = q.value.toLowerCase();
      rows.forEach(r=>{
        r.style.display = r.textContent.toLowerCase().includes(v) ? '' : 'none';
      });
    });
  }

  // Sparkline & Bars from data-* (SVG)
  function renderSparks(){
    document.querySelectorAll('[data-spark]').forEach(el=>{
      const data = JSON.parse(el.getAttribute('data-spark') || '[]');
      const w = el.clientWidth || 180, h = 48, p=6;
      const max = Math.max(...data), min = Math.min(...data);
      const scaleX = (w-2*p)/(data.length-1 || 1);
      const scaleY = (h-2*p)/(max - min || 1);
      const pts = data.map((v,i)=>[p+i*scaleX, h-p-(v-min)*scaleY]);
      const path = pts.map((p,i)=> (i?'L':'M')+p[0]+','+p[1]).join(' ');
      el.innerHTML = `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <path d="${path}" fill="none" stroke="url(#g)" stroke-width="2"/>
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#22c55e"/><stop offset="1" stop-color="#60a5fa"/></linearGradient></defs>
      </svg>`;
    });
    document.querySelectorAll('[data-bars]').forEach(el=>{
      const data = JSON.parse(el.getAttribute('data-bars') || '[]');
      const w = el.clientWidth || 180, h = 48, p=6;
      const max = Math.max(...data, 1);
      const bw = (w-2*p)/data.length - 4;
      let rects='';
      data.forEach((v,i)=>{
        const bh = (h-2*p) * (v/max);
        const x = p + i*((w-2*p)/data.length);
        const y = h-p-bh;
        rects += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3" fill="#60a5fa"/>`;
      });
      el.innerHTML = `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${rects}</svg>`;
    });
    document.querySelectorAll('[data-donut]').forEach(el=>{
      const val = parseFloat(el.getAttribute('data-donut') || '0');
      const r=30, c=2*Math.PI*r, off = c * (1 - Math.max(0, Math.min(1, val/100)));
      el.innerHTML = `<svg class="donut" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="${r}" stroke="rgba(96,165,250,.2)" stroke-width="10" fill="none"/>
        <circle cx="40" cy="40" r="${r}" stroke="url(#gd)" stroke-width="10" fill="none" stroke-dasharray="${c}" stroke-dashoffset="${off}" stroke-linecap="round"/>
        <defs><linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22c55e"/><stop offset="1" stop-color="#60a5fa"/></linearGradient></defs>
        <text x="40" y="44" text-anchor="middle" font-size="14" fill="currentColor">${Math.round(val)}%</text>
      </svg>`;
    });
  }
  window.addEventListener('load', renderSparks);
  window.addEventListener('resize', renderSparks);
})();