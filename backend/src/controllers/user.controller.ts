import { Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/users — Admin only
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC'
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
      res.status(400).json({ message: 'Role tidak valid' });
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

// PUT /api/users/:id — Admin only (update name, email, role)
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      res.status(400).json({ message: 'Nama, email, dan role wajib diisi' });
      return;
    }

    const validRoles = ['admin', 'operator', 'viewer'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: 'Role tidak valid' });
      return;
    }

    // Cek apakah email sudah dipakai user lain
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existing.length > 0) {
      res.status(400).json({ message: 'Email sudah digunakan oleh user lain' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'User tidak ditemukan' });
      return;
    }

    res.json({ message: 'User berhasil diperbarui' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// DELETE /api/users/:id — Admin only
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Jangan hapus diri sendiri
    if (req.user && req.user.id === Number(id)) {
      res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'User tidak ditemukan' });
      return;
    }

    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// PATCH /api/users/:id/reset-password — Admin only (generate temporary password)
function generateTemporaryPassword(): string {
  return Math.random().toString(36).slice(-10);
}

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'User tidak ditemukan' });
      return;
    }

    res.json({
      message: 'Password berhasil direset',
      temporaryPassword,
      note: 'Tampilkan hanya sekali, lalu minta user mengganti password.',
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};
