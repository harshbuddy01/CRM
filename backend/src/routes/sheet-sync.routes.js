// ============================================================
// TravelCRM — Sheet Sync Routes (Sprint 8)
// ============================================================

const express = require('express');
const router = express.Router();
const sheetService = require('../services/sheet-sync.service');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

router.get('/sheets', can('users.manage'), async (req, res, next) => {
  try { res.json({ success: true, data: await sheetService.listConfigs() }); }
  catch (e) { next(e); }
});

router.get('/sheets/:id', can('users.manage'), async (req, res, next) => {
  try {
    const config = await sheetService.getConfig(req.params.id);
    if (!config) return res.status(404).json({ success: false, message: 'Config not found' });
    res.json({ success: true, data: config });
  } catch (e) { next(e); }
});

router.post('/sheets', can('users.manage'), async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await sheetService.createConfig(req.body) }); }
  catch (e) { next(e); }
});

router.put('/sheets/:id', can('users.manage'), async (req, res, next) => {
  try { res.json({ success: true, data: await sheetService.updateConfig(req.params.id, req.body) }); }
  catch (e) { next(e); }
});

router.delete('/sheets/:id', can('users.manage'), async (req, res, next) => {
  try { await sheetService.deleteConfig(req.params.id); res.json({ success: true, message: 'Config deleted' }); }
  catch (e) { next(e); }
});

router.post('/sheets/:id/sync', can('users.manage'), async (req, res, next) => {
  try { res.json({ success: true, data: await sheetService.triggerSync(req.params.id) }); }
  catch (e) { next(e); }
});

module.exports = router;
