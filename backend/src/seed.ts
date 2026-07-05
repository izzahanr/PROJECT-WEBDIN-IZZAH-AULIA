import bcrypt from 'bcryptjs';
import pool from './config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const users = [
    { name: 'Administrator', email: 'admin@kampus.ac.id', password: 'admin123', role: 'admin' },
    { name: 'Operator', email: 'operator@kampus.ac.id', password: 'operator123', role: 'operator' },
    { name: 'Viewer', email: 'viewer@kampus.ac.id', password: 'viewer123', role: 'viewer' },
  ];

  try {
    for (const u of users) {
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [u.email]
      );

      if (existing.length > 0) {
        console.log(`User ${u.email} sudah ada, skip.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(u.password, 10);
      await pool.query<ResultSetHeader>(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [u.name, u.email, hashedPassword, u.role]
      );
      console.log(`User ${u.email} (${u.role}) berhasil ditambahkan.`);
    }

    console.log('\nSeed selesai! Akun uji:');
    console.log('  admin@kampus.ac.id    / admin123    (admin)');
    console.log('  operator@kampus.ac.id / operator123 (operator)');
    console.log('  viewer@kampus.ac.id   / viewer123   (viewer)');
  } catch (error) {
    console.error('Seed gagal:', error);
  } finally {
    await pool.end();
  }
}

seed();
