const express = require('express');
const emailTemplateController = require('../controllers/email-template.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

const router = express.Router();

// Email templates can be viewed/used by anyone who can edit queries
// But managed (created/updated) by admins
router.get('/', authenticate, can('query.edit_all'), emailTemplateController.getTemplates);
router.get('/active', authenticate, emailTemplateController.getActiveTemplates);
router.get('/:id', authenticate, can('query.edit_all'), emailTemplateController.getTemplateById);

router.post('/', authenticate, can('users.manage'), emailTemplateController.createTemplate);
router.put('/:id', authenticate, can('users.manage'), emailTemplateController.updateTemplate);
router.delete('/:id', authenticate, can('users.manage'), emailTemplateController.deleteTemplate);

module.exports = router;
