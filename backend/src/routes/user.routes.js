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
router.get('/', can('user.manage'), userController.listAllUsers);
router.post('/', can('user.manage'), userController.createUser);
router.put('/:id', can('user.manage'), userController.updateUser);

// Roles
router.get('/roles', can('user.manage'), userController.listRoles);

// Permission overrides
router.get('/:id/permissions', can('user.manage'), userController.getUserPermissions);
router.post('/:id/permissions', can('user.manage'), userController.setPermissionOverride);
router.delete('/:id/permissions/:permissionId', can('user.manage'), userController.removePermissionOverride);

module.exports = router;
