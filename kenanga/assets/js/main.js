// Kenanga Template JS – cart + theme
(function(){
  const html = document.documentElement;
  const saved = localStorage.getItem('kenanga-theme');
  if(saved==='dark') html.classList.add('dark');
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-theme-toggle]');
    if(t){ html.classList.toggle('dark'); localStorage.setItem('kenanga-theme', html.classList.contains('dark')?'dark':'light'); }
  });

  const storeKey = 'kenanga_cart';
  const format = n => new Intl.NumberFormat(undefined, {style:'currency', currency:'USD'}).format(n);

  function getCart(){ try{ return JSON.parse(localStorage.getItem(storeKey) || '[]'); }catch{ return []; } }
  function saveCart(c){ localStorage.setItem(storeKey, JSON.stringify(c)); updateCount(); }
  function updateCount(){
    const c = getCart().reduce((a,b)=>a + (b.qty||1), 0);
    document.querySelectorAll('[data-cart-count]').forEach(el=> el.textContent = c);
  }
  function addToCart(p){
    const cart = getCart();
    const i = cart.findIndex(x=>x.id===p.id);
    if(i>-1){ cart[i].qty += p.qty||1; } else { cart.push({...p, qty: p.qty||1}); }
    saveCart(cart);
    alert('Added to cart: ' + p.name);
  }
  function removeFromCart(id){
    let cart = getCart().filter(x=>x.id!==id);
    saveCart(cart);
    renderCart();
  }
  function setQty(id, qty){
    qty = Math.max(1, qty|0);
    const cart = getCart();
    const i = cart.findIndex(x=>x.id===id);
    if(i>-1){ cart[i].qty = qty; saveCart(cart); renderCart(); }
  }

  // Listen add-to-cart buttons
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-add]');
    if(btn){
      const p = JSON.parse(btn.getAttribute('data-add'));
      addToCart(p);
    }
    const rm = e.target.closest('[data-remove]');
    if(rm){
      const id = rm.getAttribute('data-remove');
      removeFromCart(id);
    }
    const inc = e.target.closest('[data-inc]');
    if(inc){
      const id = inc.getAttribute('data-inc'); const item = getCart().find(x=>x.id===id); setQty(id, (item?.qty||1)+1);
    }
    const dec = e.target.closest('[data-dec]');
    if(dec){
      const id = dec.getAttribute('data-dec'); const item = getCart().find(x=>x.id===id); setQty(id, Math.max(1,(item?.qty||1)-1));
    }
  });

  // Render cart page
  function renderCart(){
    const table = document.querySelector('[data-cart-table]');
    const subtotalEl = document.querySelector('[data-subtotal]');
    const totalEl = document.querySelector('[data-total]');
    if(!table) return;
    const cart = getCart();
    table.innerHTML = '';
    let subtotal = 0;
    cart.forEach(item=>{
      const line = item.price * item.qty;
      subtotal += line;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="display:flex; align-items:center; gap:10px">
          <img src="${item.image}" alt="" style="width:56px; height:56px; border-radius:8px; border:1px solid var(--border)"/>
          <div><strong>${item.name}</strong><div class="meta">$${item.price.toFixed(2)}</div></div>
        </td>
        <td>
          <div class="qty">
            <button type="button" data-dec="${item.id}">−</button>
            <input value="${item.qty}" aria-label="Quantity" />
            <button type="button" data-inc="${item.id}">+</button>
          </div>
        </td>
        <td>${format(line)}</td>
        <td><button class="btn outline" data-remove="${item.id}">Remove</button></td>
      `;
      // qty input change
      tr.querySelector('input').addEventListener('change', (e)=>{
        const v = parseInt(e.target.value || '1', 10);
        setQty(item.id, isNaN(v) ? 1 : v);
      });
      table.appendChild(tr);
    });
    subtotalEl && (subtotalEl.textContent = format(subtotal));
    const shipping = cart.length ? 12 : 0;
    const total = subtotal + shipping;
    totalEl && (totalEl.textContent = format(total));
  }

  // On pages
  if(document.body.matches('[data-page="cart"]')) renderCart();
  updateCount();

  // Checkout demo
  const checkout = document.querySelector('[data-checkout]');
  if(checkout){
    checkout.addEventListener('submit', (e)=>{
      e.preventDefault();
      localStorage.removeItem(storeKey);
      location.href = 'order-success.html';
    });
  }
})();