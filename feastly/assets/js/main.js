// Feastly – Restaurant JS
(function(){
  const html = document.documentElement;
  const saved = localStorage.getItem('feastly-theme');
  if(saved==='dark') html.classList.add('dark');
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-theme-toggle]');
    if(t){ html.classList.toggle('dark'); localStorage.setItem('feastly-theme', html.classList.contains('dark')?'dark':'light'); }
  });

  // CART (localStorage)
  const K='fe_cart';
  const get=()=>JSON.parse(localStorage.getItem(K)||'[]');
  const set=(v)=>localStorage.setItem(K, JSON.stringify(v));
  const money=(n)=>'$'+(Math.round(n*100)/100).toFixed(2);

  function addItem(sku,name,price,qty=1){
    const cart = get();
    const i = cart.findIndex(x=>x.sku===sku);
    if(i>-1){ cart[i].qty += qty; } else { cart.push({sku,name,price,qty}); }
    set(cart);
  }
  function removeItem(sku){
    const cart = get().filter(x=>x.sku!==sku); set(cart);
  }
  function updateQty(sku,qty){
    const cart = get(); const i = cart.findIndex(x=>x.sku===sku);
    if(i>-1){ cart[i].qty = Math.max(1, qty|0); set(cart); }
  }
  function total(){
    return get().reduce((s,i)=>s+i.price*i.qty,0);
  }

  document.addEventListener('click', (e)=>{
    const add = e.target.closest('[data-add]');
    if(add){
      addItem(add.getAttribute('data-sku'), add.getAttribute('data-name'), parseFloat(add.getAttribute('data-price')), 1);
      alert('Added to cart');
    }
    const rem = e.target.closest('[data-remove]');
    if(rem){ removeItem(rem.getAttribute('data-remove')); renderCart(); }
    const inc = e.target.closest('[data-inc]');
    if(inc){ const sku=inc.getAttribute('data-inc'); const item=get().find(x=>x.sku===sku); if(item){ updateQty(sku, item.qty+1); renderCart(); } }
    const dec = e.target.closest('[data-dec]');
    if(dec){ const sku=dec.getAttribute('data-dec'); const item=get().find(x=>x.sku===sku); if(item){ updateQty(sku, item.qty-1); renderCart(); } }
  });

  // Render cart table if exists
  function renderCart(){
    const tbody = document.querySelector('[data-cart]'); if(!tbody) return;
    const items = get();
    tbody.innerHTML = items.map(i=>`<tr>
      <td>${i.name}</td>
      <td>${money(i.price)}</td>
      <td>
        <button class="btn ghost" data-dec="${i.sku}" title="-">−</button>
        <span style="padding:0 8px">${i.qty}</span>
        <button class="btn ghost" data-inc="${i.sku}" title="+">+</button>
      </td>
      <td>${money(i.price*i.qty)}</td>
      <td><button class="btn" data-remove="${i.sku}">Remove</button></td>
    </tr>`).join('') || `<tr><td colspan="5">Your cart is empty.</td></tr>`;
    const t = document.querySelector('[data-total]'); if(t) t.textContent = money(total());
  }
  renderCart();

  // Checkout summary
  function renderSummary(){
    const list = document.querySelector('[data-summary]'); if(!list) return;
    const items = get();
    list.innerHTML = items.map(i=>`<li>${i.name} × ${i.qty} — ${money(i.price*i.qty)}</li>`).join('') || '<li>No items.</li>';
    const t = document.querySelector('[data-total]'); if(t) t.textContent = money(total());
  }
  renderSummary();

  // Checkout submit -> store order and clear cart
  const form = document.querySelector('[data-checkout]');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const order = { id: 'FE-' + Math.floor(Math.random()*1e6), ts: Date.now(), total: total(), status: 'preparing' };
      localStorage.setItem('fe_last_order', JSON.stringify(order));
      localStorage.removeItem(K);
      window.location.href = 'track.html';
    });
  }

  // Order tracking
  const track = document.querySelector('[data-track]');
  if(track){
    const order = JSON.parse(localStorage.getItem('fe_last_order')||'null');
    if(order){
      track.querySelector('[data-ord-id]').textContent = order.id;
      // Simple status ticker
      const steps = ['preparing','on the way','delivered'];
      let idx = steps.indexOf(order.status); if(idx<0) idx=0;
      const dots = track.querySelectorAll('.step');
      function paint(i){ dots.forEach((d,k)=>d.classList.toggle('active', k<=i)); }
      paint(idx);
      const iv = setInterval(()=>{ idx++; paint(idx); if(idx>=dots.length-1) clearInterval(iv); }, 1500);
    } else {
      track.innerHTML = '<p>No recent order. Go to menu to order.</p>';
    }
  }

  // Tabs (menu filter)
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
})();