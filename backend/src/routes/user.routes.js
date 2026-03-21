// ============================================================
// TravelCRM — User Routes
// ============================================================

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

// Only managers/admins who can edit/assign queries should see the full agent list
router.get('/agents', can('query.edit_all'), userController.getActiveAgents);

// Admin-only user management routes
router.get('/', can('users.manage'), userController.listAllUsers);
router.post('/', can('users.manage'), userController.createUser);
router.put('/:id', can('users.manage'), userController.updateUser);
router.delete('/:id', can('users.manage'), userController.deleteUser);

// Roles
router.get('/roles', can('users.manage'), userController.listRoles);

// Permission overrides
router.get('/:id/permissions', can('users.manage'), userController.getUserPermissions);
router.post('/:id/permissions', can('users.manage'), userController.setPermissionOverride);
router.delete('/:id/permissions/:permissionId', can('users.manage'), userController.removePermissionOverride);

module.exports = router;
