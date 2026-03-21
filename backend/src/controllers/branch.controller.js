// ============================================================
// TravelCRM — Branch Controller (Sprint 8)
// ============================================================

const branchService = require('../services/branch.service');

const listBranches = async (req, res, next) => {
  try { res.json({ success: true, data: await branchService.listBranches() }); }
  catch (e) { next(e); }
};
const getBranch = async (req, res, next) => {
  try {
    const branch = await branchService.getBranch(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: branch });
  } catch (e) { next(e); }
};
const createBranch = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await branchService.createBranch(req.body) }); }
  catch (e) { next(e); }
};
const updateBranch = async (req, res, next) => {
  try { res.json({ success: true, data: await branchService.updateBranch(req.params.id, req.body) }); }
  catch (e) { next(e); }
};
const deleteBranch = async (req, res, next) => {
  try { await branchService.deleteBranch(req.params.id); res.json({ success: true, message: 'Branch deleted' }); }
  catch (e) { next(e); }
};
const assignUser = async (req, res, next) => {
  try {
    await branchService.assignUserToBranch(req.params.userId, req.params.id);
    res.json({ success: true, message: 'User assigned to branch' });
  } catch (e) { next(e); }
};
const removeUser = async (req, res, next) => {
  try {
    await branchService.removeUserFromBranch(req.params.userId);
    res.json({ success: true, message: 'User removed from branch' });
  } catch (e) { next(e); }
};

module.exports = { listBranches, getBranch, createBranch, updateBranch, deleteBranch, assignUser, removeUser };
