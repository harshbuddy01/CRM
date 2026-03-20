// ============================================================
// TravelCRM — User Controller
// ============================================================

const userService = require('../services/user.service');

const getActiveAgents = async (req, res, next) => {
  try {
    const agents = await userService.listActiveAgents();
    
    // Map response to include activeLeadCount
    const data = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      roleName: agent.role.name,
      maxLeads: agent.maxLeads,
      activeLeadCount: agent.queries.length,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveAgents,
};
