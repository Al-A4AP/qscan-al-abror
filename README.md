# AL-ABROR Q Hub
**Sistem Manajemen Antrean & Distribusi Kurban Berbasis QR Code**

AL-ABROR Q adalah platform modern *end-to-end* untuk mendigitalisasi proses pendaftaran hewan kurban, pengelolaan kupon penerima daging kurban, hingga proses distribusi (*scanning*) melalui teknologi *QR Code* secara terpusat, *real-time*, dan aman.

---

## Fitur Utama

- **Dashboard Real-Time**: Pantau status progres pendistribusian daging, jumlah hewan, dan cakupan wilayah secara langsung.
- **Scanner QR Bawaan**: Pindai kupon warga secara instan melalui kamera *smartphone* (depan/belakang) tanpa aplikasi tambahan.
- **Keamanan Tingkat Lanjut (Diperbarui)**: 
  - Sistem autentikasi ketat berstandar JWT (*JSON Web Token*) yang tidak dapat di-*bypass*.
  - *Global & Login Rate Limiting* untuk mencegah serangan *spam* dan *bot* (DDoS).
  - Enkripsi sandi menggunakan *Bcrypt* serta perlindungan akses API spesifik (*Strict CORS*).
- **Manajemen Data Instan**: Ekspor & Impor data hewan dan penerima dalam format CSV dengan sekali klik.
- **Desain Mobile-First**: Antarmuka adaptif yang dioptimalkan penuh untuk kenyamanan akses melalui layar ponsel.
- **Mode Gelap/Terang**: Kenyamanan visual bagi staf pengelola saat beroperasi di siang atau malam hari.

---

## Tech Stack & Arsitektur

Proyek ini dibangun menggunakan arsitektur *Monorepo* yang terintegrasi penuh untuk diterbitkan ke infrastruktur *Serverless* (**Vercel**).

### Frontend (Klien)
* **Vite + React.js** (Antarmuka pengguna interaktif & super cepat).
* **TypeScript** (Strict Mode untuk keamanan tipe data).
* **Tailwind CSS & Shadcn UI** (Sistem UI *modern* & elegan).
* **TanStack React Query** (Sistem *caching* & sinkronisasi data pintar).
* **Html5-Qrcode** (Integrasi pemindai kamera).

### Backend (Server API)
* **Node.js & Express.js** (Arsitektur mikro-layanan berbasis modular).
* **Prisma ORM** (Interaksi basis data mutakhir).
* **PostgreSQL via Supabase** (Basis data awan berkinerja tinggi).
* **Zod** (Validasi berlapis untuk mencegah injeksi data berbahaya).

---

## Cara Menjalankan Secara Lokal (*Development*)

Bagi pengembang yang ingin berkontribusi atau menjalankan proyek ini di mesin lokal, ikuti instruksi berikut:

### 1. Persiapan
Pastikan **Node.js** (versi 18+) telah terinstal di komputer Anda. Lakukan *clone* repositori dan instal dependensi di direktori akar:

```bash
# Instal modul backend
npm install

# Instal modul frontend
cd frontend
npm install
```

### 2. Konfigurasi Variabel Lingkungan
Buat file `.env` di **direktori akar** (`QAbror/`) dan isi dengan konfigurasi Anda (termasuk Supabase):

```env
DATABASE_URL="postgres://postgres.xxx:xxx@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres.xxx:xxx@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Autentikasi
JWT_SECRET="masukkan_rahasia_token_anda_disini"

# Keamanan (CORS)
FRONTEND_URL="http://localhost:5173"
```

### 3. Migrasi & Seed Database
Inisialisasi skema basis data dan injeksi admin bawaan:

```bash
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
```

### 4. Mulai Server (Mode Development)

Untuk menjalankan server Backend (API) dan Frontend secara bersamaan:

**Terminal 1 (Backend - Port 3001):**
```bash
npm run dev
```

**Terminal 2 (Frontend - Port 5173):**
```bash
cd frontend
npm run dev
```
Buka `http://localhost:5173` di peramban web (*browser*) Anda.

---

## Cara Deployment (Produksi ke Vercel)

Proyek ini sudah dikonfigurasi untuk deployment otomatis via **Vercel** melalui file `vercel.json`. Konfigurasi otomatis menangani *build* *frontend* SPA serta *generation* Prisma.

1. *Push* kode Anda ke repositori GitHub.
2. Buat proyek baru di Vercel dan hubungkan dengan *repository* tersebut.
3. Buka tab **Environment Variables** di Vercel, lalu tambahkan *key* dan *value* yang ada pada `.env` lokal Anda:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET` (Pastikan rahasia produksi Anda kuat!)
   - `FRONTEND_URL` (Isi dengan domain Vercel Anda, contoh: `https://qabror.vercel.app`)
4. Biarkan konfigurasi *Build & Development Settings* *default*, dan tekan **Deploy**.

---

## Struktur Autentikasi
Data administrator **tidak dapat diregistrasi melalui UI**. Semua pengguna sistem diinjeksi khusus melalui *database* (`prisma/seed.ts`) dan diamankan secara *hash*. Ini memastikan bahwa platform hanya bisa dikontrol oleh panitia inti yang berwenang, tanpa risiko *spam* pendaftaran eksternal.

---

> *Sistem ini didesain dengan tingkat keamanan dan keandalan tinggi, siap berskala industri untuk menangani pendistribusian di area Produksi yang sesungguhnya.*
