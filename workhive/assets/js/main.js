// WorkHive – Job Board JS
(function(){
  const html = document.documentElement;
  const saved = localStorage.getItem('workhive-theme');
  if(saved==='dark') html.classList.add('dark');
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-theme-toggle]');
    if(t){ html.classList.toggle('dark'); localStorage.setItem('workhive-theme', html.classList.contains('dark')?'dark':'light'); }
  });

  // localStorage helpers
  const SAVED='wh_saved', APPS='wh_apps', POSTED='wh_posted';
  const get = (k)=>JSON.parse(localStorage.getItem(k)||'[]');
  const set = (k,v)=>localStorage.setItem(k, JSON.stringify(v));
  const id = ()=>'J-'+Math.floor(Math.random()*1e6);
  const money = (n)=>'$'+(Math.round(n*100)/100).toFixed(2);

  // Save job / Apply job
  document.addEventListener('click', (e)=>{
    const s = e.target.closest('[data-save]');
    if(s){
      const job = JSON.parse(s.getAttribute('data-save'));
      const list = get(SAVED);
      if(!list.find(j=>j.id===job.id)){ list.push(job); set(SAVED, list); alert('Saved.'); }
    }
    const a = e.target.closest('[data-apply]');
    if(a){
      const job = JSON.parse(a.getAttribute('data-apply'));
      const apps = get(APPS);
      if(!apps.find(j=>j.id===job.id)){ apps.push({...job, status:'applied'}); set(APPS, apps); alert('Applied (demo).'); }
    }
  });

  // Render saved jobs table
  function renderSaved(){
    const el = document.querySelector('[data-saved]'); if(!el) return;
    const rows = get(SAVED).map(j=>`<tr><td>${j.title}</td><td>${j.company}</td><td>${j.type}</td><td>${j.location}</td></tr>`).join('') || '<tr><td colspan="4">No saved jobs.</td></tr>';
    el.innerHTML = rows;
  }
  renderSaved();

  // Render applications
  function renderApps(){
    const el = document.querySelector('[data-apps]'); if(!el) return;
    const rows = get(APPS).map(j=>`<tr><td>${j.title}</td><td>${j.company}</td><td>${j.location}</td><td>${j.status}</td></tr>`).join('') || '<tr><td colspan="4">No applications yet.</td></tr>';
    el.innerHTML = rows;
  }
  renderApps();

  // Jobs page: render posted jobs + filter
  function renderJobs(){
    const wrap = document.querySelector('[data-jobs]'); if(!wrap) return;
    const posted = get(POSTED);
    const seed = [
      {id:'J-101', title:'Frontend Engineer', company:'Acme', type:'Full-time', location:'Jakarta', salary:1200},
      {id:'J-102', title:'Product Manager', company:'North', type:'Remote', location:'Bandung', salary:1500},
      {id:'J-103', title:'UI/UX Designer', company:'Craft', type:'Part-time', location:'Surabaya', salary:900},
    ];
    const all = [...posted, ...seed];
    function card(j){
      const payload = JSON.stringify(j).replace(/"/g,'&quot;');
      return `<article class="card job">
        <div class="body">
          <div style="display:flex; justify-content:space-between; gap:8px; align-items:center">
            <div style="font-weight:900">${j.title}</div>
            <div class="badge">${j.type}</div>
          </div>
          <div class="meta">${j.company} • ${j.location} • ${money(j.salary)}/mo</div>
          <div class="actions">
            <a class="btn ghost" href="job.html?id=${j.id}">Details</a>
            <button class="btn" data-apply='${payload}'>Apply</button>
            <button class="btn ghost" data-save='${payload}'>Save</button>
          </div>
        </div>
      </article>`;
    }
    function filter(){
      const q = (document.querySelector('[name=q]')?.value||'').toLowerCase();
      const loc = (document.querySelector('[name=loc]')?.value||'').toLowerCase();
      const type = (document.querySelector('[name=type]')?.value||'');
      const list = all.filter(j=>(!q || (j.title+j.company).toLowerCase().includes(q)) && (!loc || j.location.toLowerCase().includes(loc)) && (!type || j.type===type));
      wrap.innerHTML = list.map(card).join('') || '<p>No jobs match.</p>';
    }
    document.querySelector('[data-filter]')?.addEventListener('input', filter);
    filter();
  }
  renderJobs();

  // Post a job (employer)
  const post = document.querySelector('[data-post-job]');
  if(post){
    post.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(post).entries());
      const jobs = get(POSTED);
      const j = { id:id(), title:data.title, company:data.company, type:data.type, location:data.location, salary: parseFloat(data.salary||0) };
      jobs.unshift(j); set(POSTED, jobs);
      window.location.href = 'employer.html';
    });
  }

  // Render employer dashboard
  function renderEmployer(){
    const el = document.querySelector('[data-posted]'); if(!el) return;
    const rows = get(POSTED).map(j=>`<tr><td>${j.title}</td><td>${j.type}</td><td>${j.location}</td><td>${money(j.salary)}</td></tr>`).join('') || '<tr><td colspan="4">No jobs posted.</td></tr>';
    el.innerHTML = rows;
  }
  renderEmployer();

})();