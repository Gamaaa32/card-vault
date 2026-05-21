import React, { useState, useContext, createContext, useReducer } from 'react';
import { ChevronDown, LogOut, Plus, Trash2, Edit2, Eye, EyeOff, Search, Filter, ShoppingCart, Home, Settings, BarChart3, Package, Users, LogIn, UserPlus, X, AlertCircle, CheckCircle, TrendingUp, DollarSign, Star, Info } from 'lucide-react';

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

  // Render Auth Page
  if (showAuth) {
    return (
      <AuthPage 
        onLogin={handleLogin}
        onRegister={handleRegister}
        authMode={authMode}
        setAuthMode={setAuthMode}
      />
    );
  }

  // Render Main App
  return (
    <AuthContext.Provider value={{ currentUser, handleLogout }}>
      <CartContext.Provider value={{ cart, cartDispatch }}>
        <AdminContext.Provider value={{ inventory, inventoryDispatch }}>
          <VaultContext.Provider value={{ vault, vaultDispatch }}>
            <div className="min-h-screen bg-white text-gray-900">
              <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
              
              {notification && <Notification notif={notification} />}

              {currentUser.role === 'admin' ? (
                <AdminDashboard 
                  currentPage={currentPage} 
                  setCurrentPage={setCurrentPage}
                  showNotif={showNotif}
                  setShowGrader={setShowGrader}
                  showGrader={showGrader}
                />
              ) : (
                <UserDashboard 
                  currentPage={currentPage} 
                  setCurrentPage={setCurrentPage}
                  detailCardId={detailCardId}
                  setDetailCardId={setDetailCardId}
                  showNotif={showNotif}
                  setShowGrader={setShowGrader}
                  showGrader={showGrader}
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

function AuthPage({ onLogin, onRegister, authMode, setAuthMode }) {
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

function UserDashboard({ currentPage, setCurrentPage, detailCardId, setDetailCardId, showNotif, setShowGrader, showGrader }) {
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
    return <ShoppingCart_Page cart={cart} cartDispatch={cartDispatch} showNotif={showNotif} />;
  }

  if (currentPage === 'vault') {
    return <VaultPage vault={vault} vaultDispatch={vaultDispatch} showNotif={showNotif} />;
  }

  if (detailCardId) {
    const card = inventory.find(c => c.id === detailCardId);
    return (
      <CardDetailPage 
        card={card} 
        onBack={() => setDetailCardId(null)}
        onAddToCart={handleAddToCart}
        onAddToVault={handleAddToVault}
        setShowGrader={setShowGrader}
        showGrader={showGrader}
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition hover:scale-105 transform duration-300">
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
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onView}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 rounded-lg transition"
          >
            View
          </button>
          <button
            onClick={onAddVault}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 rounded-lg transition flex items-center justify-center"
            title="Add to My Vault"
          >
            <Star size={18} />
          </button>
          <button
            onClick={onAddCart}
            disabled={card.stok === 0}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARD DETAIL PAGE
// ============================================================================

function CardDetailPage({ card, onBack, onAddToCart, onAddToVault, setShowGrader, showGrader, showNotif }) {
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

          {/* Grading Tool */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-gray-900 mb-1">Evaluate Card Condition</h3>
                <p className="text-sm text-gray-600">Use our visual grader to assess your card</p>
              </div>
              <button
                onClick={() => setShowGrader(true)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <Info size={20} /> Grade This Card
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

function ShoppingCart_Page({ cart, cartDispatch, showNotif }) {
  const total = cart.reduce((sum, item) => sum + (item.harga_vault * item.quantity), 0);
  const tax = total * 0.1;
  const finalTotal = total + tax;

  const handleCheckout = () => {
    if (cart.length === 0) {
      showNotif('Your cart is empty', 'error');
      return;
    }
    showNotif(`Order placed! Total: $${finalTotal.toFixed(2)}. Thank you for your purchase!`, 'success');
    cartDispatch({ type: 'CLEAR_CART' });
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

        {/* Grade Result */}
        <div>
          <div className={`bg-gradient-to-br from-${gradeInfo.color}-50 to-${gradeInfo.color}-100 rounded-xl border-2 border-${gradeInfo.color}-300 p-6 text-center sticky top-24`}>
            <p className="text-sm text-gray-700 mb-2">Estimated Grade</p>
            <div className={`bg-${gradeInfo.color}-600 text-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4`}>
              <div className="text-center">
                <p className="text-2xl font-black">{gradeInfo.abbr}</p>
                <p className="text-xs font-semibold">Grade</p>
              </div>
            </div>
            <h3 className={`text-3xl font-black text-${gradeInfo.color}-700 mb-2`}>{gradeInfo.grade}</h3>
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
        </div>
      </div>
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
