# CARD VAULT - API & Data Structure Reference

Dokumentasi untuk integrasi dengan backend dan database.

---

## 📋 Table of Contents
1. [Data Models](#data-models)
2. [API Endpoints](#api-endpoints)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Examples](#examples)

---

## Data Models

### 1. Product/Card Schema

```javascript
{
  id: String | Number,                    // Unique identifier
  nama: String,                           // Card name (e.g., "Charizard ex")
  ekspansi: String,                       // Set/expansion name
  kondisi: String,                        // Condition (Mint, Near Mint, Lightly Played, Played)
  deskripsi: String,                      // Card description
  stok: Number,                           // Current stock quantity
  
  // Pricing fields
  harga_vault: Number,                    // CARD Vault price (float, 2 decimals)
  harga_cardtell: Number,                 // CardTell market price
  harga_pricecharting: Number,            // PriceCharting market price
  
  // Classification
  tipe: String,                           // Type (Fire, Water, Grass, Psychic, Dragon, etc)
  kelangkaan: String,                     // Rarity (Rare, Ultra Rare, etc)
  gambar: String | URL,                   // Card image (emoji or image URL)
  
  // Metadata
  createdAt: ISO8601 Timestamp,
  updatedAt: ISO8601 Timestamp,
  createdBy: String,                      // Admin user ID who added this
}
```

**Example:**
```json
{
  "id": 1,
  "nama": "Charizard ex",
  "ekspansi": "Scarlet & Violet",
  "kondisi": "Mint",
  "deskripsi": "Classic fire dragon with stunning artwork",
  "stok": 5,
  "harga_vault": 45.99,
  "harga_cardtell": 48.50,
  "harga_pricecharting": 46.99,
  "tipe": "Fire",
  "kelangkaan": "Rare",
  "gambar": "🔥",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z",
  "createdBy": "admin123"
}
```

---

### 2. User Schema

```javascript
{
  id: String,                             // Unique identifier
  nama: String,                           // Full name
  email: String,                          // Email (unique)
  password: String,                       // Hashed password (never send to frontend)
  role: Enum,                             // "admin" | "user"
  
  // Profile info
  avatar: URL,                            // Profile picture
  phoneNumber: String,                    // Optional
  address: String,                        // Optional
  city: String,                           // Optional
  
  // Status
  isActive: Boolean,
  emailVerified: Boolean,
  
  // Metadata
  createdAt: ISO8601 Timestamp,
  lastLogin: ISO8601 Timestamp,
}
```

**Example:**
```json
{
  "id": "user1",
  "nama": "John Collector",
  "email": "john@example.com",
  "role": "user",
  "isActive": true,
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLogin": "2024-01-20T15:30:00Z"
}
```

---

### 3. Cart Item Schema

```javascript
{
  id: String,                             // Unique cart item ID
  userId: String,                         // User who owns this cart
  productId: String,                      // Reference to product
  quantity: Number,                       // Quantity ordered
  priceAtTime: Number,                    // Price when added (for history)
  addedAt: ISO8601 Timestamp,
}
```

---

### 4. Order Schema

```javascript
{
  id: String,                             // Unique order ID
  userId: String,                         // Customer ID
  items: Array<OrderItem>,                // Array of ordered items
  
  // Pricing
  subtotal: Number,                       // Sum of item prices
  tax: Number,                            // Tax amount (10% in current system)
  shipping: Number,                       // Shipping cost (0 for now)
  total: Number,                          // Grand total
  
  // Status
  status: Enum,                           // "pending" | "confirmed" | "shipped" | "delivered"
  paymentStatus: Enum,                    // "unpaid" | "paid" | "refunded"
  
  // Details
  shippingAddress: Object,                // Delivery address
  notes: String,                          // Special instructions
  
  // Metadata
  createdAt: ISO8601 Timestamp,
  updatedAt: ISO8601 Timestamp,
  completedAt: ISO8601 Timestamp,
}
```

---

### 5. Vault Item Schema

```javascript
{
  id: String,                             // Unique vault item ID
  userId: String,                         // User who owns this vault
  productId: String,                      // Reference to product
  quantity: Number,                       // Quantity owned
  condition: String,                      // Graded condition (from grader tool)
  grade: Enum,                            // "MT" | "NM" | "LP" | "PL"
  gradeDate: ISO8601 Timestamp,           // When graded
  notes: String,                          // Personal notes
  addedAt: ISO8601 Timestamp,
}
```

**Example:**
```json
{
  "id": "vault-item-1",
  "userId": "user1",
  "productId": "1",
  "quantity": 3,
  "condition": "Near Mint",
  "grade": "NM",
  "gradeDate": "2024-01-15T10:30:00Z",
  "notes": "From booster box pull",
  "addedAt": "2024-01-10T09:00:00Z"
}
```

---

## API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
GET  /api/auth/verify
```

---

### Products (Cards)

```
GET    /api/products              → Get all cards
GET    /api/products/:id          → Get single card
POST   /api/products              → Create card (Admin only)
PUT    /api/products/:id          → Update card (Admin only)
DELETE /api/products/:id          → Delete card (Admin only)

QUERY PARAMETERS:
  ?search=text                    → Search by name/set
  ?type=Fire,Water                → Filter by type
  ?rarity=Rare,Ultra             → Filter by rarity
  ?minPrice=10&maxPrice=100       → Filter by price range
  ?sort=price:asc|desc            → Sort results
  ?limit=20&offset=0              → Pagination
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama": "Charizard ex",
      // ... full card object
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

---

### Cart

```
GET    /api/users/:userId/cart            → Get user's cart
POST   /api/users/:userId/cart            → Add to cart
PUT    /api/users/:userId/cart/:itemId    → Update quantity
DELETE /api/users/:userId/cart/:itemId    → Remove from cart
DELETE /api/users/:userId/cart            → Clear cart
```

**POST /api/users/:userId/cart**
```json
{
  "productId": "1",
  "quantity": 2
}
```

**PUT /api/users/:userId/cart/:itemId**
```json
{
  "quantity": 3
}
```

---

### Orders

```
POST   /api/users/:userId/orders          → Create order from cart
GET    /api/users/:userId/orders          → Get user's orders
GET    /api/users/:userId/orders/:orderId → Get order detail
PUT    /api/users/:userId/orders/:orderId → Update order status (Admin)
```

**POST /api/users/:userId/orders**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Jakarta",
    "zipCode": "12345",
    "country": "Indonesia"
  },
  "notes": "Handle with care"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order-123",
    "total": 264.97,
    "status": "pending",
    "createdAt": "2024-01-20T15:30:00Z"
  }
}
```

---

### My Vault (Portfolio)

```
GET    /api/users/:userId/vault           → Get user's vault
POST   /api/users/:userId/vault           → Add card to vault
PUT    /api/users/:userId/vault/:itemId   → Update vault item (quantity/grade)
DELETE /api/users/:userId/vault/:itemId   → Remove from vault
GET    /api/users/:userId/vault/stats     → Get portfolio stats
```

**POST /api/users/:userId/vault**
```json
{
  "productId": "1",
  "quantity": 3,
  "condition": "Near Mint",
  "grade": "NM"
}
```

**Response dari GET /api/users/:userId/vault/stats:**
```json
{
  "success": true,
  "data": {
    "totalCards": 12,
    "totalValue": 564.50,
    "averageCardValue": 47.04,
    "topCard": {
      "id": 4,
      "nama": "Mewtwo ex",
      "value": 89.99
    }
  }
}
```

---

### Price Comparison

```
GET /api/prices/:productId          → Get all prices for a card
GET /api/prices/comparison          → Get price data for multiple cards
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "1",
    "cardName": "Charizard ex",
    "prices": {
      "cardVault": 45.99,
      "cardTell": 48.50,
      "priceCharting": 46.99,
      "average": 47.16,
      "lowestPrice": 45.99,
      "timestamp": "2024-01-20T15:30:00Z"
    }
  }
}
```

---

### Admin Dashboard

```
GET    /api/admin/dashboard        → Get dashboard stats
GET    /api/admin/products         → Get all products with admin view
GET    /api/admin/orders           → Get all orders
GET    /api/admin/users            → Get all users
PUT    /api/admin/settings         → Update store settings
```

**Response dari GET /api/admin/dashboard:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalProducts": 50,
      "totalStock": 250,
      "inventoryValue": 12345.67,
      "averagePrice": 246.91
    },
    "recentProducts": [/* ... */],
    "recentOrders": [/* ... */]
  }
}
```

---

## Authentication

### JWT Token Flow

```
1. User login dengan email & password
2. Server return: { token, refreshToken, user }
3. Client store token di localStorage
4. Send token di header: Authorization: Bearer {token}
5. Token expire → use refreshToken untuk get new token
```

**Example Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Roles & Permissions

```
USER (Pembeli):
  ✓ Browse products
  ✓ Search & filter
  ✓ View details
  ✓ Add to cart
  ✓ Checkout
  ✓ View orders
  ✓ Manage vault
  ✓ Use grading tool
  ✗ Manage inventory
  ✗ View other users

ADMIN (Penjual):
  ✓ All user permissions
  ✓ Create/edit/delete products
  ✓ Manage inventory
  ✓ View all orders
  ✓ View all users
  ✓ Update settings
  ✗ Cannot delete users
```

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 999 not found",
    "status": 404
  }
}
```

### Common Error Codes

```
400 BAD_REQUEST       → Invalid input
401 UNAUTHORIZED      → Missing/invalid token
403 FORBIDDEN         → Insufficient permissions
404 NOT_FOUND         → Resource not found
409 CONFLICT          → Duplicate or conflict
422 VALIDATION_ERROR  → Validation failed
500 SERVER_ERROR      → Internal server error
```

---

## Frontend to Backend Migration

### Current State (Dummy Data)
```javascript
// Using useState with dummy data
const [inventory, setInventory] = useState(dummyCards);
```

### Next State (API Integration)
```javascript
// Using useEffect with API calls
useEffect(() => {
  fetch('https://your-api.com/api/products')
    .then(res => res.json())
    .then(data => setInventory(data.data))
    .catch(err => console.error(err));
}, []);
```

### Complete Example: Fetch Products
```javascript
// Create API service
const api = {
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`/api/products?${params}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },
  
  addProduct: async (product) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  },
  
  updateProduct: async (id, product) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  },
  
  deleteProduct: async (id) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

// Use in component
useEffect(() => {
  api.getProducts({ type: 'Fire', limit: 20 })
    .then(data => setInventory(data.data))
    .catch(err => showNotif(err.message, 'error'));
}, []);
```

---

## Database Schema (SQL Example)

```sql
-- Products Table
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255) NOT NULL,
  ekspansi VARCHAR(255),
  kondisi VARCHAR(50),
  deskripsi TEXT,
  stok INT DEFAULT 0,
  harga_vault DECIMAL(10, 2),
  harga_cardtell DECIMAL(10, 2),
  harga_pricecharting DECIMAL(10, 2),
  tipe VARCHAR(50),
  kelangkaan VARCHAR(50),
  gambar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Users Table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Cart Items Table
CREATE TABLE cart_items (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  price_at_time DECIMAL(10, 2),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Vault Items Table
CREATE TABLE vault_items (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  condition VARCHAR(50),
  grade ENUM('MT', 'NM', 'LP', 'PL'),
  grade_date TIMESTAMP,
  notes TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Orders Table
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  total DECIMAL(10, 2),
  status ENUM('pending', 'confirmed', 'shipped', 'delivered') DEFAULT 'pending',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  shipping_address JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Rate Limiting & Caching

```
API Rate Limits:
- Public endpoints: 100 req/hour
- Authenticated: 1000 req/hour
- Admin: 10000 req/hour

Cache Strategy:
- Products list: Cache 5 minutes
- Product detail: Cache 10 minutes
- Prices: Cache 1 minute (always fresh)
- User data: No cache
```

---

## Testing Endpoints

Use Postman atau curl untuk test:

```bash
# Get all products
curl https://your-api.com/api/products

# Get single product
curl https://your-api.com/api/products/1

# Create product (Admin)
curl -X POST https://your-api.com/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nama":"New Card","ekspansi":"Set","stok":5,...}'

# Add to cart
curl -X POST https://your-api.com/api/users/user1/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"1","quantity":2}'
```

---

**Ready untuk integrate dengan backend!** 🚀
