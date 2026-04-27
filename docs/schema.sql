
-- AUTH DB
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auth_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,
  foto_profil VARCHAR(500) NULL,
  oauth_provider ENUM('local','github') DEFAULT 'local',
  oauth_id VARCHAR(255) NULL,
  role ENUM('mahasiswa','admin','unit') DEFAULT 'mahasiswa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS token_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token TEXT NOT NULL,
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  access_token TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PENGADUAN DB
CREATE DATABASE IF NOT EXISTS pengaduan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pengaduan_db;

CREATE TABLE IF NOT EXISTS unit_terkait (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_unit VARCHAR(255) NOT NULL,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pengaduan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT NOT NULL,
  kategori ENUM('akademik','non_akademik') NOT NULL,
  status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disposisi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pengaduan_id INT NOT NULL,
  unit_id INT NOT NULL,
  catatan TEXT NULL,
  status_disposisi ENUM('diterima','diproses','selesai') DEFAULT 'diterima',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pengaduan_id) REFERENCES pengaduan(id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES unit_terkait(id)
);

CREATE TABLE IF NOT EXISTS rating_kepuasan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pengaduan_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  nilai TINYINT NOT NULL CHECK (nilai BETWEEN 1 AND 5),
  komentar TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pengaduan_id) REFERENCES pengaduan(id) ON DELETE CASCADE
);

INSERT IGNORE INTO unit_terkait (nama_unit, deskripsi) VALUES
('Akademik', 'Menangani pengaduan terkait akademik'),
('Kemahasiswaan', 'Menangani pengaduan non-akademik'),
('IT Support', 'Menangani pengaduan sistem informasi'),
('Keuangan', 'Menangani pengaduan keuangan mahasiswa');

-- NOTIFIKASI DB
CREATE DATABASE IF NOT EXISTS notifikasi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE notifikasi_db;

CREATE TABLE IF NOT EXISTS notifikasi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  judul VARCHAR(255) NOT NULL,
  pesan TEXT NOT NULL,
  tipe ENUM('pengaduan_baru','status_update','disposisi','rating') DEFAULT 'pengaduan_baru',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS status_baca (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notifikasi_id INT NOT NULL,
  user_id INT NOT NULL,
  dibaca TINYINT(1) DEFAULT 0,
  dibaca_at TIMESTAMP NULL,
  FOREIGN KEY (notifikasi_id) REFERENCES notifikasi(id) ON DELETE CASCADE
);
