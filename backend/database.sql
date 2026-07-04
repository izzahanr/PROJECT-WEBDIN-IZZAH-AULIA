CREATE DATABASE IF NOT EXISTS kampus;

USE kampus;

-- Hapus tabel mahasiswa terlebih dahulu karena bergantung pada prodi
DROP TABLE IF EXISTS mahasiswa;
DROP TABLE IF EXISTS prodi;

-- Membuat tabel prodi
CREATE TABLE IF NOT EXISTS prodi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL UNIQUE,
  kode VARCHAR(20) NOT NULL UNIQUE
);

-- Membuat tabel mahasiswa dengan relasi ke prodi dan field foto
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

-- Seed data prodi
INSERT INTO prodi (nama, kode) VALUES 
('Teknik Informatika', 'TIF'),
('Sistem Informasi', 'SI'),
('Rekayasa Perangkat Lunak', 'RPL');

-- Seed data mahasiswa
INSERT INTO mahasiswa (nim, nama, prodi_id, angkatan, foto) VALUES 
('2201001', 'Ahmad Fauzi', 1, 2022, NULL),
('2201002', 'Budi Santoso', 2, 2022, NULL);
