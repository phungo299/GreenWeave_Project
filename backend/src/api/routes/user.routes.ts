import express, { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, isAdmin, isOwnerOrAdmin } from '../middlewares/auth.middleware';
import { validateChangePassword, validateUpdateUser } from '../validators';

const router: Router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get('/', isAdmin, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Owner or Admin
 */
router.get('/:id', isOwnerOrAdmin('id'), userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Owner or Admin
 */
router.put('/:id', isOwnerOrAdmin('id'), validateUpdateUser, userController.updateUser);

/**
 * @route   PUT /api/users/:id/change-password
 * @desc    Change password
 * @access  Owner only
 */
router.put('/:id/change-password', isOwnerOrAdmin('id'), validateChangePassword, userController.changePassword);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin only
 */
router.delete('/:id', isAdmin, userController.deleteUser);

export default router; 