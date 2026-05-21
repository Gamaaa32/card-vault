# ⚡ CARD VAULT - Quick Start Guide (5 Menit)

Panduan cepat untuk mulai menggunakan CARD Vault dalam 5 langkah sederhana.

---

## 🎯 Step 1: Setup Project (2 menit)

```bash
# Buat folder project
mkdir card-vault && cd card-vault

# Initialize dengan Vite
npm create vite@latest . -- --template react

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react

# Initialize Tailwind
npx tailwindcss init -p
```

---

## 🎨 Step 2: Copy Configuration Files (1 menit)

Copy files berikut ke folder `card-vault/`:
- `tailwind.config.js`
- `postcss.config.js`
- `vite.config.js`
- `package.json`

---

## 📝 Step 3: Create Global Styles (1 menit)

Buat file `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom animations */
@layer components {
  .animate-in {
    animation: fadeIn 0.3s ease-in-out;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 🔌 Step 4: Add Main Component (1 menit)

Replace `src/App.jsx` dengan seluruh kode dari **card-vault-app.jsx**.

Update `src/main.jsx`:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## 🚀 Step 5: Run! (Instant)

```bash
npm run dev
```

Browser otomatis buka ke `http://localhost:5173`

---

## 🔑 Demo Credentials

**User Account** (Pembeli):
```
Email:    john@example.com
Password: user123
```

**Admin Account** (Penjual):
```
Email:    admin@cardvault.com
Password: admin123
```

---

## ✨ Fitur yang Langsung Bisa Dipakai

✅ User Dashboard (Browse, Search, Filter)  
✅ Admin Dashboard (CRUD Inventory)  
✅ Shopping Cart  
✅ My Vault (Portfolio Tracker)  
✅ Price Comparison  
✅ Visual Grading Tool  
✅ Authentication (Mock)  
✅ Responsive Mobile Design  

---

## 🛠️ Customization Cepat

### Ubah Warna Primary
Edit `tailwind.config.js`:
```javascript
colors: {
  orange: {
    600: '#YOUR_COLOR', // Ganti dengan warna pilihan
  }
}
```

### Tambah Card Baru
Edit di `card-vault-app.jsx`, cari `dummyCards`:
```javascript
const dummyCards = [
  // ... cards existing
  {
    id: 7,
    nama: "Pikachu ex",
    ekspansi: "Your Set",
    kondisi: "Mint",
    stok: 10,
    harga_vault: 25.00,
    harga_cardtell: 27.50,
    harga_pricecharting: 26.00,
    gambar: "⚡",
    tipe: "Electric",
    kelangkaan: "Rare",
    deskripsi: "Classic electric mouse card"
  },
];
```

### Ganti Logo
Cari di `Navbar()` dan ubah icon:
```jsx
<Package size={24} /> // Ganti dengan icon lain dari lucide-react
```

---

## 🚢 Deploy ke Vercel (3 Langkah)

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourname/card-vault.git
git branch -M main
git push -u origin main
```

### 2. Connect ke Vercel
- Buka vercel.com
- Click "Import Project"
- Select repository
- Click "Deploy"

### 3. Done! 🎉
Vercel automatically deploy setiap push ke GitHub.

---

## 📊 Project Structure

```
card-vault/
├── src/
│   ├── App.jsx           ← Main component (card-vault-app.jsx)
│   ├── index.css         ← Global styles
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── .gitignore
```

---

## 🐛 Troubleshooting

**Error: "Module not found"**
```bash
npm install
```

**Tailwind not working**
- Restart dev server: `npm run dev`
- Clear browser cache

**Port already in use**
```bash
npm run dev -- --port 3000
```

---

## 📚 Next Steps

1. ✅ Run locally & test semua features
2. 📸 Replace emoji dengan real product images
3. 🔐 Integrate dengan Firebase Auth (optional)
4. 💾 Connect ke real backend/database
5. 🚀 Deploy ke Vercel

---

## 💡 Tips

- Gunakan Chrome DevTools untuk test responsive design
- Cek Console untuk potential errors
- Test semua user flows (login, browse, cart, vault, grader)
- Validate form inputs sebelum production

---

## 📞 Support

- React Docs: https://react.dev
- Tailwind Docs: https://tailwindcss.com
- Lucide Icons: https://lucide.dev
- Vite Docs: https://vitejs.dev

---

## ✅ Checklist

- [ ] Project created & dependencies installed
- [ ] Tailwind configured & working
- [ ] Component added to App.jsx
- [ ] Dev server running
- [ ] Can login with demo credentials
- [ ] Can browse cards
- [ ] Can add to cart
- [ ] Can access admin panel
- [ ] Can use My Vault
- [ ] Can test grading tool

Selamat! Aplikasi siap pakai! 🎉

---

**Need more help?** Baca `SETUP_GUIDE.md` atau `FEATURES_DETAILED.md` untuk dokumentasi lengkap.
