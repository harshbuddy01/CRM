// ============================================================
// TravelCRM — User Controller
// ============================================================

const userService = require('../services/user.service');

const getActiveAgents = async (req, res, next) => {
  try {
    const agents = await userService.listActiveAgents();
    
    const data = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      roleName: agent.role.name,
      roleLabel: agent.role.label,
      maxLeads: agent.maxLeads,
      isActive: agent.isActive,
      isOnLeave: agent.isOnLeave,
      mobileOnly: agent.mobileOnly,
      activeLeadCount: agent._count.assignedQueries,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const listAllUsers = async (req, res, next) => {
  try {
    const users = await userService.listAllUsers();
    
    const data = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isOnLeave: user.isOnLeave,
      leaveUntil: user.leaveUntil,
      maxLeads: user.maxLeads,
      mobileOnly: user.mobileOnly,
      activeLeadCount: user._count.assignedQueries,
      createdAt: user.createdAt,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, roleId, maxLeads, mobileOnly } = req.body;

    if (!name || !email || !password || !roleId) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and roleId are required' });
    }

    const user = await userService.createUser({ name, email, password, roleId, maxLeads, mobileOnly });
    res.status(201).json({ success: true, message: 'User created', data: user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    next(error);
  }
};

const listRoles = async (req, res, next) => {
  try {
    const roles = await userService.listRoles();
    res.json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
};

const getUserPermissions = async (req, res, next) => {
  try {
    const permissions = await userService.getUserPermissions(req.params.id);
    res.json({ success: true, data: permissions });
  } catch (error) {
    next(error);
  }
};

const setPermissionOverride = async (req, res, next) => {
  try {
    const { permissionId, granted, reason } = req.body;

    if (!permissionId || granted === undefined) {
      return res.status(400).json({ success: false, message: 'permissionId and granted are required' });
    }

    const override = await userService.setPermissionOverride(
      req.params.id, permissionId, granted, reason, req.user.id
    );
    res.json({ success: true, message: 'Permission override set', data: override });
  } catch (error) {
    next(error);
  }
};

const removePermissionOverride = async (req, res, next) => {
  try {
    const { permissionId } = req.params;
    await userService.removePermissionOverride(req.params.id, permissionId);
    res.json({ success: true, message: 'Permission override removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveAgents,
  listAllUsers,
  createUser,
  updateUser,
  listRoles,
  getUserPermissions,
  setPermissionOverride,
  removePermissionOverride,
};
