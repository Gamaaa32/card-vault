CARD Vault adalah sebuah aplikasi web e-commerce dan pelacak portofolio (portfolio tracker) premium yang dikhususkan untuk kartu Pokémon TCG (Trading Card Game).

Dikembangkan oleh Tim DenvelDelzaro yang beranggotakan :
1. Nyoman Duta Gama Trinugraha Giri
2. Denzel Delvaro Nugroho
3. Christopher Djuhartono

Penjelasan rinci :
1. Teknologi & Framework yang Digunakan :

Framework Utama: React.js (dikembangkan menggunakan build tool Vite).
Styling (Desain/UI): Tailwind CSS. Menggunakan pendekatan utility-first untuk membuat desain yang responsif, modern, dan rapi.
Iconography: Lucide React (koleksi ikon SVG yang ringan dan modern).
Authentication (Keamanan): Menggunakan kombinasi Firebase Authentication (untuk fitur "Sign in with Google") dan sistem dummy/mock (untuk login dengan email/password statis untuk keperluan demo).
Hosting/Deployment: Vercel (platform hosting yang terintegrasi langsung dengan GitHub untuk Continuous Deployment/CI-CD).

2. Arsitektur & Manajemen State (Data)
Karena ini adalah Single Page Application (SPA) tanpa backend/database khusus, semua data dan state diatur di dalam browser menggunakan React Hooks:

useContext & createContext: Digunakan untuk membagikan data penting ke seluruh komponen aplikasi. Konteks yang ada:
AuthContext: Menyimpan data user yang sedang login.
CartContext: Menyimpan barang yang ada di keranjang belanja.
AdminContext: Menyimpan data inventaris kartu (katalog toko).
VaultContext: Menyimpan koleksi kartu pribadi milik user.
useReducer: Digunakan untuk mengelola aksi-aksi kompleks pada data (seperti cartReducer untuk tambah/kurang/hapus barang di keranjang, dan inventoryReducer untuk admin menambah/mengedit/menghapus kartu).
Data Kartu: Gambar kartu diambil langsung dari Pokémon TCG API (images.pokemontcg.io) dengan HD (_hires.png).

3. Alur Pengguna (User Flow) & Fitur Utama
  Aplikasi ini dibagi menjadi tiga bagian utama berdasarkan Role penggunanya:

A. Alur Autentikasi (Login/Register)
  Halaman Login: Saat pertama kali dibuka, aplikasi menahan akses dan meminta pengguna login.
    Opsi Login:
      User bisa login menggunakan tombol "Sign in with Google" (berkat integrasi Firebase).
      Atau menggunakan kredensial Demo (User: john@example.com / Admin: admin@cardvault.com).
      Role-Based Access: Setelah login, aplikasi akan mengecek apakah pengguna ini adalah admin atau user biasa, lalu mengarahkannya ke dashboard yang sesuai.
      
B. Alur Pengguna Biasa (User / Customer)
      Browse (Dashboard): Menampilkan daftar kartu yang dijual. 
        User bisa:
        Mencari kartu lewat Search Bar.
        Menyaring (filter) berdasarkan kelangkaan (Rarity) dan Tipe Elemen.
        Mengatur rentang harga menggunakan Slider.
        Klik kartu untuk melihat detailnya, atau klik tombol keranjang (Cart) & bintang (Vault).
        My Vault (Portofolio): Halaman khusus di mana kolektor bisa melihat statistik kartu yang mereka miliki (Total Kartu, Total Nilai Koleksi              dalam USD, Harga Rata-rata).
        
   Checkout Flow (Alur Belanja):
        Cart: Melihat barang, mengubah quantity, melihat pajak & total.
        Checkout: Halaman pemilihan metode pembayaran.
        Bank Transfer: Jika dipilih, akan muncul nomor Virtual Account (BCA/Mandiri/BNI) buatan, tombol copy, instruksi, dan timer hitung mundur 24 jam.
        QRIS: Jika dipilih, akan muncul gambar dummy QR Code. Aplikasi memiliki simulasi otomatis di mana dalam 5 detik sistem akan mendeteksi pembayaran seolah-olah user baru saja men-scan dari HP mereka.
        Order Success: Setelah pembayaran "berhasil", muncul halaman konfirmasi pesanan dengan nomor order acak (contoh: CV-12345678).
      
C. Alur Administrator (Admin)
  Jika login sebagai admin, tampilannya berbeda (Admin Dashboard):
      Inventory Management: Admin bisa melihat tabel seluruh kartu yang ada di sistem.
      CRUD Operations: Tombol untuk Add (Tambah Kartu Baru), Edit (Mengubah harga/stok), dan Delete (Hapus kartu).
      Visual Grader (Fitur Bonus): Sebuah simulasi tools di mana admin bisa mengunggah (dummy) foto kartu untuk dinilai kualitasnya secara otomatis (Mint, Near Mint, dll).
