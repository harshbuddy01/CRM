const agentService = require('../services/agent.service');

const getAllAgents = async (req, res, next) => {
  try {
    const agents = await agentService.getAllAgents(req.query);
    res.json({ success: true, data: agents });
  } catch (error) {
    next(error);
  }
};

const getAgentById = async (req, res, next) => {
  try {
    const agent = await agentService.getAgentById(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
    res.json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
};

const createAgent = async (req, res, next) => {
  try {
    const agent = await agentService.createAgent(req.body);
    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
};

const updateAgent = async (req, res, next) => {
  try {
    const agent = await agentService.updateAgent(req.params.id, req.body);
    res.json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
};

const deleteAgent = async (req, res, next) => {
  try {
    await agentService.deleteAgent(req.params.id);
    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
};
