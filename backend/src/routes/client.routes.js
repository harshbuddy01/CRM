const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.post('/', can('users.manage'), clientController.createClient);
router.patch('/:id', can('users.manage'), clientController.updateClient);
router.delete('/:id', can('users.manage'), clientController.deleteClient);

module.exports = router;
