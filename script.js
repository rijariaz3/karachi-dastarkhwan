// ---------- 1. MENU DATA (32 items, 5 categories): name, description, price in Rs., category, picture, available ----------
const MENU = [
 ["Chicken Karahi","Wok-cooked chicken with tomato, ginger and green chilli",1800,"BBQ & Karahi","🍲",1],
 ["Mutton Karahi","Peshawari style mutton karahi",2800,"BBQ & Karahi","🍲",1],
 ["Seekh Kebab","4 pieces of spicy minced beef kebab",900,"BBQ & Karahi","🍢",1],
 ["Chicken Tikka","Charcoal grilled leg piece with chutney",700,"BBQ & Karahi","🍗",1],
 ["Malai Boti","Creamy, juicy boneless chicken cubes",950,"BBQ & Karahi","🍢",1],
 ["Beef Nihari","Slow cooked beef shank curry, served with naan",1100,"BBQ & Karahi","🥘",1],
 ["Mutton Chops","Lahori masala mutton chops",2200,"BBQ & Karahi","🍖",0],
 ["Haleem","Wheat, lentils and beef cooked slowly with spices",600,"BBQ & Karahi","🥣",1],
 ["Chicken Biryani","Spicy basmati rice with chicken and raita",450,"Biryani & Rice","🍛",1],
 ["Beef Biryani","Karachi style beef biryani",500,"Biryani & Rice","🍛",1],
 ["Sindhi Biryani","Aloo bukhara and green chilli biryani",550,"Biryani & Rice","🍛",1],
 ["Chicken Pulao","Mild, fragrant rice cooked in yakhni",400,"Biryani & Rice","🍚",1],
 ["Yakhni Pulao","Traditional pulao with tender meat",450,"Biryani & Rice","🍚",1],
 ["Daal Chawal","Tarka daal with steamed rice",250,"Biryani & Rice","🍚",1],
 ["Halwa Puri","2 puri with halwa, chana and aloo",350,"Desi Breakfast","🥞",1],
 ["Aloo Paratha","Crispy paratha stuffed with spiced potato",200,"Desi Breakfast","🫓",1],
 ["Anda Paratha","Paratha with a fried egg",250,"Desi Breakfast","🍳",1],
 ["Paye","Slow cooked trotters with naan",700,"Desi Breakfast","🍲",0],
 ["Chana Chaat","Tangy chickpea chaat with chutney",200,"Desi Breakfast","🥗",1],
 ["Nashta Combo","Paratha, omelette, chana and chai",500,"Desi Breakfast","🍽️",1],
 ["Gulab Jamun","3 soft milk dumplings in sugar syrup",250,"Desserts","🍡",1],
 ["Kheer","Creamy rice pudding with pistachio",220,"Desserts","🍮",1],
 ["Gajar Halwa","Carrot halwa with khoya and nuts",300,"Desserts","🥕",1],
 ["Rabri Falooda","Falooda with rabri, ice cream and nuts",350,"Desserts","🍧",1],
 ["Kulfi","Traditional pistachio malai kulfi",200,"Desserts","🍦",1],
 ["Ras Malai","Soft cheese patties in saffron milk",300,"Desserts","🍥",1],
 ["Mango Lassi","Chilled yogurt and mango drink",250,"Drinks","🥭",1],
 ["Sweet Lassi","Thick Punjabi sweet lassi",200,"Drinks","🥛",1],
 ["Doodh Patti Chai","Strong milky desi chai",100,"Drinks","☕",1],
 ["Rooh Afza","Rose sharbat with ice and milk",150,"Drinks","🌹",1],
 ["Mint Margarita","Fresh mint and lemon cooler",220,"Drinks","🍹",1],
 ["Sugarcane Juice","Fresh ganna juice",150,"Drinks","🎋",1]
].map((m, i) => ({ id: i + 1, name: m[0], desc: m[1], price: m[2], cat: m[3], img: m[4], avail: !!m[5] }));
const CATS = ["All", ...new Set(MENU.map(m => m.cat))];
const STATUSES = ["Received", "Preparing", "Ready", "Completed", "Cancelled"];
const GST = 0.05, FEE = 150;           // 5% tax, Rs. 150 delivery

// ---------- 2. STORAGE (browser storage; not a shared server database) ----------
const mem = {};
const load = (k, d) => { try { const v = localStorage.getItem("ld_" + k); if (v) return JSON.parse(v); } catch (e) {} return k in mem ? mem[k] : d; };
const save = (k, v) => { mem[k] = v; try { localStorage.setItem("ld_" + k, JSON.stringify(v)); } catch (e) {} };
let cart = load("cart", {});            // cart state: { menuId: quantity }
let orders = load("orders", []);        // order history (header + items inside each order)
let avail = load("avail", {});          // admin overrides of availability
let cat = "All", query = "", msg = "", err = "", trackNo = "";

// ---------- 3. HELPERS ----------
const $ = s => document.querySelector(s);
const rs = n => "Rs. " + n.toLocaleString("en-PK");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const isAvail = m => (m.id in avail ? avail[m.id] : m.avail);
const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
function totals() {                      // subtotal, tax and final total are calculated automatically
  const sub = Object.entries(cart).reduce((s, [id, q]) => s + MENU[id - 1].price * q, 0);
  const gst = Math.round(sub * GST), fee = sub ? FEE : 0;
  return { sub, gst, fee, total: sub + gst + fee };
}
const view = () => (location.hash.slice(1) || "menu");
const go = v => { msg = ""; err = ""; location.hash = v; };

// ---------- 4. SCREENS ----------
function cardHTML(m) {
  const ok = isAvail(m);
  return `<div class="card ${ok ? "" : "soldout"}"><div class="art" aria-hidden="true">${m.img}</div>
    <span class="tag">${esc(m.cat)}</span><h3>${esc(m.name)}</h3><p>${esc(m.desc)}</p>
    <div class="foot"><span class="price">${rs(m.price)}</span>
    ${ok ? `<button class="btn sm" data-act="add" data-id="${m.id}">Add to cart</button>` : `<button class="btn sm" disabled>Sold out</button>`}</div></div>`;
}
function gridHTML() {                    // browse by category + search/filter
  const q = query.trim().toLowerCase();
  const list = MENU.filter(m => (cat === "All" || m.cat === cat) && (m.name + " " + m.desc).toLowerCase().includes(q));
  return list.length ? list.map(cardHTML).join("") : `<p class="muted">No dishes match "${esc(query)}".</p>`;
}
function menuView() {
  return `<h2>Today's menu</h2>
  <div class="bar" role="group" aria-label="Categories">${CATS.map(c => `<button class="btn alt sm ${c === cat ? "on" : ""}" data-act="cat" data-id="${esc(c)}">${esc(c)}</button>`).join("")}</div>
  <div class="bar"><input id="search" type="search" placeholder="Search biryani, karahi, lassi..." value="${esc(query)}" aria-label="Search the menu"></div>
  <div class="grid" id="grid">${gridHTML()}</div>`;
}
function cartView() {
  const ids = Object.keys(cart);
  if (!ids.length) return `<h2>Your cart</h2>${msg ? `<div class="msg">${esc(msg)}</div>` : ""}<div class="panel">Your cart is empty. <a href="#menu">Browse the menu</a></div>`;
  const t = totals();
  const rows = ids.map(id => { const m = MENU[id - 1], q = cart[id]; return `<tr>
    <td>${m.img} ${esc(m.name)}</td><td class="num">${rs(m.price)}</td>
    <td><span class="qty"><button data-act="dec" data-id="${id}" aria-label="Less">-</button><b>${q}</b><button data-act="inc" data-id="${id}" aria-label="More">+</button></span></td>
    <td class="num">${rs(m.price * q)}</td><td><button class="btn danger sm" data-act="rm" data-id="${id}">Remove</button></td></tr>`; }).join("");
  return `<h2>Your cart</h2>${msg ? `<div class="msg">${esc(msg)}</div>` : ""}
  <div class="panel"><div class="scroll"><table><thead><tr><th>Dish</th><th class="num">Price</th><th>Quantity</th><th class="num">Total</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="sum"><div><span>Subtotal</span><span>${rs(t.sub)}</span></div><div><span>GST (5%)</span><span>${rs(t.gst)}</span></div>
  <div><span>Delivery</span><span>${rs(t.fee)}</span></div><div class="final"><span>Final total</span><span>${rs(t.total)}</span></div></div></div>
  <form class="panel form" id="checkout" novalidate><h3 style="flex-basis:100%">Checkout</h3>
  <label>Your name<input id="cname" required maxlength="40" autocomplete="name" placeholder="e.g. Ahmed Khan"></label>
  <label>Phone number<input id="cphone" required maxlength="13" inputmode="tel" placeholder="03XX-XXXXXXX"></label>
  <p class="muted" style="flex-basis:100%;margin:0">Payment: Cash on Delivery (simulated). No card details are collected.</p>
  ${err ? `<div class="err">${esc(err)}</div>` : ""}
  <button class="btn" type="submit">Place order, ${rs(t.total)}</button></form>`;
}
function stepsHTML(o) {                  // customer-facing status progression
  if (o.status === "Cancelled") return `<span class="pill st-Cancelled">Cancelled</span>`;
  const cur = STATUSES.indexOf(o.status);
  return `<div class="steps">${STATUSES.slice(0, 4).map((s, i) => `<span class="step ${i <= cur ? "done" : ""}">${s}</span>`).join("")}</div>`;
}
function orderHTML(o, admin) {
  const items = o.items.map(i => `<li>${i.qty} x ${esc(i.name)} <span class="muted">(${rs(i.price * i.qty)})</span></li>`).join("");
  const btns = admin ? `<div class="bar">${STATUSES.map(s => `<button class="btn alt sm ${o.status === s ? "on" : ""}" data-act="status" data-id="${o.no}" data-s="${s}">${s}</button>`).join("")}</div>` : stepsHTML(o);
  return `<div class="panel order"><div class="row"><h3>Order #${o.no}</h3><span class="pill st-${o.status}">${o.status}</span></div>
  <div class="muted">${esc(o.name)} | ${esc(o.phone)} | ${esc(o.time)}</div><ul class="clean">${items}</ul>
  <div class="sum">
    <div><span>Subtotal</span><span>${rs(o.sub)}</span></div>
    <div><span>GST (5%)</span><span>${rs(o.gst ?? Math.round(o.sub * GST))}</span></div>
    <div><span>Delivery</span><span>${rs(o.fee ?? (o.sub ? FEE : 0))}</span></div>
    <div class="final"><span>Final total</span><span>${rs(o.total)}</span></div>
    </div>${btns}</div>`;
}
function trackView() {
  const o = orders.find(x => String(x.no) === String(trackNo).replace("#", ""));
  const mine = orders.slice().reverse().map(x => `<button class="btn alt sm" data-act="open" data-id="${x.no}">#${x.no}</button>`).join("");
  return `<h2>Track your order</h2>${msg ? `<div class="msg">${esc(msg)}</div>` : ""}
  <form class="panel form" id="trackform"><label>Order number<input id="trackno" inputmode="numeric" placeholder="e.g. 1001" value="${esc(trackNo)}"></label><button class="btn" type="submit">Track</button></form>
  ${mine ? `<div class="bar"><span class="muted">Orders from this device:</span>${mine}</div>` : ""}
  ${trackNo ? (o ? orderHTML(o, false) : `<div class="panel">No order found with that number.</div>`) : ""}`;
}
function adminView() {                   // kitchen / administrator side
  const active = orders.filter(o => STATUSES.slice(0, 3).includes(o.status)).reverse();
  const past = orders.filter(o => !STATUSES.slice(0, 3).includes(o.status)).reverse();
  const stats = STATUSES.map(s => `<div class="stat"><span class="muted">${s}</span><b>${orders.filter(o => o.status === s).length}</b></div>`).join("");
  const rows = MENU.map(m => `<tr><td>${m.img} ${esc(m.name)}</td><td class="num">${rs(m.price)}</td><td>${isAvail(m) ? "Available" : "<b>Sold out</b>"}</td>
    <td><button class="btn alt sm" data-act="toggle" data-id="${m.id}">${isAvail(m) ? "Mark sold out" : "Mark available"}</button></td></tr>`).join("");
  return `<h2>Kitchen and admin</h2><div class="stats">${stats}</div>
  <h3>Incoming orders</h3>${active.map(o => orderHTML(o, true)).join("") || `<div class="panel muted">No active orders. Place one from the Menu tab and it will appear here.</div>`}
  <h3>Order history</h3>${past.map(o => orderHTML(o, true)).join("") || `<div class="panel muted">Completed and cancelled orders are listed here.</div>`}
  <h3>Menu availability</h3><div class="panel scroll"><table><tbody>${rows}</tbody></table></div>`;
}

// ---------- 5. RENDER ----------
const VIEWS = { menu: ["Menu", menuView], cart: ["Cart", cartView], track: ["Track order", trackView], admin: ["Kitchen / Admin", adminView] };
function render() {
  const v = VIEWS[view()] ? view() : "menu";
  $("#nav").innerHTML = Object.entries(VIEWS).map(([k, [label]]) => `<button data-act="go" data-id="${k}" ${k === v ? 'aria-current="page"' : ""}>${k === "cart" ? `Cart (${cartCount()})` : label}</button>`).join("");
  $("#app").innerHTML = VIEWS[v][1]();
}

// ---------- 6. ACTIONS ----------
const actions = {
  go: id => go(id),
  cat: id => { cat = id; render(); },
  add: id => { if (isAvail(MENU[id - 1])) { cart[id] = Math.min((cart[id] || 0) + 1, 20); save("cart", cart); render(); } },
  inc: id => { cart[id] = Math.min(cart[id] + 1, 20); save("cart", cart); render(); },
  dec: id => { if (--cart[id] <= 0) delete cart[id]; save("cart", cart); render(); },
  rm: id => { delete cart[id]; save("cart", cart); render(); },
  status: (id, b) => { orders.find(o => o.no == id).status = b.dataset.s; save("orders", orders); render(); },
  toggle: id => { avail[id] = !isAvail(MENU[id - 1]); save("avail", avail); render(); },
  open: id => { trackNo = String(id); render(); }
};
document.addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (b) actions[b.dataset.act](b.dataset.id, b); });
document.addEventListener("input", e => { if (e.target.id === "search") { query = e.target.value; $("#grid").innerHTML = gridHTML(); } });
document.addEventListener("submit", e => {
  e.preventDefault();
  if (e.target.id === "trackform") { trackNo = $("#trackno").value.trim(); render(); return; }
  if (e.target.id !== "checkout") return;
  const name = $("#cname").value.trim(), phone = $("#cphone").value.trim();
  const gone = Object.keys(cart).filter(id => !isAvail(MENU[id - 1]));      // sold-out items cannot be ordered
  if (gone.length) { gone.forEach(id => delete cart[id]); save("cart", cart); msg = "Sold out and removed from your cart: " + gone.map(id => MENU[id - 1].name).join(", "); return render(); }
  if (!name) { err = "Please enter your name."; return render(); }
  if (!/^03\d{2}-?\d{7}$/.test(phone)) { err = "Enter a Pakistani mobile number like 0300-1234567."; return render(); }
  const t = totals();
  const no = orders.reduce((m, o) => Math.max(m, o.no), 1000) + 1;          // unique order number
  orders.push({ no, name, phone, sub: t.sub, gst: t.gst, fee: t.fee, total: t.total, status: "Received", time: new Date().toLocaleString("en-PK"),
    items: Object.entries(cart).map(([id, q]) => ({ name: MENU[id - 1].name, price: MENU[id - 1].price, qty: q })) });
  cart = {}; save("cart", cart); save("orders", orders);
  trackNo = String(no); msg = "Thank you! Order #" + no + " has been placed. Total " + rs(t.total) + " (Cash on Delivery).";
  err = ""; location.hash = "track"; render();
});
addEventListener("hashchange", render);
render();
