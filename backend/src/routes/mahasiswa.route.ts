import { Router } from 'express';
import { 
  getMahasiswa, 
  getMahasiswaById, 
  createMahasiswa, 
  updateMahasiswa, 
  deleteMahasiswa 
} from '../controllers/mahasiswa.controller';
import { uploadFotoMahasiswa } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Semua endpoint mahasiswa dilindungi dengan authMiddleware (Pertemuan 13)
router.get('/', authMiddleware, getMahasiswa);
router.get('/:id', authMiddleware, getMahasiswaById);
router.post('/', authMiddleware, uploadFotoMahasiswa.single('foto'), createMahasiswa);
router.put('/:id', authMiddleware, uploadFotoMahasiswa.single('foto'), updateMahasiswa);
router.delete('/:id', authMiddleware, deleteMahasiswa);

export default router;
