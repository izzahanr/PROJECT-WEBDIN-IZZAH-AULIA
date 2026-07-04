import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import path from 'path';
import fs from 'fs';

export const getMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parameter Query
    const search = req.query.search ? `%${req.query.search}%` : null;
    const prodiId = req.query.prodi_id ? Number(req.query.prodi_id) : null;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const offset = (page - 1) * limit;

    // Build SQL Query
    let query = `
      SELECT m.*, p.nama AS prodi_nama, p.kode AS prodi_kode 
      FROM mahasiswa m
      JOIN prodi p ON m.prodi_id = p.id
    `;
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM mahasiswa m
      JOIN prodi p ON m.prodi_id = p.id
    `;

    const whereClauses: string[] = [];
    const queryParams: any[] = [];

    if (search) {
      whereClauses.push('(m.nama LIKE ? OR m.nim LIKE ?)');
      queryParams.push(search, search);
    }

    if (prodiId) {
      whereClauses.push('m.prodi_id = ?');
      queryParams.push(prodiId);
    }

    if (whereClauses.length > 0) {
      const whereStr = ' WHERE ' + whereClauses.join(' AND ');
      query += whereStr;
      countQuery += whereStr;
    }

    // Hitung total data
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, queryParams);
    const totalData = countRows[0].total;
    const totalPages = Math.ceil(totalData / limit);

    // Ambil data dengan pagination
    query += ' ORDER BY m.id DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.query<RowDataPacket[]>(query, [...queryParams, limit, offset]);

    res.json({
      message: 'Data mahasiswa berhasil diambil',
      meta: {
        total: totalData,
        page,
        limit,
        totalPages
      },
      data: rows
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal mengambil data mahasiswa', error: err.message });
  }
};

export const getMahasiswaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT m.*, p.nama AS prodi_nama, p.kode AS prodi_kode 
       FROM mahasiswa m 
       JOIN prodi p ON m.prodi_id = p.id 
       WHERE m.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      return;
    }

    res.json({
      message: 'Data mahasiswa berhasil diambil',
      data: rows[0]
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal mengambil data mahasiswa', error: err.message });
  }
};

export const createMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nim, nama, prodi_id, angkatan } = req.body;
    
    if (!nim || !nama || !prodi_id || !angkatan) {
      // Hapus file yang sudah terlanjur diupload jika validasi gagal
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: 'NIM, Nama, Prodi ID, dan Angkatan wajib diisi' });
      return;
    }

    const foto = req.file ? req.file.filename : null;

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO mahasiswa (nim, nama, prodi_id, angkatan, foto) VALUES (?, ?, ?, ?, ?)',
      [nim, nama, prodi_id, angkatan, foto]
    );
    
    res.status(201).json({
      message: 'Data mahasiswa berhasil ditambahkan',
      data: {
        id: result.insertId,
        nim,
        nama,
        prodi_id: Number(prodi_id),
        angkatan: Number(angkatan),
        foto
      }
    });
  } catch (error) {
    // Hapus file yang sudah terlanjur diupload jika database error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    const err = error as Error;
    res.status(500).json({ message: 'Gagal menambahkan data mahasiswa', error: err.message });
  }
};

export const updateMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nim, nama, prodi_id, angkatan } = req.body;
    
    if (!nim || !nama || !prodi_id || !angkatan) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: 'NIM, Nama, Prodi ID, dan Angkatan wajib diisi' });
      return;
    }

    // Ambil data mahasiswa lama untuk mengecek foto lama
    const [oldRows] = await pool.query<RowDataPacket[]>(
      'SELECT foto FROM mahasiswa WHERE id = ?',
      [id]
    );

    if (oldRows.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      return;
    }

    const oldFoto = oldRows[0].foto;
    let foto = oldFoto;

    if (req.file) {
      foto = req.file.filename;
      // Hapus foto lama jika ada
      if (oldFoto) {
        const oldFotoPath = path.join(__dirname, '../../uploads/mahasiswa', oldFoto);
        if (fs.existsSync(oldFotoPath)) {
          fs.unlinkSync(oldFotoPath);
        }
      }
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE mahasiswa SET nim = ?, nama = ?, prodi_id = ?, angkatan = ?, foto = ? WHERE id = ?',
      [nim, nama, prodi_id, angkatan, foto, id]
    );

    res.json({
      message: 'Data mahasiswa berhasil diperbarui',
      data: {
        id: Number(id),
        nim,
        nama,
        prodi_id: Number(prodi_id),
        angkatan: Number(angkatan),
        foto
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    const err = error as Error;
    res.status(500).json({ message: 'Gagal memperbarui data mahasiswa', error: err.message });
  }
};

export const deleteMahasiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Ambil info foto sebelum dihapus
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT foto FROM mahasiswa WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      return;
    }

    const foto = rows[0].foto;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM mahasiswa WHERE id = ?',
      [id]
    );

    // Hapus file foto dari disk jika ada
    if (foto) {
      const fotoPath = path.join(__dirname, '../../uploads/mahasiswa', foto);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }

    res.json({
      message: 'Data mahasiswa berhasil dihapus'
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ message: 'Gagal menghapus data mahasiswa', error: err.message });
  }
};
