import React, { useState, useEffect, useContext, createContext, useReducer, useRef, useCallback } from 'react';
import { ChevronDown, LogOut, Plus, Trash2, Edit2, Eye, EyeOff, Search, Filter, ShoppingCart, Home, Settings, BarChart3, Package, Users, LogIn, UserPlus, X, AlertCircle, CheckCircle, TrendingUp, DollarSign, Star, Info, CreditCard, QrCode, Building2, Copy, Clock, ArrowRight, ChevronLeft, Check, Sparkles, Camera, Upload, RefreshCw, Award, Zap } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from './firebase';

// ============================================================================
// DUMMY DATA & CONTEXT
// ============================================================================

const dummyCards = [
  { id: 1, nama: "Charizard ex", ekspansi: "Scarlet & Violet", kondisi: "Mint", stok: 5, harga_vault: 45.99, harga_cardtell: 48.50, harga_pricecharting: 46.99, gambar: "https://images.pokemontcg.io/sv3pt5/199_hires.png", tipe: "Fire", kelangkaan: "Rare", deskripsi: "Classic fire dragon with stunning artwork" },
  { id: 2, nama: "Gengar ex", ekspansi: "Brilliant Stars", kondisi: "Near Mint", stok: 8, harga_vault: 32.50, harga_cardtell: 35.00, harga_pricecharting: 33.99, gambar: "https://images.pokemontcg.io/swsh11tg/TG06_hires.png", tipe: "Psychic", kelangkaan: "Rare", deskripsi: "Ghostly spectral card with holographic foil" },
  { id: 3, nama: "Rayquaza ex", ekspansi: "Dragon Vault", kondisi: "Lightly Played", stok: 3, harga_vault: 62.00, harga_cardtell: 65.99, harga_pricecharting: 63.50, gambar: "https://images.pokemontcg.io/dv1/11_hires.png", tipe: "Dragon", kelangkaan: "Ultra Rare", deskripsi: "Powerful dragon card in excellent condition" },
  { id: 4, nama: "Mewtwo ex", ekspansi: "Base Set", kondisi: "Mint", stok: 2, harga_vault: 89.99, harga_cardtell: 95.00, harga_pricecharting: 92.50, gambar: "https://images.pokemontcg.io/sv3pt5/150_hires.png", tipe: "Psychic", kelangkaan: "Ultra Rare", deskripsi: "Legendary psychic powerhouse from Base Set" },
  { id: 5, nama: "Blastoise ex", ekspansi: "Brilliant Stars", kondisi: "Near Mint", stok: 6, harga_vault: 38.75, harga_cardtell: 41.00, harga_pricecharting: 39.99, gambar: "https://images.pokemontcg.io/sv3pt5/184_hires.png", tipe: "Water", kelangkaan: "Rare", deskripsi: "Water cannon specialist with dynamic pose" },
  { id: 6, nama: "Venusaur ex", ekspansi: "Scarlet & Violet", kondisi: "Lightly Played", stok: 4, harga_vault: 35.50, harga_cardtell: 38.00, harga_pricecharting: 37.25, gambar: "https://images.pokemontcg.io/sv3pt5/198_hires.png", tipe: "Grass", kelangkaan: "Rare", deskripsi: "Nature's fury captured in foil perfection" },
];

// Helper: check if gambar is a URL or emoji
const isImageUrl = (gambar) => gambar && (gambar.startsWith('http') || gambar.startsWith('/'));

const dummyUsers = {
  admin: { id: 'admin', nama: 'Admin Store', email: 'admin@cardvault.com', role: 'admin', password: 'admin123' },
  user1: { id: 'user1', nama: 'John Collector', email: 'john@example.com', role: 'user', password: 'user123' },
};

// Auth Context
const AuthContext = createContext();
const CartContext = createContext();
const AdminContext = createContext();
const VaultContext = createContext();

// ============================================================================
// REDUCERS & STATE MANAGEMENT
// ============================================================================

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existing = state.find(item => item.id === action.payload.id);
      if (existing) {
        return state.map(item => 
          item.id === action.payload.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    case 'REMOVE_FROM_CART':
      return state.filter(item => item.id !== action.payload);
    case 'UPDATE_QUANTITY':
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
};

const inventoryReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_CARD':
      return [...state, { ...action.payload, id: Date.now() }];
    case 'UPDATE_CARD':
      return state.map(card =>
        card.id === action.payload.id ? action.payload : card
      );
    case 'DELETE_CARD':
      return state.filter(card => card.id !== action.payload);
    default:
      return state;
  }
};

const vaultReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_VAULT_CARD':
      const vaultExisting = state.find(item => item.id === action.payload.id);
      if (vaultExisting) {
        return state.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    case 'REMOVE_VAULT_CARD':
      return state.filter(item => item.id !== action.payload);
    case 'UPDATE_VAULT_QUANTITY':
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
    default:
      return state;
  }
};

// ============================================================================
// MAIN APP
// ============================================================================

export default function CardVaultApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [cart, cartDispatch] = useReducer(cartReducer, []);
  const [inventory, inventoryDispatch] = useReducer(inventoryReducer, dummyCards);
  const [vault, vaultDispatch] = useReducer(vaultReducer, []);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [detailCardId, setDetailCardId] = useState(null);
  const [showGrader, setShowGrader] = useState(false);
  const [showPSAGrader, setShowPSAGrader] = useState(false);

  // BUG FIX: Reset sub-page state whenever main page changes
  const handleSetCurrentPage = useCallback((page) => {
    setDetailCardId(null);
    setShowGrader(false);
    setShowPSAGrader(false);
    setCurrentPage(page);
  }, []);

  const showNotif = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (email, password) => {
    for (const [key, user] of Object.entries(dummyUsers)) {
      if (user.email === email && user.password === password) {
        setCurrentUser(user);
        setShowAuth(false);
        showNotif(`Welcome back, ${user.nama}!`, 'success');
        return;
      }
    }
    showNotif('Invalid email or password', 'error');
  };

  const handleRegister = (nama, email, password) => {
    if (!nama || !email || !password) {
      showNotif('All fields required', 'error');
      return;
    }
    const newUser = {
      id: `user${Date.now()}`,
      nama,
      email,
      role: 'user',
      password,
    };
    setCurrentUser(newUser);
    setShowAuth(false);
    showNotif(`Account created! Welcome, ${nama}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAuth(true);
    cartDispatch({ type: 'CLEAR_CART' });
    setCurrentPage('dashboard');
    showNotif('Logged out successfully', 'success');
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const newUser = {
        id: firebaseUser.uid,
        nama: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email,
        role: 'user',
        avatar: firebaseUser.photoURL,
      };
      setCurrentUser(newUser);
      setShowAuth(false);
      showNotif(`Welcome, ${newUser.nama}!`, 'success');
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        showNotif('Google sign-in failed. Check Firebase config.', 'error');
      }
    }
  };

  // Render Auth Page
  if (showAuth) {
    return (
      <>
        {notification && <Notification notif={notification} />}
        <AuthPage 
          onLogin={handleLogin}
          onRegister={handleRegister}
          onGoogleLogin={handleGoogleLogin}
          authMode={authMode}
          setAuthMode={setAuthMode}
        />
      </>
    );
  }

  // Render Main App
  return (
    <AuthContext.Provider value={{ currentUser, handleLogout }}>
      <CartContext.Provider value={{ cart, cartDispatch }}>
        <AdminContext.Provider value={{ inventory, inventoryDispatch }}>
          <VaultContext.Provider value={{ vault, vaultDispatch }}>
            <div className="min-h-screen bg-white text-gray-900">
              <Navbar currentPage={currentPage} setCurrentPage={handleSetCurrentPage} />
              
              {notification && <Notification notif={notification} />}

              {currentUser.role === 'admin' ? (
                <AdminDashboard 
                  currentPage={currentPage} 
                  setCurrentPage={handleSetCurrentPage}
                  showNotif={showNotif}
                  setShowGrader={setShowGrader}
                  showGrader={showGrader}
                />
              ) : (
                <UserDashboard 
                  currentPage={currentPage} 
                  setCurrentPage={handleSetCurrentPage}
                  detailCardId={detailCardId}
                  setDetailCardId={setDetailCardId}
                  showNotif={showNotif}
                  setShowGrader={setShowGrader}
                  showGrader={showGrader}
                  showPSAGrader={showPSAGrader}
                  setShowPSAGrader={setShowPSAGrader}
                />
              )}
            </div>
          </VaultContext.Provider>
        </AdminContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

// ============================================================================
// AUTH PAGE
// ============================================================================

function AuthPage({ onLogin, onRegister, onGoogleLogin, authMode, setAuthMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      onLogin(email, password);
    } else {
      onRegister(nama, email, password);
    }
    setEmail('');
    setPassword('');
    setNama('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-orange-600 text-white rounded-xl p-4 mb-4">
            <Package size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">CARD Vault</h1>
          <p className="text-gray-600">Your premium Pokémon card marketplace</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Mode Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-4 font-semibold transition ${
                authMode === 'login'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LogIn className="inline mr-2" size={20} /> Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-4 font-semibold transition ${
                authMode === 'register'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserPlus className="inline mr-2" size={20} /> Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Collector"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="px-6 py-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">or</span></div>
            </div>
          </div>

          {/* Google Sign-In */}
          <div className="px-6 pb-4">
            <button
              onClick={onGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-3"><strong>Demo Credentials:</strong></p>
            <div className="space-y-2 text-xs">
              <p className="text-gray-700"><strong>User:</strong> john@example.com / user123</p>
              <p className="text-gray-700"><strong>Admin:</strong> admin@cardvault.com / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NAVBAR
// ============================================================================

function Navbar({ currentPage, setCurrentPage }) {
  const { currentUser, handleLogout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-2 font-black text-xl text-orange-600 hover:text-orange-700"
          >
            <div className="bg-orange-600 text-white rounded-lg p-2">
              <Package size={24} />
            </div>
            <span>CARD Vault</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {currentUser.role === 'user' && (
              <>
                <NavButton active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')}>
                  <Home size={18} /> Browse
                </NavButton>
                <NavButton active={currentPage === 'vault'} onClick={() => setCurrentPage('vault')}>
                  <Star size={18} /> My Vault
                </NavButton>
                <NavButton active={currentPage === 'psa-grader'} onClick={() => setCurrentPage('psa-grader')}>
                  <Sparkles size={18} /> AI Grader
                </NavButton>
              </>
            )}
            {currentUser.role === 'admin' && (
              <>
                <NavButton active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')}>
                  <BarChart3 size={18} /> Overview
                </NavButton>
                <NavButton active={currentPage === 'inventory'} onClick={() => setCurrentPage('inventory')}>
                  <Package size={18} /> Inventory
                </NavButton>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {currentUser.role === 'user' && (
              <button
                onClick={() => setCurrentPage('cart')}
                className={`relative p-2 rounded-lg transition ${
                  currentPage === 'cart'
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700 hidden sm:inline">{currentUser.nama}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-red-50 rounded-lg transition text-red-600"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
        active
          ? 'bg-orange-100 text-orange-600'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================================
// NOTIFICATION
// ============================================================================

function Notification({ notif }) {
  return (
    <div className={`fixed top-4 right-4 max-w-sm rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in zoom-in-95 ${
      notif.type === 'success' 
        ? 'bg-green-50 border border-green-200 text-green-800' 
        : 'bg-red-50 border border-red-200 text-red-800'
    }`}>
      {notif.type === 'success' ? (
        <CheckCircle size={20} className="flex-shrink-0" />
      ) : (
        <AlertCircle size={20} className="flex-shrink-0" />
      )}
      <span className="font-medium">{notif.message}</span>
    </div>
  );
}

// ============================================================================
// USER DASHBOARD
// ============================================================================

function UserDashboard({ currentPage, setCurrentPage, detailCardId, setDetailCardId, showNotif, setShowGrader, showGrader, showPSAGrader, setShowPSAGrader }) {
  const { inventory } = useContext(AdminContext);
  const { cart, cartDispatch } = useContext(CartContext);
  const { vault, vaultDispatch } = useContext(VaultContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);

  const filteredCards = inventory.filter(card => {
    const matchSearch = card.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       card.ekspansi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || card.tipe === filterType;
    const matchRarity = filterRarity === 'all' || card.kelangkaan === filterRarity;
    const matchPrice = card.harga_vault >= priceRange[0] && card.harga_vault <= priceRange[1];
    return matchSearch && matchType && matchRarity && matchPrice;
  });

  const handleAddToCart = (card) => {
    cartDispatch({ type: 'ADD_TO_CART', payload: card });
    showNotif(`${card.nama} added to cart!`, 'success');
  };

  const handleAddToVault = (card) => {
    vaultDispatch({ type: 'ADD_VAULT_CARD', payload: card });
    showNotif(`${card.nama} added to My Vault!`, 'success');
  };

  if (currentPage === 'cart') {
    return <ShoppingCart_Page cart={cart} cartDispatch={cartDispatch} showNotif={showNotif} setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'checkout') {
    return <CheckoutPage cart={cart} cartDispatch={cartDispatch} showNotif={showNotif} setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'payment-bank') {
    return <BankTransferPage cart={cart} cartDispatch={cartDispatch} showNotif={showNotif} setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'payment-qris') {
    return <QRISPage cart={cart} cartDispatch={cartDispatch} showNotif={showNotif} setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'order-success') {
    return <OrderSuccessPage setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'vault') {
    return <VaultPage vault={vault} vaultDispatch={vaultDispatch} showNotif={showNotif} />;
  }

  if (currentPage === 'psa-grader' || showPSAGrader) {
    return <PSAGraderPage onClose={() => { setShowPSAGrader(false); setCurrentPage('dashboard'); }} showNotif={showNotif} />;
  }

  if (detailCardId) {
    const card = inventory.find(c => c.id === detailCardId);
    if (!card) { setDetailCardId(null); return null; }
    return (
      <CardDetailPage 
        card={card} 
        onBack={() => setDetailCardId(null)}
        onAddToCart={handleAddToCart}
        onAddToVault={handleAddToVault}
        setShowGrader={setShowGrader}
        showGrader={showGrader}
        setShowPSAGrader={setShowPSAGrader}
        showNotif={showNotif}
      />
    );
  }

  if (showGrader) {
    return <VisualGraderPage onClose={() => setShowGrader(false)} showNotif={showNotif} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Explore Cards</h1>
        <p className="text-gray-600">Discover premium Pokémon cards in our curated collection</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Card name or set..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Types</option>
              <option value="Fire">Fire</option>
              <option value="Water">Water</option>
              <option value="Grass">Grass</option>
              <option value="Psychic">Psychic</option>
              <option value="Dragon">Dragon</option>
            </select>
          </div>

          {/* Rarity Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rarity</label>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Rarities</option>
              <option value="Rare">Rare</option>
              <option value="Ultra Rare">Ultra Rare</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="lg:col-span-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full accent-orange-600"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map(card => (
          <CardItem
            key={card.id}
            card={card}
            onView={() => setDetailCardId(card.id)}
            onAddCart={() => handleAddToCart(card)}
            onAddVault={() => handleAddToVault(card)}
          />
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-semibold">No cards found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CARD ITEM COMPONENT
// ============================================================================

function CardItem({ card, onView, onAddCart, onAddVault }) {
  return (
    <div
      onClick={onView}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition hover:scale-105 transform duration-300 cursor-pointer"
    >
      {/* Card Image Area */}
      <div className="h-80 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center relative overflow-hidden group">
        {isImageUrl(card.gambar) ? (
          <img src={card.gambar} alt={card.nama} className="h-full w-full object-contain p-3 group-hover:scale-105 transition duration-300" />
        ) : (
          <div className="text-7xl group-hover:scale-110 transition duration-300">{card.gambar}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-black text-lg text-gray-900 mb-1">{card.nama}</h3>
        <p className="text-sm text-gray-600 mb-3">{card.ekspansi}</p>

        {/* Badge Row */}
        <div className="flex gap-2 mb-3">
          <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">
            {card.tipe}
          </span>
          <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">
            {card.kelangkaan}
          </span>
          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
            {card.kondisi}
          </span>
        </div>

        {/* Price */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-600 mb-1">Our Price</p>
          <p className="text-2xl font-black text-orange-600">${card.harga_vault}</p>
        </div>

        {/* Stock */}
        <p className={`text-sm font-semibold mb-4 ${card.stok > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {card.stok > 0 ? `${card.stok} in stock` : 'Out of stock'}
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAddVault(); }}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            title="Add to My Vault"
          >
            <Star size={18} /> Vault
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddCart(); }}
            disabled={card.stok === 0}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} /> Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARD DETAIL PAGE
// ============================================================================

function CardDetailPage({ card, onBack, onAddToCart, onAddToVault, setShowGrader, showGrader, setShowPSAGrader, showNotif }) {
  if (showGrader) {
    return <VisualGraderPage onClose={() => setShowGrader(false)} showNotif={showNotif} card={card} />;
  }

  const avgPrice = (card.harga_vault + card.harga_cardtell + card.harga_pricecharting) / 3;
  const savings = card.harga_cardtell - card.harga_vault;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
      >
        ← Back to Browse
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Visual */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-4 text-center flex flex-col items-center justify-center sticky top-24">
            {isImageUrl(card.gambar) ? (
              <img src={card.gambar} alt={card.nama} className="max-h-96 w-full object-contain rounded-lg mb-4" />
            ) : (
              <div className="text-9xl mb-4">{card.gambar}</div>
            )}
            <h2 className="font-black text-2xl text-gray-900 text-center">{card.nama}</h2>
          </div>
        </div>

        {/* Card Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Info */}
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">{card.nama}</h1>
            <p className="text-lg text-gray-600">{card.ekspansi}</p>
            <p className="text-gray-700 mt-4">{card.deskripsi}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge bg="orange" text={card.tipe} />
            <Badge bg="purple" text={card.kelangkaan} />
            <Badge bg="green" text={card.kondisi} />
            <Badge bg="blue" text={`ID: ${card.id}`} />
          </div>

          {/* Price Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-green-600" size={24} />
              <h3 className="font-black text-lg text-gray-900">Price Comparison</h3>
            </div>
            <div className="space-y-3">
              <PriceRow label="CARD Vault (Our Price)" price={card.harga_vault} highlight={true} />
              <PriceRow label="CardTell" price={card.harga_cardtell} />
              <PriceRow label="PriceCharting" price={card.harga_pricecharting} />
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Market Average</span>
                  <span className="font-black text-lg text-gray-900">${avgPrice.toFixed(2)}</span>
                </div>
                <p className="text-sm text-green-600 font-semibold mt-1">
                  💰 You save ${savings.toFixed(2)} compared to CardTell
                </p>
              </div>
            </div>
          </div>

          {/* Stock & Actions */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-700 mb-1">Availability</p>
                <p className={`text-2xl font-black ${card.stok > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.stok > 0 ? `${card.stok} Available` : 'Out of Stock'}
                </p>
              </div>
              <ShoppingCart className="text-orange-600" size={40} />
            </div>

            <div className="space-y-3">
              <button
                onClick={onAddToCart}
                disabled={card.stok === 0}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>
              <button
                onClick={onAddToVault}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Star size={20} /> Add to My Vault
              </button>
            </div>
          </div>

          {/* Grading Tools */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-black text-lg text-gray-900 mb-4">Card Grading Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setShowGrader(true)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-4 py-3 rounded-lg transition flex items-center gap-2 border border-blue-200"
              >
                <Info size={20} /> Visual Grader
              </button>
              <button
                onClick={() => setShowPSAGrader(true)}
                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-90 text-white font-bold px-4 py-3 rounded-lg transition flex items-center gap-2"
              >
                <Sparkles size={20} /> AI PSA Estimator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ bg, text }) {
  const bgColor = {
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`${bgColor[bg]} text-sm font-bold px-3 py-1 rounded-full`}>
      {text}
    </span>
  );
}

function PriceRow({ label, price, highlight }) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-lg ${highlight ? 'bg-orange-50 border-2 border-orange-300' : 'bg-gray-50'}`}>
      <span className={`font-semibold ${highlight ? 'text-orange-700' : 'text-gray-700'}`}>{label}</span>
      <span className={`font-black text-lg ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>
        ${price.toFixed(2)}
      </span>
    </div>
  );
}

// ============================================================================
// SHOPPING CART PAGE
// ============================================================================

function ShoppingCart_Page({ cart, cartDispatch, showNotif, setCurrentPage }) {
  const total = cart.reduce((sum, item) => sum + (item.harga_vault * item.quantity), 0);
  const tax = total * 0.1;
  const finalTotal = total + tax;

  const handleCheckout = () => {
    if (cart.length === 0) {
      showNotif('Your cart is empty', 'error');
      return;
    }
    setCurrentPage('checkout');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-black text-gray-900 mb-8">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-semibold mb-6">Your cart is empty</p>
          <p className="text-gray-500">Start adding cards to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 flex gap-4">
                {isImageUrl(item.gambar) ? (
                  <img src={item.gambar} alt={item.nama} className="w-20 h-28 object-contain rounded-lg" />
                ) : (
                  <div className="text-6xl">{item.gambar}</div>
                )}
                <div className="flex-1">
                  <h3 className="font-black text-lg text-gray-900">{item.nama}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.ekspansi}</p>
                  <p className="font-bold text-orange-600">${item.harga_vault.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cartDispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })}
                      className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded font-bold"
                    >
                      −
                    </button>
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => cartDispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })}
                      className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => cartDispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}
                    className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6 h-fit sticky top-24">
            <h3 className="font-black text-xl text-gray-900 mb-6">Order Summary</h3>
            <div className="space-y-3 mb-6 border-b border-orange-200 pb-6">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax (10%)</span>
                <span className="font-bold">${tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="font-black text-lg text-gray-900">Total</span>
              <span className="font-black text-2xl text-orange-600">${finalTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition"
            >
              Proceed to Checkout
            </button>
            <p className="text-xs text-gray-600 mt-4 text-center">Secure checkout • 30-day returns</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VAULT PAGE (Portfolio Tracker)
// ============================================================================

function VaultPage({ vault, vaultDispatch, showNotif }) {
  const totalValue = vault.reduce((sum, item) => sum + (item.harga_vault * item.quantity), 0);
  const avgPrice = vault.length > 0 ? totalValue / vault.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2">My Vault</h1>
        <p className="text-gray-600">Track and value your personal Pokémon card collection</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<Package className="text-orange-600" size={28} />}
          label="Total Cards"
          value={vault.reduce((sum, item) => sum + item.quantity, 0)}
        />
        <StatCard 
          icon={<DollarSign className="text-green-600" size={28} />}
          label="Portfolio Value"
          value={`$${totalValue.toFixed(2)}`}
        />
        <StatCard 
          icon={<TrendingUp className="text-blue-600" size={28} />}
          label="Avg Card Value"
          value={`$${avgPrice.toFixed(2)}`}
        />
      </div>

      {/* Vault Items */}
      {vault.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Star size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 font-semibold mb-2">Your vault is empty</p>
          <p className="text-gray-500">Add cards from the browse section to start tracking your collection</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vault.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
              {isImageUrl(item.gambar) ? (
                <img src={item.gambar} alt={item.nama} className="w-16 h-24 object-contain rounded-lg" />
              ) : (
                <div className="text-5xl">{item.gambar}</div>
              )}
              <div className="flex-1">
                <h3 className="font-black text-lg text-gray-900">{item.nama}</h3>
                <p className="text-sm text-gray-600">{item.ekspansi}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Per Unit</p>
                <p className="font-bold text-orange-600 mb-2">${item.harga_vault.toFixed(2)}</p>
                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="font-black text-2xl text-gray-900">${(item.harga_vault * item.quantity).toFixed(2)}</p>
              </div>
              <button
                onClick={() => vaultDispatch({ type: 'REMOVE_VAULT_CARD', payload: item.id })}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHECKOUT PAGE
// ============================================================================

function CheckoutPage({ cart, cartDispatch, showNotif, setCurrentPage }) {
  const total = cart.reduce((sum, item) => sum + (item.harga_vault * item.quantity), 0);
  const tax = total * 0.1;
  const shipping = 4.99;
  const finalTotal = total + tax + shipping;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-3">Cart is Empty</h2>
        <p className="text-gray-600 mb-8">Add some cards before checking out!</p>
        <button onClick={() => setCurrentPage('dashboard')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-lg transition">
          Browse Cards
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => setCurrentPage('cart')} className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold">
        <ChevronLeft size={20} /> Back to Cart
      </button>

      <h1 className="text-4xl font-black text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <h3 className="font-black text-lg text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  {isImageUrl(item.gambar) ? (
                    <img src={item.gambar} alt={item.nama} className="w-10 h-14 object-contain rounded" />
                  ) : (
                    <span className="text-2xl">{item.gambar}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.nama}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-sm text-gray-900">${(item.harga_vault * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (10%)</span><span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span><span className="font-semibold">${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-black text-lg text-gray-900">Total</span>
                <span className="font-black text-xl text-orange-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <h2 className="text-xl font-black text-gray-900 mb-6">Select Payment Method</h2>
          <div className="space-y-4">
            {/* Bank Transfer */}
            <button
              onClick={() => setCurrentPage('payment-bank')}
              className="w-full bg-white rounded-xl border-2 border-gray-200 hover:border-orange-400 p-6 text-left transition group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 rounded-xl p-4 group-hover:bg-blue-200 transition">
                  <Building2 size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg text-gray-900">Bank Transfer</h3>
                  <p className="text-sm text-gray-600">Transfer via Virtual Account — BCA, Mandiri, BNI</p>
                </div>
                <ArrowRight size={24} className="text-gray-400 group-hover:text-orange-600 transition" />
              </div>
            </button>

            {/* QRIS */}
            <button
              onClick={() => setCurrentPage('payment-qris')}
              className="w-full bg-white rounded-xl border-2 border-gray-200 hover:border-orange-400 p-6 text-left transition group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 text-purple-600 rounded-xl p-4 group-hover:bg-purple-200 transition">
                  <QrCode size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg text-gray-900">QRIS</h3>
                  <p className="text-sm text-gray-600">Scan QR code — GoPay, OVO, DANA, ShopeePay</p>
                </div>
                <ArrowRight size={24} className="text-gray-400 group-hover:text-orange-600 transition" />
              </div>
            </button>

            {/* Credit Card (disabled) */}
            <div className="w-full bg-gray-50 rounded-xl border-2 border-gray-200 p-6 text-left opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="bg-gray-200 text-gray-500 rounded-xl p-4">
                  <CreditCard size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg text-gray-500">Credit / Debit Card</h3>
                  <p className="text-sm text-gray-400">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BANK TRANSFER PAGE
// ============================================================================

function BankTransferPage({ cart, cartDispatch, showNotif, setCurrentPage }) {
  const total = cart.reduce((sum, item) => sum + (item.harga_vault * item.quantity), 0);
  const tax = total * 0.1;
  const shipping = 4.99;
  const finalTotal = total + tax + shipping;
  const [selectedBank, setSelectedBank] = useState('bca');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86400);
  const [vaNumber] = useState(`8801${Math.floor(1000000000 + Math.random() * 9000000000)}`);

  const banks = {
    bca: { name: 'BCA', icon: '🏦' },
    mandiri: { name: 'Mandiri', icon: '🏛️' },
    bni: { name: 'BNI', icon: '🏢' },
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(vaNumber).catch(() => {});
    setCopied(true);
    showNotif('Virtual Account number copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    cartDispatch({ type: 'CLEAR_CART' });
    setCurrentPage('order-success');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => setCurrentPage('checkout')} className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold">
        <ChevronLeft size={20} /> Back
      </button>

      <h1 className="text-3xl font-black text-gray-900 mb-8">Bank Transfer</h1>

      {/* Bank Selection */}
      <div className="flex gap-3 mb-6">
        {Object.entries(banks).map(([key, bank]) => (
          <button
            key={key}
            onClick={() => setSelectedBank(key)}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition border-2 ${
              selectedBank === key
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            {bank.icon} {bank.name}
          </button>
        ))}
      </div>

      {/* Payment Details Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Timer */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={20} />
            <span className="font-semibold">Complete payment within</span>
          </div>
          <span className="font-black text-xl font-mono">{formatTime(timeLeft)}</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Bank Info */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Bank</p>
            <p className="font-black text-xl text-gray-900">{banks[selectedBank].icon} {banks[selectedBank].name}</p>
          </div>

          {/* VA Number */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-2">Virtual Account Number</p>
            <div className="flex items-center justify-between">
              <p className="font-black text-2xl text-gray-900 font-mono tracking-wider">{vaNumber}</p>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${
                  copied ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="font-black text-3xl text-orange-600">${finalTotal.toFixed(2)}</p>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Payment Instructions</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex gap-2"><span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">1</span> Open your {banks[selectedBank].name} mobile banking app</p>
              <p className="flex gap-2"><span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">2</span> Select "Transfer" → "Virtual Account"</p>
              <p className="flex gap-2"><span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">3</span> Enter the Virtual Account number above</p>
              <p className="flex gap-2"><span className="bg-orange-100 text-orange-700 rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">4</span> Confirm the amount and complete payment</p>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition text-lg"
          >
            I've Completed Payment
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// QRIS PAGE
// ============================================================================

function QRISPage({ cart, cartDispatch, showNotif, setCurrentPage }) {
  const total = cart.reduce((sum, item) => sum + (item.harga_vault * item.quantity), 0);
  const tax = total * 0.1;
  const shipping = 4.99;
  const finalTotal = total + tax + shipping;
  const [status, setStatus] = useState('waiting');

  useEffect(() => {
    const timer1 = setTimeout(() => setStatus('verifying'), 4000);
    const timer2 = setTimeout(() => {
      setStatus('success');
      cartDispatch({ type: 'CLEAR_CART' });
    }, 6000);
    const timer3 = setTimeout(() => setCurrentPage('order-success'), 7500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, []);

  const QRCodeSVG = () => {
    const size = 200;
    const modules = 25;
    const moduleSize = size / modules;
    const rects = [];
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const isTopLeft = row < 7 && col < 7;
        const isTopRight = row < 7 && col >= modules - 7;
        const isBottomLeft = row >= modules - 7 && col < 7;
        const isFinderArea = isTopLeft || isTopRight || isBottomLeft;

        let fill = false;
        if (isFinderArea) {
          const lr = isTopLeft ? row : (isTopRight ? row : row - (modules - 7));
          const lc = isTopLeft ? col : (isTopRight ? col - (modules - 7) : col);
          fill = lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
        } else {
          fill = ((row * 7 + col * 13 + row * col) % 3) !== 0;
        }

        if (fill) {
          rects.push(<rect key={`${row}-${col}`} x={col * moduleSize} y={row * moduleSize} width={moduleSize} height={moduleSize} fill="#1a1a2e" />);
        }
      }
    }
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
        <rect width={size} height={size} fill="white" />
        {rects}
      </svg>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => setCurrentPage('checkout')} className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold">
        <ChevronLeft size={20} /> Back
      </button>

      <h1 className="text-3xl font-black text-gray-900 mb-8">QRIS Payment</h1>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 text-center">
          <p className="font-semibold">Scan QR to Pay</p>
          <p className="text-purple-200 text-sm">GoPay • OVO • DANA • ShopeePay • LinkAja</p>
        </div>

        <div className="p-8 flex flex-col items-center">
          <div className={`relative mb-6 p-4 border-4 rounded-2xl transition-all duration-500 ${
            status === 'success' ? 'border-green-400 bg-green-50' :
            status === 'verifying' ? 'border-yellow-400 bg-yellow-50 animate-pulse' :
            'border-gray-200 bg-white'
          }`}>
            {status === 'success' ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <div className="bg-green-500 rounded-full p-6">
                  <Check size={64} className="text-white" />
                </div>
              </div>
            ) : (
              <>
                <QRCodeSVG />
                {status === 'verifying' && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="font-bold text-sm text-gray-700">Verifying...</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="text-center mb-6">
            {status === 'waiting' && (
              <>
                <p className="font-black text-xl text-gray-900 mb-1">Scan this QR Code</p>
                <p className="text-gray-600 text-sm">Open your e-wallet app and scan to pay</p>
                <div className="mt-3 flex items-center justify-center gap-2 text-orange-600">
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">Waiting for payment...</span>
                </div>
              </>
            )}
            {status === 'verifying' && (
              <>
                <p className="font-black text-xl text-yellow-700 mb-1">Payment Detected!</p>
                <p className="text-gray-600 text-sm">Verifying your payment...</p>
              </>
            )}
            {status === 'success' && (
              <>
                <p className="font-black text-xl text-green-600 mb-1">Payment Successful! ✅</p>
                <p className="text-gray-600 text-sm">Redirecting to order confirmation...</p>
              </>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 w-full text-center">
            <p className="text-sm text-gray-500 mb-1">Total Payment</p>
            <p className="font-black text-3xl text-orange-600">${finalTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ORDER SUCCESS PAGE
// ============================================================================

function OrderSuccessPage({ setCurrentPage }) {
  const [orderNumber] = useState(`CV-${Date.now().toString().slice(-8)}`);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className={`text-center transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mb-8">
          <div className="inline-block bg-green-100 rounded-full p-6 mb-4">
            <div className="bg-green-500 rounded-full p-4">
              <Check size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Order Placed! 🎉</h1>
          <p className="text-lg text-gray-600">Thank you for your purchase</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8 text-left">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-black text-xl text-gray-900 font-mono">{orderNumber}</p>
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
              Confirmed
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-semibold text-green-600">Payment Verified ✓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-semibold text-gray-900">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Delivery</span>
              <span className="font-semibold text-gray-900">3-5 business days</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 p-6 mb-8">
          <p className="text-sm text-orange-700 font-semibold mb-2">📦 What's Next?</p>
          <p className="text-gray-700 text-sm">We're preparing your cards for shipping. You'll receive a tracking number via email once your order is dispatched.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => setCurrentPage('dashboard')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-xl transition">
            Continue Shopping
          </button>
          <button onClick={() => setCurrentPage('vault')} className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-8 py-3 rounded-xl border-2 border-gray-300 transition">
            View My Vault
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VISUAL GRADER PAGE
// ============================================================================

function VisualGraderPage({ onClose, showNotif, card }) {
  const [conditions, setConditions] = useState({
    cornerWhitening: false,
    foilScratches: false,
    centeringIssue: false,
    edgeDamage: false,
    printDefect: false,
    surfaceWear: false,
  });

  const defectCount = Object.values(conditions).filter(Boolean).length;
  const getGrade = () => {
    if (defectCount === 0) return { grade: 'Mint', color: 'green', abbr: 'MT' };
    if (defectCount <= 2) return { grade: 'Near Mint', color: 'blue', abbr: 'NM' };
    if (defectCount <= 4) return { grade: 'Lightly Played', color: 'yellow', abbr: 'LP' };
    return { grade: 'Played', color: 'red', abbr: 'PL' };
  };

  const gradeInfo = getGrade();

  const handleToggle = (key) => {
    setConditions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    showNotif(`Card graded as ${gradeInfo.grade}!`, 'success');
    onClose();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onClose}
        className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grader Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Visual Condition Evaluator</h2>
            <p className="text-gray-600 mb-6">Check any condition issues you observe on your card:</p>

            <div className="space-y-3">
              {[
                { key: 'cornerWhitening', label: 'White corners/edges' },
                { key: 'foilScratches', label: 'Foil scratches or scuffing' },
                { key: 'centeringIssue', label: 'Centering issues' },
                { key: 'edgeDamage', label: 'Edge damage or dents' },
                { key: 'printDefect', label: 'Print lines or spots' },
                { key: 'surfaceWear', label: 'General surface wear' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200">
                  <input
                    type="checkbox"
                    checked={conditions[item.key]}
                    onChange={() => handleToggle(item.key)}
                    className="w-5 h-5 accent-orange-600 rounded"
                  />
                  <span className="font-semibold text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6">
              <p className="text-sm text-gray-600 mb-2">Condition Issues Found: {defectCount}</p>
              <button
                onClick={handleSave}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition"
              >
                Save Grade
              </button>
            </div>
          </div>
        </div>

        {/* Grade Result - FIXED: use static class maps instead of dynamic Tailwind interpolation */}
        <div>
          {(() => {
            const colorMap = {
              green: {
                wrapper: 'bg-green-50 border-green-300',
                badge: 'bg-green-600',
                text: 'text-green-700',
              },
              blue: {
                wrapper: 'bg-blue-50 border-blue-300',
                badge: 'bg-blue-600',
                text: 'text-blue-700',
              },
              yellow: {
                wrapper: 'bg-yellow-50 border-yellow-300',
                badge: 'bg-yellow-500',
                text: 'text-yellow-700',
              },
              red: {
                wrapper: 'bg-red-50 border-red-300',
                badge: 'bg-red-600',
                text: 'text-red-700',
              },
            };
            const c = colorMap[gradeInfo.color] || colorMap.green;
            return (
              <div className={`${c.wrapper} rounded-xl border-2 p-6 text-center sticky top-24`}>
                <p className="text-sm text-gray-700 mb-2">Estimated Grade</p>
                <div className={`${c.badge} text-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4`}>
                  <div className="text-center">
                    <p className="text-2xl font-black">{gradeInfo.abbr}</p>
                    <p className="text-xs font-semibold">Grade</p>
                  </div>
                </div>
                <h3 className={`text-3xl font-black ${c.text} mb-2`}>{gradeInfo.grade}</h3>
                <p className="text-sm text-gray-700">Based on {defectCount} condition issue{defectCount !== 1 ? 's' : ''}</p>
                <div className="bg-white rounded-lg p-3 mt-4 text-left">
                  <p className="text-xs font-bold text-gray-700 mb-2">GRADE SCALE</p>
                  <div className="space-y-2 text-xs">
                    <p><strong>MT</strong> - No visible defects</p>
                    <p><strong>NM</strong> - Minor wear, 1-2 issues</p>
                    <p><strong>LP</strong> - Moderate wear, 3-4 issues</p>
                    <p><strong>PL</strong> - Heavy wear, 5+ issues</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AI PSA GRADER PAGE
// ============================================================================

function PSAGraderPage({ onClose, showNotif }) {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(null); // 'front' | 'back' | null
  const [animateIn, setAnimateIn] = useState(false);
  const frontRef = useRef();
  const backRef = useRef();

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 50);
  }, []);

  const handleFile = (file, side) => {
    if (!file || !file.type.startsWith('image/')) {
      showNotif('Please upload a valid image file', 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    if (side === 'front') { setFrontImage(file); setFrontPreview(url); }
    else { setBackImage(file); setBackPreview(url); }
  };

  const handleDrop = (e, side) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    handleFile(file, side);
  };

  const handleAnalyze = async () => {
    if (!frontImage || !backImage) {
      showNotif('Please upload both front and back photos', 'error');
      return;
    }
    setIsAnalyzing(true);
    setResult(null);

    // Simulate AI analysis — deterministic based on image file sizes for fun variance
    await new Promise(r => setTimeout(r, 3200));

    const sizeScore = ((frontImage.size + backImage.size) % 400) / 400; // 0..1
    const baseGrade = 6.5 + sizeScore * 3; // 6.5..9.5
    const grade = Math.min(10, Math.max(1, parseFloat(baseGrade.toFixed(1))));
    const roundedGrade = Math.round(grade * 2) / 2; // round to nearest 0.5

    const getLabel = (g) => {
      if (g >= 9.5) return { label: 'GEM MINT', color: '#22c55e', bg: '#f0fdf4', border: '#86efac' };
      if (g >= 8.5) return { label: 'MINT', color: '#16a34a', bg: '#f0fdf4', border: '#4ade80' };
      if (g >= 7.5) return { label: 'NEAR MINT-MINT', color: '#2563eb', bg: '#eff6ff', border: '#93c5fd' };
      if (g >= 6.5) return { label: 'EXCELLENT-MINT', color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd' };
      if (g >= 5.5) return { label: 'EXCELLENT', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' };
      if (g >= 4.5) return { label: 'VERY GOOD-EXCELLENT', color: '#ea580c', bg: '#fff7ed', border: '#fdba74' };
      if (g >= 3.5) return { label: 'VERY GOOD', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' };
      return { label: 'POOR', color: '#6b7280', bg: '#f9fafb', border: '#d1d5db' };
    };

    const info = getLabel(roundedGrade);

    const centering = Math.max(50, 95 - Math.round(sizeScore * 40));
    const corners = Math.max(5, 10 - Math.round(sizeScore * 4.5));
    const edges = Math.max(5, 10 - Math.round(sizeScore * 3.5));
    const surface = Math.max(5, 10 - Math.round(sizeScore * 4));

    setResult({
      grade: roundedGrade,
      ...info,
      subgrades: {
        centering: `${centering}/${100 - centering}`,
        corners: corners,
        edges: edges,
        surface: surface,
      },
      recommendation: roundedGrade >= 8.5
        ? 'Great candidate for PSA submission! High grades attract premium collectors.'
        : roundedGrade >= 7
        ? 'Decent grade — consider submission if the card has strong market value.'
        : 'May not be worth grading costs. Consider raw sale or personal collection.',
    });

    setIsAnalyzing(false);
    showNotif(`Analysis complete! Estimated PSA ${roundedGrade}`, 'success');
  };

  const reset = () => {
    setFrontImage(null); setBackImage(null);
    setFrontPreview(null); setBackPreview(null);
    setResult(null);
    if (frontRef.current) frontRef.current.value = '';
    if (backRef.current) backRef.current.value = '';
  };

  const UploadZone = ({ side, preview, inputRef }) => (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(side); }}
      onDragLeave={() => setDragOver(null)}
      onDrop={(e) => handleDrop(e, side)}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden
        ${ dragOver === side
          ? 'border-orange-500 bg-orange-50 scale-105'
          : preview
          ? 'border-green-400 bg-green-50'
          : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
        }`}
      style={{ minHeight: '220px' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0], side)}
      />
      {preview ? (
        <div className="flex flex-col items-center justify-center h-full p-2">
          <img src={preview} alt={`${side} card`} className="max-h-48 max-w-full object-contain rounded-xl shadow-md" />
          <p className="mt-2 text-xs font-semibold text-green-600">✓ {side === 'front' ? 'Front' : 'Back'} uploaded</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="bg-white rounded-full p-4 mb-3 shadow-sm">
            <Camera size={32} className="text-gray-400" />
          </div>
          <p className="font-bold text-gray-700 mb-1">{side === 'front' ? 'Card Front' : 'Card Back'}</p>
          <p className="text-xs text-gray-500">Drag & drop or click to upload</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-500 ${ animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4' }`}>
      <button onClick={onClose} className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold">
        ← Back
      </button>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-5 py-2 rounded-full text-sm font-bold mb-4">
          <Sparkles size={16} /> AI-POWERED
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">PSA Grade Estimator</h1>
        <p className="text-gray-500 max-w-lg mx-auto">Upload photos of your card's front and back. Our AI will estimate what PSA grade your card would likely receive.</p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Upload Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Camera size={16} /> Front of Card</p>
              <UploadZone side="front" preview={frontPreview} inputRef={frontRef} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Camera size={16} /> Back of Card</p>
              <UploadZone side="back" preview={backPreview} inputRef={backRef} />
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-bold text-blue-800 mb-2">📸 Tips for best results:</p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Use good lighting — avoid shadows or glare</li>
              <li>Lay card flat on a plain background</li>
              <li>Capture the entire card including edges</li>
              <li>Keep the camera steady for sharp focus</li>
            </ul>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !frontImage || !backImage}
            className="w-full py-4 rounded-xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-3
              disabled:opacity-50 disabled:cursor-not-allowed
              enabled:bg-gradient-to-r enabled:from-orange-500 enabled:to-purple-600 enabled:text-white enabled:hover:shadow-lg enabled:hover:scale-105
              bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:shadow-lg hover:scale-105"
          >
            {isAnalyzing ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" style={{borderWidth:'3px'}} />
                Analyzing your card...
              </>
            ) : (
              <>
                <Zap size={24} /> Estimate PSA Grade
              </>
            )}
          </button>

          {/* Analyzing overlay feedback */}
          {isAnalyzing && (
            <div className="bg-white border border-orange-200 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-orange-200 rounded-full" />
                  <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                  <Sparkles size={24} className="text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
              <p className="font-bold text-gray-900 mb-1">AI is inspecting your card</p>
              <p className="text-sm text-gray-500">Analyzing centering, corners, edges & surface...</p>
              <div className="mt-4 flex justify-center gap-2">
                {['Scanning front...', 'Checking edges...', 'Evaluating surface...'].map((step, i) => (
                  <span key={i} className="text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-semibold animate-pulse" style={{ animationDelay: `${i * 0.4}s` }}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Result Section */
        <div className="space-y-6">
          {/* Grade Card */}
          <div
            className="rounded-2xl p-8 text-center border-2 shadow-lg"
            style={{ background: result.bg, borderColor: result.border }}
          >
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: result.color }}>PSA Grade Estimate</p>
            <div
              className="w-36 h-36 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
              style={{ background: result.color }}
            >
              <div className="text-center text-white">
                <p className="text-5xl font-black leading-none">{result.grade}</p>
                <p className="text-xs font-bold mt-1 tracking-widest">PSA</p>
              </div>
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ color: result.color }}>{result.label}</h2>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: i < Math.round(result.grade) ? '24px' : '12px',
                    background: i < Math.round(result.grade) ? result.color : '#e5e7eb',
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">{result.recommendation}</p>
          </div>

          {/* Subgrades */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-black text-lg text-gray-900 mb-5 flex items-center gap-2">
              <Award size={22} className="text-orange-600" /> Estimated Sub-grades
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Centering', value: result.subgrades.centering, note: 'Left/Right split', icon: '⚖️' },
                { label: 'Corners', value: `${result.subgrades.corners}/10`, note: 'Sharpness', icon: '📐' },
                { label: 'Edges', value: `${result.subgrades.edges}/10`, note: 'Smoothness', icon: '✂️' },
                { label: 'Surface', value: `${result.subgrades.surface}/10`, note: 'Gloss & print', icon: '✨' },
              ].map(sg => (
                <div key={sg.label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <p className="text-2xl mb-1">{sg.icon}</p>
                  <p className="text-xs text-gray-500 mb-1">{sg.label}</p>
                  <p className="font-black text-xl text-gray-900">{sg.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{sg.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-800">
              <strong>⚠️ Disclaimer:</strong> This is an AI-powered estimate for entertainment and educational purposes only.
              Actual PSA grades are determined by professional graders and may differ significantly.
              Always submit to PSA for an official grade.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> Grade Another Card
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition"
            >
              Back to Browse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================

function AdminDashboard({ currentPage, setCurrentPage, showNotif, setShowGrader, showGrader }) {
  const { inventory, inventoryDispatch } = useContext(AdminContext);

  if (currentPage === 'inventory') {
    return <InventoryManager inventory={inventory} inventoryDispatch={inventoryDispatch} showNotif={showNotif} />;
  }

  if (showGrader) {
    return <VisualGraderPage onClose={() => setShowGrader(false)} showNotif={showNotif} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your store and track performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<Package className="text-orange-600" size={28} />}
          label="Total Products"
          value={inventory.length}
        />
        <StatCard 
          icon={<ShoppingCart className="text-blue-600" size={28} />}
          label="Total Stock"
          value={inventory.reduce((sum, card) => sum + card.stok, 0)}
        />
        <StatCard 
          icon={<DollarSign className="text-green-600" size={28} />}
          label="Inventory Value"
          value={`$${(inventory.reduce((sum, card) => sum + (card.harga_vault * card.stok), 0)).toFixed(2)}`}
        />
        <StatCard 
          icon={<TrendingUp className="text-purple-600" size={28} />}
          label="Avg Card Price"
          value={`$${(inventory.reduce((sum, card) => sum + card.harga_vault, 0) / inventory.length).toFixed(2)}`}
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-black text-gray-900">Recent Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Card Name</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Set</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Price</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Value</th>
              </tr>
            </thead>
            <tbody>
              {inventory.slice(0, 5).map(card => (
                <tr key={card.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                    {isImageUrl(card.gambar) ? (
                      <img src={card.gambar} alt={card.nama} className="w-10 h-14 object-contain rounded" />
                    ) : (
                      <span>{card.gambar}</span>
                    )}
                    {card.nama}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{card.ekspansi}</td>
                  <td className="px-6 py-4 font-bold text-orange-600">${card.harga_vault.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full font-bold text-sm ${card.stok > 5 ? 'bg-green-100 text-green-700' : card.stok > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {card.stok}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">${(card.harga_vault * card.stok).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <button
            onClick={() => setCurrentPage('inventory')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2 rounded-lg transition"
          >
            Manage Inventory
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INVENTORY MANAGER
// ============================================================================

function InventoryManager({ inventory, inventoryDispatch, showNotif }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: '', ekspansi: '', kondisi: '', stok: 0, harga_vault: 0,
    harga_cardtell: 0, harga_pricecharting: 0, gambar: '', tipe: '', kelangkaan: '', deskripsi: ''
  });
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setFormData({
      nama: '', ekspansi: '', kondisi: '', stok: 0, harga_vault: 0,
      harga_cardtell: 0, harga_pricecharting: 0, gambar: '', tipe: '', kelangkaan: '', deskripsi: ''
    });
    setEditingId(null);
  };

  const handleAddEdit = () => {
    if (!formData.nama || !formData.harga_vault) {
      showNotif('Please fill in card name and price', 'error');
      return;
    }

    if (editingId) {
      inventoryDispatch({ type: 'UPDATE_CARD', payload: { ...formData, id: editingId } });
      showNotif(`Card "${formData.nama}" updated!`, 'success');
    } else {
      inventoryDispatch({ type: 'ADD_CARD', payload: formData });
      showNotif(`Card "${formData.nama}" added!`, 'success');
    }
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (card) => {
    setFormData(card);
    setEditingId(card.id);
    setShowForm(true);
  };

  const handleDelete = (id, nama) => {
    if (window.confirm(`Delete "${nama}"?`)) {
      inventoryDispatch({ type: 'DELETE_CARD', payload: id });
      showNotif(`Card "${nama}" deleted!`, 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage {inventory.length} products in your store</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition flex items-center gap-2"
        >
          <Plus size={20} /> {showForm ? 'Cancel' : 'Add New Card'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900 mb-6">{editingId ? 'Edit Card' : 'Add New Card'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(formData).map(key => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                {key === 'deskripsi' ? (
                  <textarea
                    value={formData[key]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 lg:col-span-3"
                    placeholder="Card description"
                  />
                ) : typeof formData[key] === 'number' ? (
                  <input
                    type="number"
                    step="0.01"
                    value={formData[key]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: key === 'stok' ? parseInt(e.target.value) : parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[key]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder={key}
                  />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleAddEdit}
            className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition"
          >
            {editingId ? 'Update Card' : 'Add Card'}
          </button>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Card</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Set</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Condition</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Price</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(card => (
                <tr key={card.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                    {isImageUrl(card.gambar) ? (
                      <img src={card.gambar} alt={card.nama} className="w-10 h-14 object-contain rounded" />
                    ) : (
                      <span>{card.gambar}</span>
                    )}
                    {card.nama}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{card.ekspansi}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">{card.kondisi}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-orange-600">${card.harga_vault.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full font-bold text-sm ${card.stok > 5 ? 'bg-green-100 text-green-700' : card.stok > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {card.stok}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(card)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(card.id, card.nama)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
