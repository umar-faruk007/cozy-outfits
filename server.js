/**
* Cozy Outfits BD – Payments API (Node.js/Express)
* COD only: creates orders and stores them in orders.json
*/
const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(cors()); // Adjust origin if you host frontend separately
app.use(express.static(path.join(__dirname, 'public')));


// --- JSON file persistence ---
const DB_FILE = path.join(__dirname, 'orders.json');
async function readDB(){
try { const txt = await fs.readFile(DB_FILE, 'utf8'); return JSON.parse(txt); }
catch { return { orders: [] }; }
}
async function writeDB(db){
await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}
const money = n => Math.round(Number(n) * 100) / 100;


// ===== API: checkout (COD only) =====
app.post('/api/checkout', async (req, res) => {
try {
const { items = [], contact = {}, shipping = {} } = req.body || {};
if(!Array.isArray(items) || items.length === 0){
return res.status(400).json({ ok:false, error: 'Cart is empty' });
}
const total = money(items.reduce((s, it) => s + Number(it.price) * Number(it.qty || 1), 0));


const order = {
id: nanoid(12),
status: 'placed',
paymentStatus: 'cod',
total,
items,
contact,
shipping,
createdAt: new Date().toISOString()
};


const db = await readDB();
db.orders.push(order); await writeDB(db);


return res.json({ ok:true, orderId: order.id, message: 'Order placed with Cash on Delivery.' });
} catch(err){
console.error(err);
res.status(500).json({ ok:false, error: err.message || 'Checkout failed' });
}
});


// Get order (for optional frontend checks)
app.get('/api/order/:id', async (req, res) => {
const db = await readDB();
const order = db.orders.find(o => o.id === req.params.id);
if(!order) return res.status(404).json({ ok:false, error: 'Not found' });
res.json({ ok:true, order });
});


const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => console.log(`COD API on http://localhost:${PORT}`));