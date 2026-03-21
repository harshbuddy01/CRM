const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

router.get('/', agentController.getAllAgents);
router.get('/:id', agentController.getAgentById);
router.post('/', can('users.manage'), agentController.createAgent);
router.patch('/:id', can('users.manage'), agentController.updateAgent);
router.delete('/:id', can('users.manage'), agentController.deleteAgent);

module.exports = router;
