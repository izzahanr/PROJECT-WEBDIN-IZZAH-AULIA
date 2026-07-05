import { Router } from 'express';
import {
  getMahasiswa,
  getMahasiswaById,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from '../controllers/mahasiswa.controller';
import { uploadFotoMahasiswa } from '../middlewares/upload.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

// GET — admin, operator, viewer
router.get(
  '/',
  authMiddleware,
  allowRoles('admin', 'operator', 'viewer'),
  getMahasiswa
);

router.get(
  '/:id',
  authMiddleware,
  allowRoles('admin', 'operator', 'viewer'),
  getMahasiswaById
);

// POST — admin, operator
router.post(
  '/',
  authMiddleware,
  allowRoles('admin', 'operator'),
  uploadFotoMahasiswa.single('foto'),
  createMahasiswa
);

// PUT — admin, operator
router.put(
  '/:id',
  authMiddleware,
  allowRoles('admin', 'operator'),
  uploadFotoMahasiswa.single('foto'),
  updateMahasiswa
);

// DELETE — admin only
router.delete(
  '/:id',
  authMiddleware,
  allowRoles('admin'),
  deleteMahasiswa
);

export default router;
