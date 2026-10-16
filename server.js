const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'saad_topup_admin_secret_key',
    resave: false,
    saveUninitialized: true
}));

const DB_FILE = path.join(__dirname, 'database.json');

const defaultData = {
    settings: {
        bannerImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
        bkashNumber: "01700000000",
        nagadNumber: "01800000000",
        prices: {
            "25 Diamonds": "25 Tk",
            "50 Diamonds": "50 Tk",
            "115 Diamonds": "95 Tk",
            "240 Diamonds": "190 Tk",
            "505 Diamonds": "390 Tk",
            "1060 Diamonds": "780 Tk"
        }
    },
    orders: []
};

function loadData() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    }
    try {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        if (!data.settings) data.settings = defaultData.settings;
        if (!data.orders) data.orders = [];
        return data;
    } catch (e) {
        return defaultData;
    }
}

function saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ১. ইউজার হোম পেজ (ডায়মন্ড অর্ডার ফর্ম)
app.get('/', (req, res) => {
    const db = loadData();
    const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SAAD Topup - ফ্রি ফায়ার ডায়মন্ড শপ</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 text-slate-100 font-sans antialiased">
        <div class="max-w-md mx-auto bg-slate-900 min-h-screen shadow-2xl border-x border-slate-800 flex flex-col justify-between">
            <div>
                <header class="bg-gradient-to-r from-red-600 to-rose-700 p-4 text-center shadow-lg sticky top-0 z-50">
                    <h1 class="text-2xl font-black tracking-wider uppercase">🔥 SAAD TOPUP 🔥</h1>
                    <p class="text-xs text-rose-200 mt-0.5">Trusted Free Fire Diamond Store</p>
                </header>

                <!-- ব্যানার ছবি (অ্যাডমিন প্যানেল থেকে কাস্টমাইজযোগ্য) -->
                <div class="p-4">
                    <div class="relative overflow-hidden rounded-2xl shadow-lg border border-slate-700/60 aspect-[16/9] bg-slate-800">
                        <img src="${db.settings.bannerImage}" alt="Banner" class="w-full h-full object-cover">
                    </div>
                </div>

                <!-- পেমেন্ট নম্বর নির্দেশনা -->
                <div class="mx-4 p-4 bg-slate-800/90 border border-slate-700 rounded-xl text-sm shadow-md space-y-2">
                    <div class="font-bold text-yellow-400 border-b border-slate-700 pb-2">💡 পেমেন্ট নির্দেশিকা</div>
                    <div class="text-slate-300 space-y-1 text-xs">
                        <p> বিকাশ (Personal): <span class="font-mono font-bold text-rose-400 bg-slate-900 px-2 py-0.5 rounded">${db.settings.bkashNumber}</span></p>
                        <p> নগদ (Personal): <span class="font-mono font-bold text-rose-400 bg-slate-900 px-2 py-0.5 rounded">${db.settings.nagadNumber}</span></p>
                        <p class="text-emerald-400 pt-1">⚠️ সঠিক ট্রানজেকশন আইডি (TrxID) দিয়ে অর্ডার সাবমিট করুন।</p>
                    </div>
                </div>

                <!-- অর্ডার ফর্ম -->
                <form action="/order" method="POST" class="p-4 space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">ফ্রি ফায়ার UID দিন</label>
                        <input type="text" name="uid" required class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm" placeholder="আপনার গেম UID">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">প্যাকেজ সিলেক্ট করুন</label>
                        <select name="package" class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm">
                            ${Object.keys(db.settings.prices).map(k => `<option value="${k}">${k} —${db.settings.prices[k]}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">যে নম্বর থেকে টাকা পাঠিয়েছেন</label>
                        <input type="text" name="phone" required class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-sm" placeholder="017xxxxxxxx">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">TrxID (ট্রানজেকশন আইডি)</label>
                        <input type="text" name="trxid" required class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white font-mono text-sm" placeholder="যেমন: 9N74K...">
                    </div>
                    <button type="submit" class="w-full bg-red-600 hover:bg-red-500 text-white font-bold p-3.5 rounded-xl shadow-lg uppercase text-sm mt-2">অর্ডার কনফার্ম করুন</button>
                </form>
            </div>
            <footer class="p-4 text-center text-xs text-slate-500 border-t border-slate-800">&copy; 2026 SAAD Topup</footer>
        </div>
    </body>
    </html>`;
    res.send(html);
});

// ২. অর্ডার প্রসেসিং
app.post('/order', (req, res) => {
    const { uid, package, phone, trxid } = req.body;
    if (!uid || !package || !phone || !trxid) {
        return res.send(`<script>alert('সব তথ্য সঠিকভাবে পূরণ করুন!'); window.location.href='/';</script>`);
    }
    const db = loadData();
    const newOrder = {
        id: Date.now().toString(),
        uid,
        package,
        phone,
        trxid,
        status: 'Pending', // Pending, Accepted, Rejected
        time: new Date().toLocaleString()
    };
    db.orders.unshift(newOrder);
    saveData(db);
    res.send(`<script>alert('অর্ডার সফলভাবে সাবমিট হয়েছে! অ্যাডমিন প্যানেল থেকে যাচাই করে ডায়মন্ড দেওয়া হবে।'); window.location.href='/';</script>`);
});

// ৩. অ্যাডমিন লগইন পেজ
app.get('/admin/login', (req, res) => {
    const error = req.query.error || '';
    const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head><meta charset="UTF-8"><title>Admin Login</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-slate-950 text-white flex items-center justify-center h-screen">
        <div class="bg-slate-900 p-8 rounded-2xl shadow-2xl w-88 border border-slate-800">
            <h2 class="text-2xl font-black text-center mb-6 text-red-500 uppercase">Admin Login</h2>
            ${error ? `<p class="text-red-400 text-xs mb-4 text-center">${error}</p>` : ''}
            <form action="/admin/login" method="POST" class="space-y-4">
                <input type="text" name="username" placeholder="Username" required class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm">
                <input type="password" name="password" placeholder="Password" required class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-sm">
                <button type="submit" class="w-full bg-red-600 p-3 rounded-xl font-bold uppercase text-sm">Login</button>
            </form>
        </div>
    </body>
    </html>`;
    res.send(html);
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'saad' && password === '12345') {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/admin/login?error=ভুল ইউজারনেম বা পাসওয়ার্ড!');
    }
});

// ৪. অ্যাডমিন ড্যাশবোর্ড (যেখান থেকে অর্ডার এক্সেপ্ট/রিজেক্ট এবং কনফিগার করা যাবে)
app.get('/admin/dashboard', (req, res) => {
    if (!req.session.isAdmin) return res.redirect('/admin/login');
    const db = loadData();
    const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head><meta charset="UTF-8"><title>Admin Dashboard</title><script src="https://cdn.tailwindcss.com"></script></head>
    <body class="bg-slate-950 text-slate-100 p-4 md:p-8">
        <div class="max-w-5xl mx-auto bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-800">
            <div class="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h1 class="text-xl font-black text-red-500 uppercase">🛠️ SAAD Admin Panel</h1>
                <div class="flex gap-2">
                    <a href="/" target="_blank" class="bg-slate-800 px-3 py-2 rounded-xl text-xs font-bold">🌐 ভিজিট সাইট</a>
                    <a href="/admin/logout" class="bg-red-600 px-3 py-2 rounded-xl text-xs font-bold">লগআউট</a>
                </div>
            </div>

            <!-- সেটিংস ও ব্যানার কাস্টমাইজেশন ফর্ম -->
            <form action="/admin/update" method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-5 rounded-xl mb-8 border border-slate-800">
                <h2 class="md:col-span-2 font-bold text-yellow-400 text-sm uppercase">⚙️ সাইট ও ব্যানার কনফিগারেশন</h2>
                <div class="md:col-span-2">
                    <label class="text-xs text-slate-400 block mb-1">ব্যানার ইমেজ লিংক (Image URL):</label>
                    <input type="text" name="bannerImage" value="${db.settings.bannerImage}" class="w-full bg-slate-900 p-2.5 border border-slate-700 rounded-xl text-sm">
                </div>
                <div>
                    <label class="text-xs text-slate-400 block mb-1">বিকাশ নম্বর:</label>
                    <input type="text" name="bkashNumber" value="${db.settings.bkashNumber}" class="w-full bg-slate-900 p-2.5 border border-slate-700 rounded-xl text-sm">
                </div>
                <div>
                    <label class="text-xs text-slate-400 block mb-1">নগদ নম্বর:</label>
                    <input type="text" name="nagadNumber" value="${db.settings.nagadNumber}" class="w-full bg-slate-900 p-2.5 border border-slate-700 rounded-xl text-sm">
                </div>
                <button type="submit" class="md:col-span-2 bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl font-bold uppercase text-xs">সেটিংস সেভ করুন</button>
            </form>

            <!-- অর্ডার ম্যানেজমেন্ট টেবিল -->
            <h2 class="font-bold text-base mb-3">📥 কাস্টমার অর্ডার লিস্ট (${db.orders.length})</h2>
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                ${db.orders.length === 0 ? '<p class="text-center text-slate-500 py-4 text-sm">কোনো নতুন অর্ডার নেই।</p>' : `
                <table class="w-full text-left text-xs whitespace-nowrap">
                    <tr class="border-b border-slate-800 text-slate-400">
                        <th class="p-2">UID</th>
                        <th class="p-2">প্যাকেজ</th>
                        <th class="p-2">নম্বর</th>
                        <th class="p-2">TrxID</th>
                        <th class="p-2">স্ট্যাটাস</th>
                        <th class="p-2">সময়</th>
                        <th class="p-2 text-center">অ্যাকশন</th>
                    </tr>
                    ${db.orders.map(o => `
                    <tr class="border-b border-slate-800/50">
                        <td class="p-2 font-mono">${o.uid}</td>
                        <td class="p-2 text-rose-400 font-bold">${o.package}</td>
                        <td class="p-2 font-mono">${o.phone}</td>
                        <td class="p-2 text-yellow-400 font-mono">${o.trxid}</td>
                        <td class="p-2 font-bold ${o.status === 'Accepted' ? 'text-emerald-400' : o.status === 'Rejected' ? 'text-red-400' : 'text-amber-400'}">${o.status}</td>
                        <td class="p-2 text-slate-500 text-[11px]">${o.time}</td>
                        <td class="p-2 text-center space-x-1">
                            <a href="/admin/status?id=${o.id}&status=Accepted" class="bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 px-2 py-1 rounded hover:bg-emerald-600 hover:text-white font-bold">Accept</a>
                            <a href="/admin/status?id=${o.id}&status=Rejected" class="bg-red-600/20 text-red-400 border border-red-600/40 px-2 py-1 rounded hover:bg-red-600 hover:text-white font-bold">Reject</a>
                        </td>
                    </tr>`).join('')}
                </table>`}
            </div>
        </div>
    </body>
    </html>`;
    res.send(html);
});

// ৫. অর্ডার স্ট্যাটাস পরিবর্তন (Accept / Reject)
app.get('/admin/status', (req, res) => {
    if (!req.session.isAdmin) return res.redirect('/admin/login');
    const { id, status } = req.query;
    const db = loadData();
    const order = db.orders.find(o => o.id === id);
    if (order) {
        order.status = status;
        saveData(db);
    }
    res.redirect('/admin/dashboard');
});

// ৬. সেটিংস আপডেট
app.post('/admin/update', (req, res) => {
    if (!req.session.isAdmin) return res.redirect('/admin/login');
    const { bannerImage, bkashNumber, nagadNumber } = req.body;
    const db = loadData();
    db.settings.bannerImage = bannerImage || db.settings.bannerImage;
    db.settings.bkashNumber = bkashNumber;
    db.settings.nagadNumber = nagadNumber;
    saveData(db);
    res.redirect('/admin/dashboard');
});

// ৭. লগআউট
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

app.listen(PORT, () => console.log(`SAAD Topup server running on port ${PORT}`));
