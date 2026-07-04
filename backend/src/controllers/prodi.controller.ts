import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllProdi = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM prodi ORDER BY nama ASC');
    res.json({
      message: 'Data prodi berhasil diambil',
      data: rows
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal mengambil data prodi', error: err.message });
  }
};

export const createProdi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama, kode } = req.body;
    if (!nama || !kode) {
      res.status(400).json({ message: 'Nama dan kode prodi wajib diisi' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO prodi (nama, kode) VALUES (?, ?)',
      [nama, kode]
    );

    res.status(201).json({
      message: 'Prodi berhasil ditambahkan',
      data: {
        id: result.insertId,
        nama,
        kode
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal menambahkan prodi', error: err.message });
  }
};

export const updateProdi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nama, kode } = req.body;

    if (!nama || !kode) {
      res.status(400).json({ message: 'Nama dan kode prodi wajib diisi' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE prodi SET nama = ?, kode = ? WHERE id = ?',
      [nama, kode, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Prodi tidak ditemukan' });
      return;
    }

    res.json({
      message: 'Prodi berhasil diperbarui',
      data: {
        id: Number(id),
        nama,
        kode
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal memperbarui prodi', error: err.message });
  }
};

export const deleteProdi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM prodi WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Prodi tidak ditemukan' });
      return;
    }

    res.json({
      message: 'Prodi berhasil dihapus'
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal menghapus prodi. Pastikan tidak ada data mahasiswa yang menggunakan prodi ini.', error: err.message });
  }
};
