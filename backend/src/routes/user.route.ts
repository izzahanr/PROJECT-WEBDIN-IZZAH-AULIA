import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, resetPassword } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

// Semua endpoint user hanya bisa diakses oleh admin
router.use(authMiddleware);
router.use(allowRoles('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/reset-password', resetPassword);

export default router;
