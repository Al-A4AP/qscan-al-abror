# Laporan Proyek AL-ABROR Q (Sistem Manajemen Kurban)

Laporan ini menyajikan analisis komprehensif terkait struktur proyek, tumpukan teknologi (_tech stack_), pustaka pendukung (_libraries_), arsitektur basis data, serta rekomendasi masa depan. Proyek ini telah diverifikasi, diaudit keamanannya, dan berada dalam status **Production-Ready** untuk _deploy_ ke Vercel.

---

## 1. Tumpukan Teknologi (Tech Stack) & Libraries

Aplikasi ini menggunakan arsitektur _Monorepo_ ringan yang menggabungkan antarmuka pengguna (_Frontend_) dan antarmuka pemrograman aplikasi (_Backend_) dalam satu manajemen repositori terpadu.

### Frontend (Sisi Klien)

- **Framework Utama**: React.js dengan Vite (_Bundler_ super cepat).
- **Bahasa Pemrograman**: TypeScript (dengan Strict Mode diaktifkan).
- **Styling**: Tailwind CSS dan Shadcn UI (komponen siap pakai yang elegan).
- **Manajemen State & Fetching**: `@tanstack/react-query` (_caching_ data dan sinkronisasi pintar).
- **Routing**: `react-router-dom` (navigasi SPA / _Single Page Application_).
- **Fitur Pemindai QR**: `html5-qrcode` (kamera pemindai yang responsif).
- **Ikonografi**: `lucide-react`.

### Backend (Sisi Server)

- **Framework Utama**: Node.js dengan Express.js.
- **Bahasa Pemrograman**: TypeScript.
- **ORM (Object-Relational Mapping)**: Prisma ORM (penghubung mutakhir ke Database).
- **Basis Data**: PostgreSQL (di-host pada Supabase).
- **Keamanan & Validasi**:
  - `jsonwebtoken` (JWT) untuk manajemen sesi.
  - `bcryptjs` untuk enkripsi/hashing _password_.
  - `cors` (dengan konfigurasi Strict) untuk keamanan lintas-domain.
  - `express-rate-limit` untuk perlindungan dari serangan _spam_/DDoS.
  - `zod` untuk validasi format data masuk (mencegah _payload_ berbahaya).
  - `pino` untuk pencatatan _log_ aktivitas _server_.

---

## 2. Struktur Direktori Proyek

```text
QAbror/
│
├── api/                         # Backend (Node.js/Express)
│   ├── index.ts                 # Entry point utama API (konfigurasi global)
│   ├── db.ts                    # Inisialisasi koneksi Prisma Client
│   ├── middlewares/             # Logika penengah (auth, logger, rateLimit)
│   ├── routes/                  # Pemisahan rute modular (auth, animals, recipients)
│   └── validations/             # Skema validasi Zod
│
├── prisma/                      # Konfigurasi ORM
│   ├── schema.prisma            # Arsitektur Database (Tabel User, Recipient, Animal)
│   └── seed.ts                  # Skrip injeksi data awal (admin default)
│
├── frontend/                    # Direktori Utama Klien (Vite + React)
│   ├── public/                  # Aset statis (logo dll)
│   ├── src/
│   │   ├── api.ts               # Penghubung Axios ke Backend
│   │   ├── App.tsx              # Konfigurasi React Router & Proteksi Halaman
│   │   ├── main.tsx             # Entry point React
│   │   ├── components/          # Komponen modular & UI (Shadcn)
│   │   ├── hooks/               # Custom Hooks (use-toast, dll)
│   │   └── pages/               # Halaman utama (Dashboard, Login, Registry, Scanner)
│   │
│   ├── tailwind.config.ts       # Konfigurasi palet warna
│   └── vite.config.ts           # Konfigurasi bundler frontend
│
├── package.json                 # Manajemen dependency akar (Backend & Root Scripts)
├── vercel.json                  # Konfigurasi Deployment Serverless Vercel
└── .env                         # Menyimpan variabel rahasia (DB, JWT, FRONTEND_URL)
```

---

## 3. Struktur Basis Data (Supabase/Prisma)

Skema basis data dirancang agar minimalis, dinamis, dan terisolasi dengan baik.

### Tabel `User` (Administrator)

Digunakan khusus untuk pengelola sistem.

- `id` (String, UUID) - Primary Key
- `email` (String) - Unik
- `name` (String)
- `password` (String) - Terenkripsi dengan algoritma bcrypt
- `role` (String) - Nilai standar: 'admin'

### Tabel `Recipient` (Penerima Daging Kurban)

Menyimpan data masyarakat yang memegang kupon antrean.

- `id` (String) - Primary Key (sebagai **Nomor Kupon**, misal: `0101001`)
- `name` (String) - Nama penerima
- `address` (String) - Alamat rumah/RT
- `status` (String) - `'Belum'` (Antri) atau `'Sudah'` (Telah mengambil)
- `note` (String) - Keterangan opsional

### Tabel `Animal` (Hewan Kurban)

Menyimpan data hewan dan identitas pekurban (Shohibul Qurban).

- `id` (String) - Primary Key (sebagai **Tag Hewan**, misal: `SAPI-01`)
- `donor` (String) - Nama individu penyumbang / Hamba Allah
- `type` (String) - Jenis hewan (Sapi / Kambing / Domba)
- `weight` (Float) - Berat estimasi hewan (kg)
- `status` (String) - Status penanganan (Antri / Selesai)
- `address` (String) - Lokasi pemotongan
- `note` (String) - Catatan khusus

---

## 4. Evaluasi Sistem & Pencapaian Refactoring

Berdasarkan hasil audit terbaru, aplikasi ini telah melampaui standar dasar dan mengimplementasikan berbagai praktik tingkat lanjut (_Enterprise-grade practices_):

1. **Modularisasi Kode (Tercapai)**
   Logika _backend_ yang sebelumnya menumpuk di satu file kini telah dipisahkan dengan bersih ke dalam pola `routes` dan `middlewares`. Hal ini membuat pemeliharaan aplikasi menjadi jauh lebih mudah ke depannya.
2. **Validasi Skema Berlapis (Tercapai)**
   Penggunaan `Zod` di _backend_ memastikan bahwa seluruh input pengguna divalidasi dengan ketat sebelum masuk ke basis data Prisma, mencegah celah serangan injeksi dan _malformed data_.
3. **Pencatatan Aktivitas / Logging (Tercapai)**
   Sistem telah diintegrasikan dengan `pino` untuk mencatat setiap akses _traffic_ ke API secara efisien (_high-performance logging_).
4. **Keamanan API Ekstra (Tercapai)**
   Celah keamanan krusial telah ditutup. API kini dilindungi oleh sistem _Strict CORS_, _Hardcoded Token Prevention_, dan _Dual Rate Limiter_ (khusus `/login` dan Global 150 Req/15 Min).
5. **Kesiapan Infrastruktur Vercel (Tercapai)**
   File `vercel.json` telah dikonfigurasi untuk menangani permasalahan klasik SPA React Router (404 Error) serta otomatisasi _Database Migration_ Prisma saat proses _deployment_.

### Rekomendasi Skalabilitas Masa Depan:

Satu-satunya saran arsitektur tersisa apabila proyek ini digunakan pada tingkat nasional atau puluhan ribu transaksi per hari:

- **Sistem Pagination (Paginasi)**: Saat ini `prisma.recipient.findMany()` mengambil seluruh data sekaligus. Jika jumlah kupon menembus >20.000, sangat disarankan untuk menambahkan parameter _Limit/Offset_ pada tabel `Registry.tsx` dan API Anda agar konsumsi memori _server_ tetap stabil.
