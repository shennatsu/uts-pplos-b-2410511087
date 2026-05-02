# UTS PPLOS B — Sistem Pengaduan Mahasiswa

**Nama:** Alysha Ananda Shafa
**NIM:** 2410511087  
**Kelas:** B  
**Mata Kuliah:** Pembangunan Perangkat Lunak Berorientasi Service (SE.2)  
**Dosen:** Muhammad Panji Muslim, S.Pd., M.Kom

---

## Studi Kasus

**Sistem Pengaduan Mahasiswa** — mahasiswa dapat mengajukan pengaduan kategori akademik/non-akademik, admin mendisposisi ke unit terkait, unit melakukan follow-up, dan mahasiswa memberikan rating kepuasan.

---

## Arsitektur Sistem

```
Client / Postman
       │
       ▼
┌─────────────────────┐
│   API Gateway :3000  │  ← JWT Validation + Rate Limiting (60 req/menit)
└────────┬────────────┘
         │
    ┌────┴──────────────────────┐
    │           │               │
    ▼           ▼               ▼
┌────────┐ ┌──────────────┐ ┌──────────────┐
│  Auth  │ │  Pengaduan   │ │  Notifikasi  │
│ :3001  │ │  :3002 (PHP) │ │  :3003       │
│Node.js │ │  Laravel 11  │ │  Node.js     │
└────┬───┘ └──────┬───────┘ └──────────────┘
     │            │ (inter-service HTTP)    ▲
     ▼            └─────────────────────────┘
  auth_db      pengaduan_db           notifikasi_db
```

---

## Cara Menjalankan

### Prasyarat

- Node.js >= 18
- PHP >= 8.1 + Composer
- MySQL (XAMPP / standalone)

### 1. Auth Service (port 3001)

```bash
cd services/auth-service
cp .env.example .env
# Edit .env: DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
npm install
node app.js
# Output: Auth Service running on port 3001
```

### 2. Pengaduan Service (port 3002)

```bash
cd services/pengaduan-service
cp .env.example .env
# Edit .env: DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD, NOTIF_SERVICE_URL, INTERNAL_SECRET
composer install
php artisan migrate --seed
php artisan serve --port=3002
# Output: INFO  Server running on [http://127.0.0.1:3002].
```

### 3. Notifikasi Service (port 3003)

```bash
cd services/notifikasi-service
cp .env.example .env
# Edit .env: DB_HOST, DB_USER, DB_PASS, DB_NAME, INTERNAL_SECRET
npm install
node app.js
# Output: Notifikasi Service running on port 3003
```

### 4. API Gateway (port 3000)

```bash
cd gateway
cp .env.example .env
# Edit .env: JWT_SECRET (harus sama dengan auth-service)
npm install
node gateway.js
# Output: API Gateway running on port 3000
```

### (Opsional) Docker Compose

```bash
# Jalankan seluruh stack sekaligus
docker-compose up --build

# Jalankan di background
docker-compose up -d --build

# Lihat log
docker-compose logs -f

# Stop
docker-compose down
```

---

## Struktur Repository

```
uts-pplos-b-2410511087/
│
├── README.md                          # Dokumentasi utama (file ini)
├── docker-compose.yml                 # Orkestrasi seluruh service
│
├── gateway/                           # API Gateway (Node.js + Express)
│   ├── app.js                         # Entry point gateway
│   ├── middleware/
│   │   ├── jwtValidator.js            # Middleware validasi JWT dari header Authorization
│   │   └── rateLimiter.js             # Rate limiter: max 60 req/menit/IP
│   ├── routes/
│   │   └── proxy.js                   # Definisi proxy: /auth/* /pengaduan/* /notifikasi/*
│   ├── .env.example                   # Template env: JWT_SECRET, PORT
│   └── package.json
│
├── services/
│   │
│   ├── auth-service/                  # Auth Service (Node.js + Express)
│   │   ├── app.js                     # Entry point, inisialisasi Express + Passport
│   │   ├── config/
│   │   │   ├── db.js                  # Koneksi MySQL dengan mysql2
│   │   │   └── passport.js            # Konfigurasi passport-github2 (OAuth)
│   │   ├── controllers/
│   │   │   └── authController.js      # register, login, refresh, logout, me, githubCallback
│   │   ├── middleware/
│   │   │   └── authMiddleware.js      # Verifikasi JWT untuk route protected
│   │   ├── models/
│   │   │   └── userModel.js           # Query ke tabel users, refresh_tokens, token_blacklist
│   │   ├── routes/
│   │   │   └── authRoutes.js          # Definisi route: POST /register, POST /login, dll.
│   │   ├── .env.example               # Template: DB_*, JWT_SECRET, GITHUB_CLIENT_*
│   │   └── package.json               # Dependencies: express, jsonwebtoken, bcryptjs, passport-github2
│   │
│   ├── pengaduan-service/             # Pengaduan Service (PHP 8.4 + Laravel 11)
│   │   ├── app/
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── PengaduanController.php   # index, store, show, updateStatus
│   │   │   │   │   ├── DisposisiController.php   # store (disposisi ke unit), update (status disposisi)
│   │   │   │   │   └── RatingController.php      # store (beri rating 1-5)
│   │   │   │   └── Middleware/
│   │   │   │       └── JwtMiddleware.php          # Decode & verifikasi JWT di setiap request
│   │   │   └── Models/
│   │   │       ├── Pengaduan.php                  # Eloquent model, relasi ke Disposisi & Rating
│   │   │       ├── Disposisi.php                  # Eloquent model, relasi ke UnitTerkait
│   │   │       ├── UnitTerkait.php                # Master data unit penerima disposisi
│   │   │       └── RatingKepuasan.php             # Model rating dengan validasi nilai 1-5
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   │   ├── create_unit_terkait_table.php
│   │   │   │   ├── create_pengaduan_table.php
│   │   │   │   ├── create_disposisi_table.php
│   │   │   │   └── create_rating_kepuasan_table.php
│   │   │   └── seeders/
│   │   │       └── UnitTerkaitSeeder.php          # Seed data unit: Akademik, Kemahasiswaan, Sarpras
│   │   ├── routes/
│   │   │   └── api.php                            # Definisi endpoint dengan group middleware JWT
│   │   ├── .env.example
│   │   └── composer.json                          # Dependencies: laravel/framework ^11.0
│   │
│   └── notifikasi-service/            # Notifikasi Service (Node.js + Express)
│       ├── app.js                     # Entry point
│       ├── config/
│       │   └── db.js                  # Koneksi MySQL
│       ├── controllers/
│       │   └── notifikasiController.js  # create, listByUser, markRead
│       ├── middleware/
│       │   ├── authMiddleware.js      # Verifikasi JWT untuk endpoint user-facing
│       │   └── internalAuth.js        # Validasi x-internal-secret untuk endpoint inter-service
│       ├── models/
│       │   └── notifikasiModel.js     # Query ke tabel notifikasi & status_baca
│       ├── routes/
│       │   └── notifikasiRoutes.js    # POST /notifikasi (internal), GET /:userId, PUT /:id/read
│       ├── .env.example               # Template: DB_*, INTERNAL_SECRET, JWT_SECRET
│       └── package.json
│
├── docs/
│   ├── laporan-uts.pdf                # Laporan lengkap UTS
│   └── arsitektur.png                 # Diagram arsitektur sistem
│
├── postman/
│   └── collection.json                # Postman Collection v2.1 — 30+ request siap pakai
│
└── poster/
    └── poster-uts.png                 # Poster ringkasan sistem
```

---

## Desain Database

Setiap service memiliki database **terpisah** — tidak ada foreign key lintas database.

### auth_db

| Tabel | Kolom Utama | Keterangan |
|-------|-------------|------------|
| `users` | id, nama, email, password, foto_profil, oauth_provider, oauth_id, role | Data pengguna lokal & OAuth |
| `refresh_tokens` | id, user_id, token, expires_at | Penyimpanan refresh token (7 hari) |
| `token_blacklist` | id, token, blacklisted_at | Token yang di-logout (invalidasi) |
| `oauth_accounts` | id, user_id, provider, provider_id, access_token | Akun OAuth terhubung |

### pengaduan_db

| Tabel | Kolom Utama | Keterangan |
|-------|-------------|------------|
| `unit_terkait` | id, nama_unit, deskripsi | Master unit penerima disposisi |
| `pengaduan` | id, user_id, judul, deskripsi, kategori, status | Data pengaduan mahasiswa |
| `disposisi` | id, pengaduan_id, unit_id, catatan, status_disposisi | Disposisi ke unit terkait |
| `rating_kepuasan` | id, pengaduan_id, user_id, nilai (1-5), komentar | Rating kepuasan setelah selesai |

### notifikasi_db

| Tabel | Kolom Utama | Keterangan |
|-------|-------------|------------|
| `notifikasi` | id, user_id, judul, pesan, tipe | Data notifikasi yang dikirim ke user |
| `status_baca` | id, notifikasi_id, user_id, dibaca, dibaca_at | Status baca per user per notifikasi |

---

## Peta Endpoint via Gateway (port 3000)

| Method | Path | Service | Auth | Keterangan |
|--------|------|---------|------|------------|
| `POST` | `/auth/register` | :3001 | Public | Registrasi user baru |
| `POST` | `/auth/login` | :3001 | Public | Login, mendapat JWT + refresh token |
| `POST` | `/auth/refresh` | :3001 | Public | Perbarui access token |
| `POST` | `/auth/logout` | :3001 | JWT | Blacklist token aktif |
| `GET` | `/auth/me` | :3001 | JWT | Info user yang sedang login |
| `GET` | `/auth/github` | :3001 | Public | Redirect ke GitHub OAuth |
| `GET` | `/auth/github/callback` | :3001 | Public | OAuth callback handler |
| `GET` | `/pengaduan` | :3002 | JWT | List pengaduan (paging + filter) |
| `POST` | `/pengaduan` | :3002 | JWT | Buat pengaduan baru |
| `GET` | `/pengaduan/:id` | :3002 | JWT | Detail pengaduan + disposisi + rating |
| `PATCH` | `/pengaduan/:id/status` | :3002 | JWT | Update status pengaduan |
| `POST` | `/pengaduan/:id/disposisi` | :3002 | JWT | Disposisi pengaduan ke unit |
| `POST` | `/pengaduan/:id/rating` | :3002 | JWT | Beri rating kepuasan (1–5) |
| `PATCH` | `/disposisi/:id` | :3002 | JWT | Update status disposisi |
| `GET` | `/notifikasi/:userId` | :3003 | JWT | List notifikasi milik user |
| `PUT` | `/notifikasi/:id/read` | :3003 | JWT | Tandai notifikasi sudah dibaca |

---

## HTTP Status Code yang Digunakan

| Status | Keterangan | Contoh Penggunaan |
|--------|------------|-------------------|
| 200 | OK | GET /pengaduan, GET /auth/me |
| 201 | Created | POST /auth/register, POST /pengaduan |
| 204 | No Content | Berhasil, tanpa body response |
| 400 | Bad Request | Body tidak lengkap (POST /notifikasi tanpa judul/pesan) |
| 401 | Unauthorized | Token tidak ada, tidak valid, atau sudah di-blacklist |
| 403 | Forbidden | Akses notif user lain, missing x-internal-secret |
| 404 | Not Found | GET /pengaduan/999 |
| 409 | Conflict | Register email duplikat, rating duplikat |
| 422 | Unprocessable | Validasi gagal (login tanpa email/password) |
| 429 | Too Many Requests | Melebihi 60 req/menit via Gateway |
| 500 | Internal Error | Database error, unexpected exception |
| 503 | Service Unavailable | Gateway: downstream service tidak bisa diakses |

---

## Testing dengan Postman

### Import Collection

1. Buka Postman → klik **Import**
2. Pilih file `postman/collection.json`
3. Collection **"UTS PPLOS B - 2410511087"** akan muncul

### Setup Environment Variables

Collection sudah memiliki variabel bawaan:

| Variable | Default Value | Keterangan |
|----------|---------------|------------|
| `gateway_url` | `http://localhost:3000` | Base URL API Gateway |
| `auth_url` | `http://localhost:3001` | Direct ke Auth Service |
| `notif_url` | `http://localhost:3003` | Direct ke Notifikasi Service |
| `access_token` | *(auto-fill)* | Diisi otomatis saat Login berhasil |
| `refresh_token` | *(auto-fill)* | Diisi otomatis saat Login berhasil |

> **Catatan:** `access_token` dan `refresh_token` diisi **otomatis** oleh Postman Test Script saat request **Login Mahasiswa** berhasil — tidak perlu copy-paste manual.

### Urutan Testing (Alur Happy Path)

Jalankan request **secara berurutan** untuk skenario lengkap:

#### Tahap 1 — Health Check

```
GET  /health           → 200 OK  (Gateway aktif)
GET  :3001/health      → 200 OK  (Auth Service aktif)
```

#### Tahap 2 — Registrasi & Login

```
POST /auth/register    → 201 Created  (daftar sebagai mahasiswa)
POST /auth/register    → 201 Created  (daftar sebagai admin, ganti role: "admin")
POST /auth/login       → 200 OK       (login mahasiswa, access_token & refresh_token auto-set)
GET  /auth/me          → 200 OK       (cek info user dari token)
```

#### Tahap 3 — Alur Pengaduan

```
POST /pengaduan        → 201 Created  (buat pengaduan akademik)
POST /pengaduan        → 201 Created  (buat pengaduan non-akademik)
GET  /pengaduan        → 200 OK       (list semua pengaduan)
GET  /pengaduan?kategori=akademik  → 200 OK  (filter kategori)
GET  /pengaduan?status=open        → 200 OK  (filter status)
GET  /pengaduan?per_page=5&page=1  → 200 OK  (paging)
GET  /pengaduan/1      → 200 OK       (detail pengaduan id=1)
```

#### Tahap 4 — Disposisi & Update Status

```
POST  /pengaduan/1/disposisi       → 201 Created  (disposisi ke unit)
PATCH /pengaduan/1/status          → 200 OK       (ubah status → in_progress)
PATCH /disposisi/1                 → 200 OK       (update status disposisi → diproses)
```

#### Tahap 5 — Rating

```
POST /pengaduan/1/rating           → 201 Created  (beri rating nilai=4)
```

#### Tahap 6 — Notifikasi

```
GET /notifikasi/1                  → 200 OK  (list notifikasi user id=1)
PUT /notifikasi/1/read             → 200 OK  (tandai dibaca)
```

#### Tahap 7 — Logout & Token Lifecycle

```
POST /auth/refresh                 → 200 OK  (perbarui access token)
POST /auth/logout                  → 200 OK  (blacklist token)
GET  /auth/me                      → 401     (token sudah di-blacklist)
```

### Skenario Error (Negative Testing)

Semua skenario error sudah tersedia di collection:

| Request | Expected | Keterangan |
|---------|----------|------------|
| Register email duplikat | 409 | Email sudah terdaftar |
| Login password salah | 401 | Kredensial tidak valid |
| GET /auth/me tanpa token | 401 | Authorization header kosong |
| GET /auth/me token invalid | 401 | Token `tokenpalsu123` ditolak |
| GET /pengaduan/999 | 404 | Pengaduan tidak ditemukan |
| POST /pengaduan/:id/rating (duplikat) | 409 | Sudah pernah memberi rating |
| POST /notifikasi tanpa internal-secret | 403 | Akses inter-service ditolak |
| POST /notifikasi body tidak lengkap | 400 | Validasi body gagal |
| GET /notifikasi/999/read | 404 | Notifikasi tidak ditemukan |
| GET /blabla | 404 | Route tidak terdaftar di Gateway |
| Kirim 61+ request/menit | 429 | Rate limit terlampaui |

### Testing Inter-Service (Internal Endpoint)

Notifikasi Service memiliki endpoint internal yang **hanya bisa dipanggil oleh Pengaduan Service** menggunakan header `x-internal-secret`:

```
POST http://localhost:3003/notifikasi
Header: x-internal-secret: internal_secret_pengaduan_2410511087
Body:
{
  "user_id": 1,
  "judul": "Pengaduan Baru Dibuat",
  "pesan": "Pengaduan kamu berhasil dibuat dan sedang diproses",
  "tipe": "pengaduan_baru"
}
```

### Testing GitHub OAuth

1. Jalankan request **"GitHub OAuth - Redirect"** → browser akan diarahkan ke halaman login GitHub
2. Login dengan akun GitHub → izinkan akses aplikasi
3. GitHub akan redirect ke callback URL dengan `code` parameter
4. Auth Service menukar `code` → profil GitHub → membuat/menemukan user → return JWT

> **Catatan:** Untuk testing OAuth di Postman, gunakan browser karena flow memerlukan redirect interaktif.

---

## Stack Teknologi

| Komponen | Teknologi |
|----------|-----------|
| API Gateway | Node.js, Express, http-proxy-middleware |
| Auth Service | Node.js, Express, JWT, bcryptjs, passport-github2 |
| Pengaduan Service | PHP 8.4, Laravel 11, MySQL |
| Notifikasi Service | Node.js, Express, MySQL |
| Database | MySQL / MariaDB (XAMPP) |
| OAuth | GitHub OAuth 2.0 (Authorization Code Flow) |
| Containerization | Docker, Docker Compose |

---

## Demo Video

> Link YouTube : **[https://youtu.be/y0abM5JDCgk0]**

---

