// TripNest – Travel JS
(function(){
  const html = document.documentElement;
  const saved = localStorage.getItem('trip-theme');
  if(saved==='dark') html.classList.add('dark');
  document.addEventListener('click', (e)=>{
    const t = e.target.closest('[data-theme-toggle]');
    if(t){ html.classList.toggle('dark'); localStorage.setItem('trip-theme', html.classList.contains('dark')?'dark':'light'); }
  });

  // Storage keys
  const WISH='trip_wishlist', CART='trip_cart', ORD='trip_orders';
  const get=(k)=>JSON.parse(localStorage.getItem(k)||'[]');
  const set=(k,v)=>localStorage.setItem(k, JSON.stringify(v));
  const money=n=>'$'+(Math.round(n*100)/100).toLocaleString(undefined,{minimumFractionDigits:0});

  // Helpers
  const toISO=(d)=> d instanceof Date? d.toISOString().slice(0,10) : d;
  const addDays=(d,days)=>{ const dt=new Date(d); dt.setDate(dt.getDate()+days); return dt; };
  const nights=(ci,co)=>{
    if(!ci||!co) return 1;
    const a=new Date(ci+'T00:00:00'); const b=new Date(co+'T00:00:00');
    const diff=Math.round((b-a)/(1000*60*60*24));
    return Math.max(1,diff);
  };

  // Seed data
  const hotels=[
    {id:'H-101', name:'Oceanview Resort', city:'Bali', price:120, rating:4.7, amenities:['Pool','WiFi','Breakfast'], distance:0.3},
    {id:'H-102', name:'City Lights Hotel', city:'Jakarta', price:95, rating:4.5, amenities:['Gym','WiFi'], distance:1.2},
    {id:'H-103', name:'Mountain Breeze Lodge', city:'Bandung', price:80, rating:4.6, amenities:['Spa','WiFi','Parking'], distance:2.5},
    {id:'H-104', name:'Heritage Boutique Inn', city:'Yogyakarta', price:110, rating:4.8, amenities:['Breakfast','WiFi'], distance:0.6},
    {id:'H-105', name:'Surabaya Central Suites', city:'Surabaya', price:90, rating:4.3, amenities:['Pool','Parking','WiFi'], distance:1.8},
    {id:'H-106', name:'Lombok Sunset Villas', city:'Lombok', price:140, rating:4.9, amenities:['Pool','Breakfast','WiFi'], distance:0.4}
  ];

  // ---------- Index Search ----------
  (function initIndexSearch(){
    const form=document.querySelector('[data-search]'); if(!form) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const q=new URLSearchParams(new FormData(form)).toString();
      window.location.href='hotels.html?'+q;
    });
    const ci=form.querySelector('[name=checkin]'); const co=form.querySelector('[name=checkout]');
    const today=toISO(new Date()); ci.value=today; co.value=toISO(addDays(today,1));
  })();

  // ---------- Hotels list ----------
  function renderHotels(){
    const wrap=document.querySelector('[data-hotels]'); if(!wrap) return;
    const params=new URLSearchParams(location.search);
    const q=params.get('q')||'';
    const city=params.get('city')||'';
    const min=parseFloat(params.get('min')||'0'); const max=parseFloat(params.get('max')||'1e9');
    const rating=parseFloat(params.get('rating')||'0');
    const checkin=params.get('checkin')||toISO(new Date()); const checkout=params.get('checkout')||toISO(addDays(new Date(),1));
    const guests=parseInt(params.get('guests')||'2',10);

    // Fill filter form if exists
    const f=document.querySelector('[data-filters]');
    if(f){
      f.city.value=city; f.q.value=q; f.min.value=min||''; f.max.value=isFinite(max)&&max<1e9?max:''; f.rating.value=rating||'';
      f.checkin.value=checkin; f.checkout.value=checkout; f.guests.value=guests;
    }

    const wishSet=new Set(get(WISH));
    let list=hotels.filter(h=>(!q || h.name.toLowerCase().includes(q.toLowerCase())) && (!city || h.city===city) && h.price>=min && h.price<=max && h.rating>=rating);

    function card(h){
      const fav=wishSet.has(h.id);
      const n=nights(checkin,checkout);
      const total=h.price*n;
      return `<article class="card listing">
        <img src="assets/img/placeholder/800x600.svg" alt="${h.name}"/>
        <div class="body">
          <div style="display:flex; justify-content:space-between; align-items:center">
            <strong>${h.name}</strong><span class="badge">${h.city} • ★ ${h.rating}</span>
          </div>
          <div class="price">${money(h.price)}/night · ${n} night${n>1?'s':''} → <strong>${money(total)}</strong></div>
          <div class="meta">Amenities: ${h.amenities.join(', ')} • ${h.distance} km to center</div>
          <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap">
            <a class="btn ghost" href="hotel.html?id=${h.id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}">View</a>
            <button class="btn" data-add="${h.id}" data-ci="${checkin}" data-co="${checkout}" data-g="${guests}">Quick add</button>
            <button class="btn ghost" data-wish="${h.id}">${fav?'♥ Saved':'♡ Save'}</button>
          </div>
        </div>
      </article>`;
    }
    wrap.innerHTML=list.map(card).join('') || '<p>No hotels found.</p>';
  }
  renderHotels();
  document.querySelector('[data-filters]')?.addEventListener('input',(e)=>{
    const p=new URLSearchParams(new FormData(e.currentTarget)).toString();
    history.replaceState(null,'','?'+p); renderHotels();
  });

  // Wishlist toggle + Quick add
  document.addEventListener('click',(e)=>{
    const ws=e.target.closest('[data-wish]'); if(ws){
      const id=ws.getAttribute('data-wish'); const s=new Set(get(WISH)); s.has(id)?s.delete(id):s.add(id); set(WISH,[...s]); renderHotels(); renderWishlist();
    }
    const add=e.target.closest('[data-add]'); if(add){
      const id=add.getAttribute('data-add'); const ci=add.getAttribute('data-ci'); const co=add.getAttribute('data-co'); const g=parseInt(add.getAttribute('data-g')||'2',10);
      const cart=get(CART); const h=hotels.find(x=>x.id===id);
      if(h){ cart.push({type:'hotel', id, checkin:ci, checkout:co, guests:g, rooms:1}); set(CART,cart); alert('Added to cart'); renderCart(); }
    }
  });

  // ---------- Hotel detail ----------
  function renderHotel(){
    const el=document.querySelector('[data-hotel]'); if(!el) return;
    const p=new URLSearchParams(location.search);
    const id=p.get('id')||'H-101'; const h=hotels.find(x=>x.id===id)||hotels[0];
    const ci=p.get('checkin')||toISO(new Date()); const co=p.get('checkout')||toISO(addDays(new Date(),1)); const guests=parseInt(p.get('guests')||'2',10);
    const fav=new Set(get(WISH)).has(h.id);
    const n=nights(ci,co); const total=h.price*n;
    el.innerHTML=`<div class="grid cols-2">
      <section>
        <div class="gallery">
          <img src="assets/img/placeholder/1200x800.svg" alt="${h.name}"/>
          <img src="assets/img/placeholder/1000x750.svg" alt="${h.name}"/>
          <img src="assets/img/placeholder/800x600.svg" alt="${h.name}"/>
          <img src="assets/img/placeholder/600x600.svg" alt="${h.name}"/>
        </div>
      </section>
      <aside class="card"><div class="body">
        <h1 style="margin:0">${h.name}</h1>
        <div class="badge">${h.city} • ★ ${h.rating}</div>
        <div class="meta">Amenities: ${h.amenities.join(', ')} • ${h.distance} km to center</div>
        <form data-book style="display:grid; gap:8px; margin-top:8px">
          <div class="grid cols-2">
            <div><label>Check-in</label><input class="input" name="checkin" type="date" value="${ci}" required/></div>
            <div><label>Check-out</label><input class="input" name="checkout" type="date" value="${co}" required/></div>
          </div>
          <div class="grid cols-2">
            <div><label>Guests</label><input class="input" name="guests" type="number" min="1" value="${guests}" required/></div>
            <div><label>Rooms</label><input class="input" name="rooms" type="number" min="1" value="1" required/></div>
          </div>
          <div class="badge">From <strong>${money(h.price)}</strong> /night · <span data-n>${n}</span> nights → <strong data-total>${money(total)}</strong></div>
          <div style="display:flex; gap:8px; flex-wrap:wrap">
            <button class="btn" data-add-hotel="${h.id}">Add to cart</button>
            <button class="btn ghost" data-wish="${h.id}">${fav?'♥ Saved':'♡ Save'}</button>
          </div>
        </form>
      </div></aside>
    </div>`;
    const form=el.querySelector('[data-book]'); const nEl=form.querySelector('[data-n]'); const tEl=form.querySelector('[data-total]');
    form.addEventListener('input',()=>{
      const d=Object.fromEntries(new FormData(form).entries());
      const nn=nights(d.checkin,d.checkout); nEl.textContent=nn; tEl.textContent=money(h.price*nn*parseInt(d.rooms||'1',10));
    });
    form.addEventListener('submit',(e)=>{
      e.preventDefault(); const d=Object.fromEntries(new FormData(form).entries());
      const cart=get(CART); cart.push({type:'hotel', id:h.id, checkin:d.checkin, checkout:d.checkout, guests:parseInt(d.guests||'2',10), rooms:parseInt(d.rooms||'1',10)});
      set(CART,cart); alert('Added to cart');
    });
  }
  renderHotel();

  // ---------- Wishlist page ----------
  function renderWishlist(){
    const wrap=document.querySelector('[data-wishlist]'); if(!wrap) return;
    const ids=new Set(get(WISH)); const list=hotels.filter(h=>ids.has(h.id));
    wrap.innerHTML=list.map(h=>`<tr><td>${h.name}</td><td>${h.city}</td><td>★ ${h.rating}</td><td style="text-align:right">${money(h.price)}/night</td></tr>`).join('') || '<tr><td colspan="4">No items saved.</td></tr>';
  }
  renderWishlist();

  // ---------- Cart ----------
  function renderCart(){
    const wrap=document.querySelector('[data-cart]'); if(!wrap) return;
    const cart=get(CART); let total=0;
    function line(it,i){
      if(it.type!=='hotel') return '';
      const h=hotels.find(x=>x.id===it.id); const n=nights(it.checkin,it.checkout); const sub=(h?.price||0)*n*it.rooms; total+=sub;
      return `<div style="display:grid; grid-template-columns:1fr auto auto; gap:8px; align-items:center; border-bottom:1px solid var(--border); padding:8px 0">
        <div><strong>${h?.name||it.id}</strong><div class="meta">${it.checkin} → ${it.checkout} • ${n} nights • ${it.rooms} room(s) • ${it.guests} guests</div></div>
        <div>Rooms: <button class="btn ghost" data-dec="${i}">-</button> ${it.rooms} <button class="btn ghost" data-inc="${i}">+</button></div>
        <div style="text-align:right">${money(sub)} <button class="btn danger" data-del="${i}" style="margin-left:8px">Remove</button></div>
      </div>`;
    }
    wrap.innerHTML = cart.map(line).join('') || '<p>Your cart is empty.</p>';
    const sum=document.querySelector('[data-total]'); if(sum) sum.textContent=money(total);
  }
  renderCart();

  document.addEventListener('click',(e)=>{
    const inc=e.target.closest('[data-inc]'); if(inc){ const i=parseInt(inc.getAttribute('data-inc'),10); const cart=get(CART); cart[i].rooms++; set(CART,cart); renderCart(); }
    const dec=e.target.closest('[data-dec]'); if(dec){ const i=parseInt(dec.getAttribute('data-dec'),10); const cart=get(CART); cart[i].rooms=Math.max(1, cart[i].rooms-1); set(CART,cart); renderCart(); }
    const del=e.target.closest('[data-del]'); if(del){ const i=parseInt(del.getAttribute('data-del'),10); const cart=get(CART); cart.splice(i,1); set(CART,cart); renderCart(); }
  });

  // ---------- Checkout & Orders ----------
  const checkout=document.querySelector('[data-checkout]');
  if(checkout){
    checkout.addEventListener('submit',(e)=>{
      e.preventDefault();
      const cart=get(CART); if(cart.length===0){ alert('Cart is empty'); return; }
      const total=cart.reduce((s,it)=>{
        if(it.type==='hotel'){ const h=hotels.find(x=>x.id===it.id); return s + (h?.price||0)*nights(it.checkin,it.checkout)*it.rooms; }
        return s;
      },0);
      const order={id:'TN-'+Math.floor(Math.random()*1e6), date:new Date().toISOString().slice(0,10), items:cart, total};
      const orders=get(ORD); orders.unshift(order); set(ORD,orders); set(CART,[]);
      window.location.href='orders.html?placed=1&id='+order.id;
    });
  }

  function renderOrders(){
    const wrap=document.querySelector('[data-orders]'); if(!wrap) return;
    const rows=get(ORD).map(o=>`<tr><td>${o.id}</td><td>${o.date}</td><td>${o.items.length}</td><td style="text-align:right">${money(o.total)}</td></tr>`).join('') || '<tr><td colspan="4">No orders yet.</td></tr>';
    wrap.innerHTML=rows;
  }
  renderOrders();

  // Dummy AJAX
  document.addEventListener('submit', (e)=>{
    const f = e.target.closest('[data-ajax]'); if(!f) return; e.preventDefault(); alert('Thanks! (Demo)'); f.reset();
  });
})();