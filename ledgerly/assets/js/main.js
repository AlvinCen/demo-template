// Ledgerly – Personal Finance JS
(function(){
  const html = document.documentElement;
  const saved = localStorage.getItem('ledgerly-theme');
  if(saved==='dark') html.classList.add('dark');
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-theme-toggle]');
    if(t){ html.classList.toggle('dark'); localStorage.setItem('ledgerly-theme', html.classList.contains('dark')?'dark':'light'); }
  });

  const TX='ledg_txns', BDG='ledg_budgets', ACC='ledg_accounts';
  const get=(k)=>JSON.parse(localStorage.getItem(k)||'[]');
  const set=(k,v)=>localStorage.setItem(k, JSON.stringify(v));

  // Seed data (once)
  if(get(TX).length===0){
    set(TX, [
      {id:'T-001', date:'2025-09-01', account:'Wallet', category:'Food', note:'Lunch', amount:-5.5},
      {id:'T-002', date:'2025-09-02', account:'Bank', category:'Salary', note:'September payroll', amount:1200},
      {id:'T-003', date:'2025-09-03', account:'Bank', category:'Transport', note:'MRT', amount:-2.1},
      {id:'T-004', date:'2025-09-05', account:'Card', category:'Groceries', note:'Supermarket', amount:-42.9},
      {id:'T-005', date:'2025-09-06', account:'Card', category:'Entertainment', note:'Movies', amount:-7.0}
    ]);
  }
  if(get(BDG).length===0){
    set(BDG, [
      {category:'Food', limit:150},
      {category:'Transport', limit:60},
      {category:'Groceries', limit:200},
      {category:'Entertainment', limit:80}
    ]);
  }
  if(get(ACC).length===0){
    set(ACC, [
      {name:'Bank', balance:1500},
      {name:'Card', balance:300},
      {name:'Wallet', balance:40}
    ]);
  }

  const money=n=>'$'+(Math.round(n*100)/100).toFixed(2);

  // DASHBOARD
  function renderDashboard(){
    const tx = get(TX);
    const income = tx.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
    const expense = tx.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0);
    const balance = income + expense;
    const balEl = document.querySelector('[data-balance]');
    const incEl = document.querySelector('[data-income]');
    const expEl = document.querySelector('[data-expense]');
    if(balEl) balEl.textContent = money(balance);
    if(incEl) incEl.textContent = money(income);
    if(expEl) expEl.textContent = money(Math.abs(expense));

    // Recent 5
    const tbody = document.querySelector('[data-recent]');
    if(tbody){
      const rows = tx.slice(-5).reverse().map(t=>`<tr><td>${t.date}</td><td>${t.category}</td><td>${t.note}</td><td style="text-align:right">${t.amount>0?'<span style="color:#16a34a">+':''}${money(t.amount)}</td></tr>`).join('');
      tbody.innerHTML = rows;
    }

    // Simple donut: expense vs income
    const donut = document.querySelector('[data-donut]');
    if(donut){
      const total = Math.max(1, income + Math.abs(expense));
      const pctInc = income/total, pctExp = Math.abs(expense)/total;
      const C=60, R=54, P=2*Math.PI*R;
      donut.innerHTML = `
      <svg width="${C*2}" height="${C*2}" viewBox="0 0 ${C*2} ${C*2}" aria-label="Income vs Expense">
        <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#e2e8f0" stroke-width="12"/>
        <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#16a34a" stroke-width="12" stroke-dasharray="${P*pctInc} ${P*(1-pctInc)}" transform="rotate(-90 ${C} ${C})"/>
        <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#ef4444" stroke-width="12" stroke-dasharray="${P*pctExp} ${P*(1-pctExp)}" transform="rotate(${(pctInc*360)-90} ${C} ${C})"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Inter, system-ui, Arial" font-size="14">${Math.round(pctExp*100)}% spent</text>
      </svg>`;
    }
  }
  renderDashboard();

  // TRANSACTIONS
  const form = document.querySelector('[data-add-tx]');
  if(form){
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const tx = get(TX);
      const amt = parseFloat(data.amount||0);
      tx.push({id:'T-'+Math.floor(Math.random()*1e6), date:data.date, account:data.account, category:data.category, note:data.note, amount: amt});
      set(TX, tx);
      form.reset();
      renderTx();
      renderDashboard();
    });
  }
  function renderTx(){
    const tx = get(TX).slice().reverse();
    const q = (document.querySelector('[name=q]')?.value||'').toLowerCase();
    const cat = (document.querySelector('[name=cat]')?.value||'');
    const tbody = document.querySelector('[data-txns]');
    if(!tbody) return;
    const list = tx.filter(t=>(!q || (t.note+t.category+t.account).toLowerCase().includes(q)) && (!cat || t.category===cat));
    tbody.innerHTML = list.map(t=>`<tr>
      <td>${t.date}</td><td>${t.account}</td><td>${t.category}</td><td>${t.note}</td>
      <td style="text-align:right">${t.amount>0?'<span style="color:#16a34a">+':''}${money(t.amount)}</td>
    </tr>`).join('') || '<tr><td colspan="5">No transactions.</td></tr>';
  }
  renderTx();
  document.querySelector('[data-filter-tx]')?.addEventListener('input', renderTx);

  // BUDGETS
  const bform = document.querySelector('[data-add-budget]');
  if(bform){
    bform.addEventListener('submit',(e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(bform).entries());
      const list = get(BDG);
      const i = list.findIndex(b=>b.category===data.category);
      if(i>-1){ list[i].limit = parseFloat(data.limit||0); } else { list.push({category:data.category, limit: parseFloat(data.limit||0)}); }
      set(BDG, list); renderBudgets();
    });
  }
  function spentByCategory(){
    const tx = get(TX).filter(t=>t.amount<0);
    const map = {};
    tx.forEach(t=>map[t.category]=(map[t.category]||0)+Math.abs(t.amount));
    return map;
  }
  function renderBudgets(){
    const tbody = document.querySelector('[data-budgets]'); if(!tbody) return;
    const list = get(BDG);
    const spent = spentByCategory();
    tbody.innerHTML = list.map(b=>{
      const s = spent[b.category]||0;
      const pct = Math.min(100, Math.round((s/b.limit)*100||0));
      return `<tr>
        <td>${b.category}</td>
        <td>${money(b.limit)}</td>
        <td>${money(s)}</td>
        <td style="min-width:160px">
          <div class="progress"><span style="width:${pct}%"></span></div>
          <small class="muted">${pct}%</small>
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="4">No budgets.</td></tr>';
  }
  renderBudgets();

  // REPORTS (category bar list)
  function renderReports(){
    const wrap = document.querySelector('[data-report-bars]'); if(!wrap) return;
    const data = Object.entries(spentByCategory()).sort((a,b)=>b[1]-a[1]);
    wrap.innerHTML = data.map(([cat,val])=>`
      <div class="kpi">
        <div style="min-width:120px"><strong>${cat}</strong></div>
        <div class="progress" style="flex:1"><span style="width:${Math.min(100, val/300*100)}%"></span></div>
        <div style="min-width:80px; text-align:right">${money(val)}</div>
      </div>`).join('') || '<p>No expenses yet.</p>';
  }
  renderReports();

  // ACCOUNTS
  const aform = document.querySelector('[data-add-account]');
  if(aform){
    aform.addEventListener('submit',(e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(aform).entries());
      const list = get(ACC); list.push({name:data.name, balance: parseFloat(data.balance||0)}); set(ACC, list); renderAccounts();
    });
  }
  function renderAccounts(){
    const tbody = document.querySelector('[data-accounts]'); if(!tbody) return;
    const rows = get(ACC).map(a=>`<tr><td>${a.name}</td><td style="text-align:right">${money(a.balance)}</td></tr>`).join('') || '<tr><td colspan="2">No accounts.</td></tr>';
    tbody.innerHTML = rows;
  }
  renderAccounts();

  // Export (JSON)
  const expBtn = document.querySelector('[data-export]');
  if(expBtn){
    expBtn.addEventListener('click',()=>{
      const blob = new Blob([JSON.stringify({tx:get(TX), budgets:get(BDG), accounts:get(ACC)}, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download='ledgerly-export.json'; a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Simple AJAX forms
  document.addEventListener('submit', (e)=>{
    const f = e.target.closest('[data-ajax]'); if(!f) return; e.preventDefault(); alert('Thanks! (Demo)'); f.reset();
  });

})();