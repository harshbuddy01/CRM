// ============================================================
// TravelCRM — Branch Routes (Sprint 8)
// ============================================================

const express = require('express');
const router = express.Router();
const branch = require('../controllers/branch.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

router.get('/', can('users.manage'), branch.listBranches);
router.get('/:id', can('users.manage'), branch.getBranch);
router.post('/', can('users.manage'), branch.createBranch);
router.put('/:id', can('users.manage'), branch.updateBranch);
router.delete('/:id', can('users.manage'), branch.deleteBranch);
router.put('/:id/assign/:userId', can('users.manage'), branch.assignUser);
router.put('/:id/remove/:userId', can('users.manage'), branch.removeUser);

module.exports = router;
