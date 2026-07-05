import { Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/users — Admin only
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY id ASC'
    );
    res.json({ message: 'Data user berhasil diambil', data: rows });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// POST /api/users — Admin only (create user with role)
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ message: 'Nama, email, password, dan role wajib diisi' });
      return;
    }

    const validRoles = ['admin', 'operator', 'viewer'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: 'Role harus admin, operator, atau viewer' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password minimal 6 karakter' });
      return;
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      res.status(400).json({ message: 'Email sudah digunakan' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'User berhasil ditambahkan' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// PATCH /api/users/:id/reset-password — Admin only
export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      res.status(400).json({ message: 'Password baru minimal 6 karakter' });
      return;
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      res.status(404).json({ message: 'User tidak ditemukan' });
      return;
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query<ResultSetHeader>(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({ message: 'Password berhasil direset' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};
