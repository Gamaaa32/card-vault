# CARD VAULT - Setup & Deployment Guide

## 📋 Daftar Isi
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Instalasi & Setup](#instalasi--setup)
4. [Struktur Project](#struktur-project)
5. [Fitur Utama](#fitur-utama)
6. [Demo Credentials](#demo-credentials)
7. [Customization](#customization)
8. [Deployment ke Vercel](#deployment-ke-vercel)

---

## Overview

**CARD Vault** adalah platform e-commerce premium untuk Pokémon Trading Card Game (TCG) yang menggabungkan:
- ✅ Marketplace e-commerce modern
- ✅ Live portfolio tracker (My Vault)
- ✅ Price comparison aggregator (CARD Vault vs CardTell vs PriceCharting)
- ✅ Visual condition grader tool
- ✅ Admin inventory management system
- ✅ Responsive design (Desktop & Mobile)
- ✅ User & Admin authentication

**Tech Stack:**
- Frontend: React 18+
- Styling: Tailwind CSS + shadcn/ui
- State Management: React Context API + useReducer
- Icons: Lucide React
- Authentication: Firebase Auth (siap integrasi)
- Dummy Data: JSON Objects (simulasi REST API)
- Deployment: Vercel

---

## Prerequisites

Pastikan Anda sudah install:
- **Node.js** v16+ (Check: `node --version`)
- **npm** v8+ (Check: `npm --version`)
- **Git** (untuk version control)
- **Code Editor**: VS Code, WebStorm, atau sejenisnya
- **Vercel Account** (untuk deployment)

---

## Instalasi & Setup

### Step 1: Create React App
```bash
# Buat project baru dengan Vite (lebih cepat dari CRA)
npm create vite@latest card-vault -- --template react
cd card-vault
```

### Step 2: Install Dependencies
```bash
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react
npm install firebase  # Optional: untuk real Firebase Auth

# Initialize Tailwind
npx tailwindcss init -p
```

### Step 3: Configure Tailwind
Edit `tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          600: '#ea580c',
          700: '#c2410c',
        }
      }
    },
  },
  plugins: [],
}
```

### Step 4: Setup Global Styles
Edit `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
@layer components {
  .btn-primary {
    @apply bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition;
  }
}
```

### Step 5: Replace Main Component
Copy seluruh kode dari `card-vault-app.jsx` ke `src/App.jsx`

### Step 6: Update src/main.jsx
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

### Step 7: Run Development Server
```bash
npm run dev
```
Website akan buka di `http://localhost:5173`

---

## Struktur Project

```
card-vault/
├── src/
│   ├── App.jsx                    # Main component (card-vault-app.jsx)
│   ├── index.css                  # Global styles + Tailwind
│   ├── main.jsx                   # Entry point
│   └── components/                # (Optional) split components here later
├── public/
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── .gitignore
```

---

## Fitur Utama

### 1. **Authentication System**
- ✅ Login dengan Email/Password
- ✅ Register akun baru
- ✅ Role-based access (User vs Admin)
- ✅ Demo credentials bawaan

**Demo Users:**
```
User:  john@example.com / user123
Admin: admin@cardvault.com / admin123
```

### 2. **User Dashboard**
- 📖 Browse katalog kartu dengan grid responsive
- 🔍 Search & filter (tipe kartu, kelangkaan, harga)
- 🛒 Shopping cart dengan CRUD operations
- ⭐ My Vault - Portfolio tracker dengan valuation

### 3. **Card Detail Page**
- 📊 Price comparison (CARD Vault vs CardTell vs PriceCharting)
- 💰 Market average & savings calculation
- 📈 Stock availability status
- 🎯 Add to cart atau Add to Vault

### 4. **Visual Grader Tool** ⭐
- 🔍 Interactive condition evaluator
- ✅ 6 condition categories (whitening, scratches, centering, dll)
- 📋 Automatic grade recommendation (Mint / Near Mint / Lightly Played / Played)
- 💾 Save grade result

### 5. **Admin Dashboard**
- 📊 Overview statistics (total produk, stock, inventory value)
- 📋 Inventory management (CRUD)
- 🗂️ Product table dengan sorting
- ✏️ Edit & delete cards
- ➕ Add new cards dengan form lengkap

### 6. **Shopping Cart & Checkout**
- 🛒 Real-time cart updates
- ➕ Quantity management
- 💳 Tax calculation (10%)
- 📦 Order summary dengan checkout simulation

### 7. **My Vault (Portfolio Tracker)** 
- 📈 Total portfolio value calculation
- 📊 Statistics (card count, average price)
- 🔄 Real-time valuation updates
- 🗑️ Manage vault inventory

---

## Demo Credentials

**Akses aplikasi dengan:**

### User Account
```
Email:    john@example.com
Password: user123
Role:     User (Pembeli)
```

### Admin Account
```
Email:    admin@cardvault.com
Password: admin123
Role:     Admin (Penjual)
```

---

## Customization

### Mengubah Warna Primary
Edit di bagian atas component atau `tailwind.config.js`:
```javascript
// Ganti orange dengan warna pilihan Anda
colors: {
  primary: '#your-color'
}
```

### Menambah Card Dummy
Edit `dummyCards` array di `CardVaultApp()`:
```javascript
const dummyCards = [
  { 
    id: 7, 
    nama: "Your Card Name", 
    ekspansi: "Set Name",
    // ... fields lainnya
  },
  // ... lebih banyak cards
];
```

### Mengintegrasikan Firebase Auth (Real)
1. Buat Firebase project di firebase.google.com
2. Install: `npm install firebase`
3. Create `src/firebase.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

4. Update login/register logic di `AuthPage` component

### Mengintegrasikan Real Backend API
Replace dummy data dengan API calls:
```javascript
// Sebelum (dummy):
const [inventory, setInventory] = useState(dummyCards);

// Sesudah (API):
useEffect(() => {
  fetch('https://your-api.com/cards')
    .then(res => res.json())
    .then(data => setInventory(data))
}, []);
```

---

## Deployment ke Vercel

### Method 1: Git Integration (Recommended)

**Step 1: Push ke GitHub**
```bash
git init
git add .
git commit -m "Initial commit: CARD Vault"
git remote add origin https://github.com/yourname/card-vault.git
git branch -M main
git push -u origin main
```

**Step 2: Deploy di Vercel**
1. Buka vercel.com dan login
2. Click "New Project"
3. Select repository `card-vault`
4. Framework: React
5. Root Directory: ./
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Click "Deploy"

**Step 3: Done!**
Vercel akan automatically deploy setiap kali push ke main branch.

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables (di Vercel Dashboard)
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
...
```

---

## Performance Optimization

### Production Build
```bash
npm run build
```
Output akan ada di `dist/` folder.

### Image Optimization
- Saat ini menggunakan emoji (🔥👻🐉) untuk placeholder
- Untuk production, integrate image CDN seperti:
  - Cloudinary
  - Imgix
  - AWS S3

### Code Splitting
Break components ke file terpisah untuk lazy loading:
```javascript
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const UserDashboard = lazy(() => import('./UserDashboard'));
```

---

## Troubleshooting

### Error: "Tailwind CSS not working"
- Clear cache: `npm run build` then refresh
- Check `tailwind.config.js` content paths
- Restart dev server

### Error: "Module not found"
```bash
# Clear node_modules dan reinstall
rm -rf node_modules
npm install
```

### Port 5173 already in use
```bash
# Use different port
npm run dev -- --port 3000
```

---

## Fitur Roadmap (Future)

- [ ] Real Firebase authentication
- [ ] Database (Firestore/MongoDB)
- [ ] Payment integration (Stripe/PayPal)
- [ ] User reviews & ratings
- [ ] Wishlist feature
- [ ] Email notifications
- [ ] Admin analytics dashboard
- [ ] Multi-language support (ID/EN)
- [ ] PWA offline support
- [ ] Real-time inventory sync

---

## Support & Resources

- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
- **Vite**: https://vitejs.dev
- **Vercel**: https://vercel.com/docs

---

## License & Credits

Developed untuk CARD Vault Project.
Menggunakan React, Tailwind CSS, Lucide Icons.

**Selamat coding! 🚀**
