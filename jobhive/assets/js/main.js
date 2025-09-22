// JobHive – Job Board JS
(function(){
  const html = document.documentElement;
  const saved = localStorage.getItem('jh-theme');
  if(saved==='dark') html.classList.add('dark');
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-theme-toggle]');
    if(t){ html.classList.toggle('dark'); localStorage.setItem('jh-theme', html.classList.contains('dark')?'dark':'light'); }
  });

  // Storage keys
  const JOBS='jh_jobs', APPS='jh_apps', SAVED='jh_saved', PROFILE='jh_profile';
  const get=(k)=>JSON.parse(localStorage.getItem(k)||'[]');
  const set=(k,v)=>localStorage.setItem(k, JSON.stringify(v));

  // Seed jobs if empty
  (function seed(){
    if(get(JOBS).length>0) return;
    const jobs=[
      {id:'J-101', title:'Frontend Engineer', company:'PixelCraft', location:'Jakarta, ID', type:'Full-time', remote:'Remote-friendly', category:'Engineering', salaryMin:1200, salaryMax:2000, currency:'USD', tags:['React','TypeScript','UI'], posted:'2025-09-05', exp:'Mid'},
      {id:'J-102', title:'Product Manager', company:'ShipIt', location:'Bandung, ID', type:'Full-time', remote:'Hybrid', category:'Product', salaryMin:1500, salaryMax:2500, currency:'USD', tags:['Roadmap','Agile','Stakeholders'], posted:'2025-09-07', exp:'Senior'},
      {id:'J-103', title:'UI/UX Designer', company:'Designify', location:'Remote', type:'Contract', remote:'Remote', category:'Design', salaryMin:1000, salaryMax:1800, currency:'USD', tags:['Figma','Design System','Prototyping'], posted:'2025-09-10', exp:'Mid'},
      {id:'J-104', title:'Data Analyst', company:'Dataverse', location:'Yogyakarta, ID', type:'Part-time', remote:'Onsite', category:'Data', salaryMin:800, salaryMax:1200, currency:'USD', tags:['SQL','Python','BI'], posted:'2025-09-12', exp:'Junior'},
      {id:'J-105', title:'DevOps Engineer', company:'CloudKita', location:'Surabaya, ID', type:'Full-time', remote:'Remote', category:'Engineering', salaryMin:1600, salaryMax:2600, currency:'USD', tags:['AWS','Kubernetes','CI/CD'], posted:'2025-09-15', exp:'Senior'}
    ];
    set(JOBS, jobs);
  })();

  // Helpers
  const money=(n,c)=> (c||'USD')+' '+Math.round(n).toLocaleString();
  const qparams=()=> new URLSearchParams(location.search);

  // ---------- Landing popular ----------
  function renderPopular(){
    const wrap=document.querySelector('[data-popular]'); if(!wrap) return;
    const jobs=get(JOBS).slice(0,3);
    wrap.innerHTML = jobs.map(j=>`<article class="card job">
      <div class="body">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <strong><a style="text-decoration:none;color:inherit" href="job.html?id=${j.id}">${j.title}</a></strong>
          <span class="badge">${j.type}</span>
        </div>
        <div class="meta">${j.company} • ${j.location} • ${j.remote}</div>
        <div class="job salary">${money(j.salaryMin,j.currency)} – ${money(j.salaryMax,j.currency)}</div>
      </div>
    </article>`).join('');
  }
  renderPopular();

  // ---------- Jobs list ----------
  function renderJobs(){
    const wrap=document.querySelector('[data-jobs]'); if(!wrap) return;
    const p=qparams();
    const q=(p.get('q')||'').toLowerCase();
    const loc=(p.get('location')||'');
    const type=(p.get('type')||'');
    const cat=(p.get('category')||'');
    const exp=(p.get('exp')||'');
    const min=parseFloat(p.get('min')||'0'); const max=parseFloat(p.get('max')||'1e9');

    let list=get(JOBS).filter(j=>(!q || (j.title+' '+j.company+' '+j.tags.join(' ')).toLowerCase().includes(q))
      && (!loc || j.location.toLowerCase().includes(loc.toLowerCase()))
      && (!type || j.type===type || j.remote===type)
      && (!cat || j.category===cat)
      && (!exp || j.exp===exp)
      && ((j.salaryMin>=min) && (j.salaryMax<=max)));

    list.sort((a,b)=>b.posted.localeCompare(a.posted));

    const saved=new Set(get(SAVED));
    wrap.innerHTML = list.map(j=>{
      const isSaved=saved.has(j.id);
      return `<article class="card job">
        <div class="body">
          <div style="display:flex; justify-content:space-between; align-items:center">
            <strong><a style="text-decoration:none;color:inherit" href="job.html?id=${j.id}">${j.title}</a></strong>
            <div style="display:flex; gap:8px; align-items:center">
              <span class="badge">${j.type}</span>
              <button class="btn ghost" data-save="${j.id}">${isSaved?'♥ Saved':'♡ Save'}</button>
            </div>
          </div>
          <div class="meta">${j.company} • ${j.location} • ${j.remote} • ${j.category} • ${j.tags.join(', ')}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px">
            <div class="job salary">${money(j.salaryMin,j.currency)} – ${money(j.salaryMax,j.currency)}</div>
            <a class="btn" href="job.html?id=${j.id}">View</a>
          </div>
        </div>
      </article>`;
    }).join('') || '<p>No jobs found.</p>';
  }
  renderJobs();

  document.querySelector('[data-filters]')?.addEventListener('input', (e)=>{
    const p=new URLSearchParams(new FormData(e.currentTarget)).toString();
    history.replaceState(null,'','?'+p); renderJobs();
  });
  document.addEventListener('click',(e)=>{
    const s=e.target.closest('[data-save]'); if(!s) return;
    const id=s.getAttribute('data-save'); const setSaved=new Set(get(SAVED)); setSaved.has(id)?setSaved.delete(id):setSaved.add(id); set(SAVED,[...setSaved]); renderJobs(); renderSaved();
  });

  // ---------- Job detail ----------
  function renderJob(){
    const wrap=document.querySelector('[data-job]'); if(!wrap) return;
    const id=qparams().get('id')||'J-101'; const j=get(JOBS).find(x=>x.id===id)||get(JOBS)[0];
    const isSaved=new Set(get(SAVED)).has(j.id);
    wrap.innerHTML=`<div class="grid cols-2">
      <section>
        <div class="badge">Posted ${j.posted}</div>
        <h1 style="margin:6px 0 0">${j.title}</h1>
        <div class="meta">${j.company} • ${j.location} • ${j.remote} • ${j.type} • ${j.exp}</div>
        <p style="margin-top:8px">We are looking for a passionate ${j.title} to join our team at ${j.company}. You will work closely with cross-functional teams to deliver impact.</p>
        <ul>
          <li>Requirements: ${j.tags.join(', ')}</li>
          <li>Category: ${j.category}</li>
        </ul>
        <div class="card"><div class="body"><strong>Compensation</strong><div>${money(j.salaryMin,j.currency)} – ${money(j.salaryMax,j.currency)} / month</div></div></div>
      </section>
      <aside class="card"><div class="body">
        <div style="display:flex; gap:8px; flex-wrap:wrap">
          <button class="btn" data-apply="${j.id}">Apply now</button>
          <button class="btn ghost" data-save="${j.id}">${isSaved?'♥ Saved':'♡ Save'}</button>
        </div>
        <form data-apply-form style="margin-top:10px; display:none">
          <div class="grid cols-2">
            <div><label>Name</label><input class="input" name="name" required/></div>
            <div><label>Email</label><input class="input" type="email" name="email" required/></div>
          </div>
          <div style="margin-top:8px"><label>Cover letter</label><textarea class="input" rows="4" name="cover" required></textarea></div>
          <button class="btn" style="margin-top:8px">Submit</button>
        </form>
      </div></aside>
    </div>`;
    const btn=document.querySelector('[data-apply]'); const form=document.querySelector('[data-apply-form]');
    if(btn && form){ btn.addEventListener('click',()=>{ form.style.display = form.style.display==='none'?'block':'none'; }); }
    form?.addEventListener('submit',(e)=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(form).entries());
      const apps=get(APPS); apps.unshift({id:'A-'+Math.floor(Math.random()*1e6), jobId:j.id, title:j.title, company:j.company, date:new Date().toISOString().slice(0,10), name:data.name, email:data.email, status:'Submitted'}); set(APPS,apps);
      // Save profile for Candidate page
      localStorage.setItem(PROFILE, JSON.stringify({name:data.name, email:data.email}));
      alert('Application submitted (demo)');
      form.reset(); form.style.display='none';
    });
  }
  renderJob();

  // ---------- Saved jobs page ----------
  function renderSaved(){
    const wrap=document.querySelector('[data-saved]'); if(!wrap) return;
    const saved=new Set(get(SAVED)); const list=get(JOBS).filter(j=>saved.has(j.id));
    wrap.innerHTML=list.map(j=>`<tr><td>${j.title}</td><td>${j.company}</td><td>${j.location}</td><td>${j.type}</td><td style="text-align:right">${money(j.salaryMin,j.currency)} – ${money(j.salaryMax,j.currency)}</td></tr>`).join('') || '<tr><td colspan="5">No saved jobs.</td></tr>';
  }
  renderSaved();

  // ---------- Post a Job ----------
  function renderPostJob(){
    const form=document.querySelector('[data-post]'); if(!form) return;
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const d=Object.fromEntries(new FormData(form).entries());
      const jobs=get(JOBS);
      const id='J-'+Math.floor(Math.random()*1e6);
      const tags=(d.tags||'').split(',').map(s=>s.trim()).filter(Boolean);
      jobs.unshift({id, title:d.title, company:d.company, location:d.location||'Remote', type:d.type, remote:d.remote||'Remote', category:d.category, salaryMin:parseFloat(d.salaryMin||'0'), salaryMax:parseFloat(d.salaryMax||'0'), currency:d.currency||'USD', tags, posted:new Date().toISOString().slice(0,10), exp:d.exp||'Mid'});
      set(JOBS,jobs);
      alert('Job posted (demo). It now appears in Jobs.');
      form.reset();
      window.location.href='jobs.html';
    });
  }
  renderPostJob();

  // ---------- Employer dashboard ----------
  function renderEmployer(){
    const wrap=document.querySelector('[data-employer]'); if(!wrap) return;
    const jobs=get(JOBS).slice(0,15); // demo: show recent jobs as "yours"
    const apps=get(APPS);
    wrap.innerHTML = jobs.map(j=>{
      const count=apps.filter(a=>a.jobId===j.id).length;
      return `<tr><td>${j.title}</td><td>${j.company}</td><td>${j.location}</td><td>${j.type}</td><td>${count}</td><td style="text-align:right"><a class="btn ghost" href="job.html?id=${j.id}">View</a></td></tr>`;
    }).join('') || '<tr><td colspan="6">No jobs yet.</td></tr>';
  }
  renderEmployer();

  // ---------- Candidate dashboard ----------
  function renderCandidate(){
    const profileWrap=document.querySelector('[data-profile]'); const appsWrap=document.querySelector('[data-apps]');
    if(!profileWrap && !appsWrap) return;
    const profile=JSON.parse(localStorage.getItem(PROFILE)||'{}');
    profileWrap.innerHTML = `<div class="card"><div class="body"><h3>Profile</h3><div>Name: <strong>${profile.name||'-'}</strong></div><div>Email: <strong>${profile.email||'-'}</strong></div><form data-save-profile style="margin-top:8px" class="grid cols-2"><input class="input" name="name" placeholder="Name" value="${profile.name||''}"/><input class="input" name="email" placeholder="Email" value="${profile.email||''}"/><button class="btn" style="margin-top:8px">Save</button></form></div></div>`;
    const apps=get(APPS).filter(a=>!profile.email || a.email===profile.email);
    appsWrap.innerHTML = apps.map(a=>`<tr><td>${a.id}</td><td>${a.title}</td><td>${a.company}</td><td>${a.date}</td><td>${a.status}</td><td style="text-align:right"><a class="btn ghost" href="job.html?id=${a.jobId}">Job</a></td></tr>`).join('') || '<tr><td colspan="6">No applications.</td></tr>';
    document.querySelector('[data-save-profile]')?.addEventListener('submit',(e)=>{
      e.preventDefault(); const d=Object.fromEntries(new FormData(e.currentTarget).entries()); localStorage.setItem(PROFILE, JSON.stringify({name:d.name, email:d.email})); alert('Profile saved'); renderCandidate();
    });
  }
  renderCandidate();

  // Dummy AJAX
  document.addEventListener('submit', (e)=>{
    const f = e.target.closest('[data-ajax]'); if(!f) return; e.preventDefault(); alert('Saved! (Demo)'); f.reset();
  });
})();