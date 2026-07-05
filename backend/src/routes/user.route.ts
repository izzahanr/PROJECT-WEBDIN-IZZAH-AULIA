import { Router } from 'express';
import { getUsers, createUser, resetPassword } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

// Semua endpoint user hanya bisa diakses oleh admin
router.get('/', authMiddleware, allowRoles('admin'), getUsers);
router.post('/', authMiddleware, allowRoles('admin'), createUser);
router.patch('/:id/reset-password', authMiddleware, allowRoles('admin'), resetPassword);

export default router;
