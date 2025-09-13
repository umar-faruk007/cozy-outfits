// Cozy Outfits BD – Frontend JS (COD only)
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

const state = {
  products: [],
  filtered: [],
  cart: JSON.parse(localStorage.getItem('novashop.cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('novashop.wishlist') || '[]'),
  filters: { q:'', category:'All', min:'', max:'', rating:0, sort:'pop', wishlistOnly:false },
  currentProduct: null
};

const demoProducts = [
  {id:'sneak-01', title:'Aero Runner', price:89, rating:4.5, category:'Shoes', featured:true, sizes:['38','39','40','41','42'], colors:['Black','White','Volt'], desc:'Lightweight running shoe with breathable mesh and responsive foam.'},
  {id:'sneak-02', title:'Street Flex', price:119, rating:4.2, category:'Shoes', sizes:['39','40','41','42','43'], colors:['Black','Red'], desc:'Everyday lifestyle sneaker with cushioned midsole and grippy outsole.'},
  {id:'hood-01', title:'Cozy Hoodie', price:54, rating:4.7, category:'Apparel', sale:64, sizes:['S','M','L','XL'], colors:['Olive','Navy','Charcoal'], desc:'Ultra-soft fleece hoodie perfect for cool evenings.'},
  {id:'tee-01', title:'Cloud Tee', price:24, rating:4.1, category:'Apparel', sizes:['S','M','L','XL'], colors:['White','Sky','Charcoal'], desc:'Feather-light cotton tee with relaxed fit.'},
  {id:'head-01', title:'Pulse Headphones', price:149, rating:4.6, category:'Electronics', featured:true, sizes:[], colors:['Black'], desc:'Over-ear wireless headphones with deep bass and 30-hour battery.'},
  {id:'buds-01', title:'Nano Earbuds', price:79, rating:4.3, category:'Electronics', sizes:[], colors:['White'], desc:'True wireless earbuds with clear calls and pocketable case.'},
  {id:'bag-01', title:'City Backpack', price:69, rating:4.4, category:'Accessories', sizes:[], colors:['Black','Khaki'], desc:'Slim backpack with padded laptop sleeve and water-resistant fabric.'},
  {id:'watch-01', title:'Active Watch', price:199, rating:4.8, category:'Electronics', featured:true, sizes:['S','M','L'], colors:['Black'], desc:'Fitness watch with heart-rate, GPS, and 7-day battery.'},
  {id:'jack-01', title:'Wind Jacket', price:89, rating:4.2, category:'Apparel', sizes:['S','M','L','XL'], colors:['Navy','Orange'], desc:'Packable windbreaker with DWR finish and reflective trim.'},
  {id:'bottle-01', title:'Hydra Bottle', price:19, rating:4.0, category:'Accessories', sizes:[], colors:['Steel','Blue'], desc:'Insulated bottle keeps drinks cold 24h; hot 12h.'},
  {id:'socks-01', title:'Cushion Socks', price:12, rating:3.9, category:'Apparel', sizes:['M','L'], colors:['White','Black'], desc:'Cushioned crew socks with arch support (2-pack).'},
  {id:'cap-01', title:'Snapback Cap', price:22, rating:4.1, category:'Accessories', sizes:[], colors:['Black','Blue'], desc:'Flat-brim cap with adjustable snap closure.'}
].map(p => ({...p, image: svgDataUri(p.title)}));

function svgDataUri(text){
  const bg1 = '#0ecf9b', bg2 = '#4169e1';
  const svg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='${bg1}'/>
          <stop offset='1' stop-color='${bg2}'/>
        </linearGradient>
        <filter id='s' x='-20%' y='-20%' width='140%' height='140%'>
          <feDropShadow dx='0' dy='6' stdDeviation='6' flood-color='rgba(0,0,0,.25)'/>
        </filter>
      </defs>
      <rect rx='36' ry='36' width='100%' height='100%' fill='url(#g)'/>
      <g filter='url(#s)'>
        <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui,Segoe UI,Roboto' font-size='64' fill='white' font-weight='800'>${text}</text>
      </g>
    </svg>`);
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}
function starSvg(f){ return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" opacity="${f?1:.3}"></path></svg>` }
const money = n => `$${Number(n).toFixed(2)}`;

function saveStores(){ localStorage.setItem('novashop.cart', JSON.stringify(state.cart)); localStorage.setItem('novashop.wishlist', JSON.stringify(state.wishlist)); }
function cartCount(){ return state.cart.reduce((n,i)=> n+i.qty, 0); }
function cartSubtotal(){ return state.cart.reduce((s,i)=> s + i.qty * i.price, 0); }
function updateCartBadge(){ const b=$('#cartBadge'); if(b) b.textContent = cartCount(); }

function renderProducts(){
  const grid = $('#products'); if(!grid) return; grid.innerHTML = '';
  const list = filterProducts();
  if(!list.length){
    grid.innerHTML = `<div class="card" style="grid-column:1/-1; padding:22px; text-align:center"><div class="muted">No products match your filters.</div></div>`;
    return;
  }
  list.forEach(p => {
    const inWish = state.wishlist.includes(p.id);
    const el = document.createElement('article'); el.className='card'; el.dataset.id=p.id;
    el.innerHTML = `
      <div class="media"><img src="${p.image}" alt="" /></div>
      <div class="content">
        <div class="title">${p.title}</div>
        <div class="muted">${p.category} • ${p.rating.toFixed(1)}★</div>
        <div class="price-row">
          <div><span class="price">${money(p.price)}</span> ${p.sale?`<span class="strike">${money(p.sale)}</span>`:''}</div>
          <div class="stars">${[1,2,3,4,5].map(i=>starSvg(i<=Math.round(p.rating))).join('')}</div>
        </div>
      </div>
      <div class="actions" data-id="${p.id}">
        <button class="btn btn-primary add" data-id="${p.id}">Add to Cart</button>
        <button class="wish" aria-pressed="${inWish}" aria-label="${inWish?'Remove from':'Add to'} wishlist" data-id="${p.id}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
        </button>
      </div>`;
    grid.appendChild(el);
  });
}

function filterProducts(){
  const { q, category, min, max, rating, sort, wishlistOnly } = state.filters;
  let list = [...state.products];
  if(q){ const t=q.toLowerCase(); list=list.filter(p=>p.title.toLowerCase().includes(t)||p.category.toLowerCase().includes(t)); }
  if(category && category!=='All') list = list.filter(p=>p.category===category);
  if(min!=='' && !isNaN(min)) list = list.filter(p=>p.price>=Number(min));
  if(max!=='' && !isNaN(max)) list = list.filter(p=>p.price<=Number(max));
  if(rating && Number(rating)>0) list = list.filter(p=>p.rating>=Number(rating));
  if(wishlistOnly) list = list.filter(p=>state.wishlist.includes(p.id));
  if(sort==='pop') list.sort((a,b)=> b.rating - a.rating || a.price - b.price);
  if(sort==='price-asc') list.sort((a,b)=> a.price - b.price);
  if(sort==='price-desc') list.sort((a,b)=> b.price - a.price);
  if(sort==='name-asc') list.sort((a,b)=> a.title.localeCompare(b.title));
  state.filtered=list; return list;
}

function renderCart(){
  const wrap = $('#cartItems'); if(!wrap) return; wrap.innerHTML='';
  if(!state.cart.length){
    wrap.innerHTML = `<div class="muted" style="text-align:center; padding:20px">Your cart is empty.</div>`;
  } else {
    state.cart.forEach(item => {
      const row=document.createElement('div'); row.className='cart-item';
      row.innerHTML = `
        <img src="${item.image}" alt="${item.title}" width="64" height="64" style="border-radius:10px">
        <div><div style="font-weight:700">${item.title}</div><div class="muted">${money(item.price)}</div></div>
        <div style="display:grid; gap:6px; justify-items:end">
          <div class="qty">
            <button class="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <input value="${item.qty}" inputmode="numeric" data-id="${item.id}" aria-label="Quantity for ${item.title}"/>
            <button class="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="icon-btn remove" data-id="${item.id}" aria-label="Remove from cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
          </button>
        </div>`;
      wrap.appendChild(row);
    });
  }
  const sub=$('#cartSubtotal'); if(sub) sub.textContent = money(cartSubtotal());
  const tot=$('#orderTotal'); if(tot) tot.textContent = money(cartSubtotal());
  updateCartBadge();
}

function addToCart(id, qty=1){
  const p=state.products.find(x=>x.id===id); if(!p) return;
  const existing=state.cart.find(x=>x.id===id);
  if(existing) existing.qty += qty; else state.cart.push({ id:p.id, title:p.title, price:p.price, image:p.image, qty });
  saveStores(); renderCart(); openDrawer();
}
function removeFromCart(id){ state.cart = state.cart.filter(x=>x.id!==id); saveStores(); renderCart(); }
function openDrawer(){ const d=$('#cartDrawer'); if(d){ d.classList.add('open'); d.setAttribute('aria-hidden','false'); } }
function closeDrawer(){ const d=$('#cartDrawer'); if(d){ d.classList.remove('open'); d.setAttribute('aria-hidden','true'); } }
function toggleWishlist(id){ const i=state.wishlist.indexOf(id); if(i>-1) state.wishlist.splice(i,1); else state.wishlist.push(id); saveStores(); renderProducts(); }

function openProductDetails(id){
  const p = state.products.find(x=>x.id===id); if(!p) return;
  state.currentProduct = p;
  $('#pdImage')?.setAttribute('src', p.image);
  $('#pdImage')?.setAttribute('alt', p.title);
  $('#pdTitle') && ($('#pdTitle').textContent = p.title);
  $('#pdMeta') && ($('#pdMeta').textContent = `${p.category} • ${p.rating.toFixed(1)}★`);
  $('#pdPrice') && ($('#pdPrice').textContent = money(p.price));
  $('#pdStrike') && ($('#pdStrike').textContent = p.sale? money(p.sale): '');
  $('#pdDesc') && ($('#pdDesc').textContent = p.desc || '');
  $('#pdSize') && ($('#pdSize').innerHTML = (p.sizes?.length? p.sizes:['Standard']).map(s=>`<option>${s}</option>`).join(''));
  $('#pdColor') && ($('#pdColor').innerHTML = (p.colors?.length? p.colors:['Default']).map(c=>`<option>${c}</option>`).join(''));
  $('#pdQty') && ($('#pdQty').value = 1);
  $('#pdWish') && ($('#pdWish').setAttribute('aria-pressed', String(state.wishlist.includes(p.id))));
  const modal=$('#productModal'); if(modal?.showModal) modal.showModal();
}
function closeProductDetails(){ const modal=$('#productModal'); if(modal?.close) modal.close(); }

async function placeOrder(){
  const name=$('#name')?.value.trim(); const email=$('#email')?.value.trim(); const addr=$('#address')?.value.trim();
  if(!name || !email || !addr){ alert('Please fill in name, email, and address.'); return; }
  const payload = {
    items: state.cart.map(i => ({ id:i.id, title:i.title, price:i.price, qty:i.qty })),
    contact: { name, email },
    shipping: { address: addr, city: $('#city')?.value, country: $('#country')?.value }
  };
  const resp = await fetch('/api/checkout', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
                .then(r=>r.json()).catch(()=>({ ok:false, error:'Network error' }));
  if(!resp.ok){ alert(resp.error||'Checkout failed'); return; }
  alert('✅ Order placed (Cash on Delivery). Order ID: '+resp.orderId);
  state.cart=[]; saveStores(); renderCart(); $('#checkoutModal')?.close(); closeDrawer();
}

function bindEvents(){
  $('#themeToggle')?.addEventListener('click', ()=>{ const light=document.documentElement.getAttribute('data-theme')==='light'; document.documentElement.setAttribute('data-theme', light?'dark':'light'); $('#themeToggle').setAttribute('aria-pressed', String(!light)); localStorage.setItem('novashop.theme', light?'dark':'light'); });
  $('.menu-toggle')?.addEventListener('click', ()=>{ const links=$('.nav-links'); if(links) links.style.display=(getComputedStyle(links).display==='none'?'flex':'none'); });

  let t; $('#searchInput')?.addEventListener('input', e=>{ clearTimeout(t); t=setTimeout(()=>{ state.filters.q = e.target.value.trim(); renderProducts(); }, 140); });
  $('#catSelect')?.addEventListener('change', e=>{ state.filters.category=e.target.value; renderProducts(); });
  $('#ratingSelect')?.addEventListener('change', e=>{ state.filters.rating=Number(e.target.value); renderProducts(); });
  $('#sortSelect')?.addEventListener('change', e=>{ state.filters.sort=e.target.value; renderProducts(); });
  $('#minPrice')?.addEventListener('change', e=>{ state.filters.min=e.target.value; renderProducts(); });
  $('#maxPrice')?.addEventListener('change', e=>{ state.filters.max=e.target.value; renderProducts(); });
  $('#clearFilters')?.addEventListener('click', ()=>{ state.filters={...state.filters, q:'', category:'All', min:'', max:'', rating:0, sort:'pop', wishlistOnly:false }; const set=(sel,val)=>{ const el=$(sel); if(el) el.value=val; }; set('#searchInput',''); set('#minPrice',''); set('#maxPrice',''); set('#ratingSelect','0'); set('#catSelect','All'); set('#sortSelect','pop'); renderProducts(); });

  $('#products')?.addEventListener('click', e=>{
    const addBtn = e.target.closest?.('.add');
    const wishBtn = e.target.closest?.('.wish');
    if(addBtn){ e.stopPropagation(); addToCart(addBtn.dataset.id); return; }
    if(wishBtn){ e.stopPropagation(); toggleWishlist(wishBtn.dataset.id); wishBtn.setAttribute('aria-pressed', String(state.wishlist.includes(wishBtn.dataset.id))); return; }
    const card = e.target.closest?.('.card'); if(card){ openProductDetails(card.dataset.id); }
  });

  $('#openCart')?.addEventListener('click', openDrawer);
  $('#closeCart')?.addEventListener('click', closeDrawer);
  $('#cartDrawer')?.addEventListener('click', e=>{ if(e.target.id==='cartDrawer') closeDrawer(); });

  $('#cartItems')?.addEventListener('click', e=>{
    const id=e.target.dataset.id; if(!id) return;
    if(e.target.classList.contains('remove')) removeFromCart(id);
    if(e.target.classList.contains('inc')){ const it=state.cart.find(x=>x.id===id); it.qty++; saveStores(); renderCart(); }
    if(e.target.classList.contains('dec')){ const it=state.cart.find(x=>x.id===id); if(it.qty>1){ it.qty--; } else { removeFromCart(id); return; } saveStores(); renderCart(); }
  });
  $('#cartItems')?.addEventListener('change', e=>{ if(e.target.matches('input')){ const id=e.target.dataset.id; const it=state.cart.find(x=>x.id===id); const val=Math.max(1, parseInt(e.target.value||'1')); it.qty=val; saveStores(); renderCart(); } });

  $('#viewWishlist')?.addEventListener('click', ()=>{ state.filters.wishlistOnly = !state.filters.wishlistOnly; renderProducts(); const vw=$('#viewWishlist'); if(vw){ vw.classList.toggle('btn-primary', state.filters.wishlistOnly); vw.classList.toggle('btn-ghost', !state.filters.wishlistOnly); vw.innerHTML = state.filters.wishlistOnly ? 'Viewing Wishlist' : 'Wishlist'; } });

  $('#checkoutBtn')?.addEventListener('click', ()=>{ if(!state.cart.length){ alert('Your cart is empty.'); return; } $('#checkoutModal')?.showModal(); });
  $('#closeCheckout')?.addEventListener('click', ()=> $('#checkoutModal')?.close());
  $('#placeOrder')?.addEventListener('click', placeOrder);

  $('#closeProduct')?.addEventListener('click', closeProductDetails);
  $('#pdInc')?.addEventListener('click', ()=> { const q=$('#pdQty'); if(q) q.value = String((parseInt(q.value)||1)+1); });
  $('#pdDec')?.addEventListener('click', ()=> { const q=$('#pdQty'); if(q) q.value = String(Math.max(1,(parseInt(q.value)||1)-1)); });
  $('#pdAdd')?.addEventListener('click', ()=>{ const q=$('#pdQty'); const qty=Math.max(1, parseInt(q?.value||'1')); if(state.currentProduct) addToCart(state.currentProduct.id, qty); });
  $('#pdWish')?.addEventListener('click', ()=>{ if(!state.currentProduct) return; toggleWishlist(state.currentProduct.id); $('#pdWish')?.setAttribute('aria-pressed', String(state.wishlist.includes(state.currentProduct.id))); });
}

function init(){
  const savedTheme = localStorage.getItem('novashop.theme'); if(savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  state.products = demoProducts;
  const cats = ['All', ...new Set(state.products.map(p=>p.category))];
  const catSel=$('#catSelect'); if(catSel) catSel.innerHTML = cats.map(c=>`<option>${c}</option>`).join('');
  bindEvents(); renderProducts(); renderCart(); updateCartBadge();
  if(location.hash.startsWith('#product/')){ const id=location.hash.split('/')[1]; openProductDetails(id); }
}

document.addEventListener('DOMContentLoaded', init);
