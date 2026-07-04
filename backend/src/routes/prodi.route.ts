import { Router } from 'express';
import { getAllProdi, createProdi, updateProdi, deleteProdi } from '../controllers/prodi.controller';

const router = Router();

router.get('/', getAllProdi);
router.post('/', createProdi);
router.put('/:id', updateProdi);
router.delete('/:id', deleteProdi);

export default router;
