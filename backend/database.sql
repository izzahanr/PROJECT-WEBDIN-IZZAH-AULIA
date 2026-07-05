CREATE DATABASE IF NOT EXISTS kampus;

USE kampus;

-- Hapus tabel yang bergantung terlebih dahulu
DROP TABLE IF EXISTS mahasiswa;
DROP TABLE IF EXISTS prodi;
DROP TABLE IF EXISTS users;

-- Tabel prodi
CREATE TABLE IF NOT EXISTS prodi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL UNIQUE,
  kode VARCHAR(20) NOT NULL UNIQUE
);

-- Tabel mahasiswa dengan relasi ke prodi dan field foto
CREATE TABLE IF NOT EXISTS mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(20) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  prodi_id INT NOT NULL,
  angkatan INT NOT NULL,
  foto VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prodi_id) REFERENCES prodi(id) ON DELETE RESTRICT
);

-- Tabel users untuk autentikasi (Pertemuan 13)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'viewer') NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed data prodi
INSERT INTO prodi (nama, kode) VALUES 
('Teknik Informatika', 'TIF'),
('Sistem Informasi', 'SI'),
('Rekayasa Perangkat Lunak', 'RPL');

-- Seed data mahasiswa
INSERT INTO mahasiswa (nim, nama, prodi_id, angkatan, foto) VALUES 
('2201001', 'Ahmad Fauzi', 1, 2022, NULL),
('2201002', 'Budi Santoso', 2, 2022, NULL);

-- Tabel password_reset_tokens (Pertemuan 15)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
