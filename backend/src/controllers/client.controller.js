const clientService = require('../services/client.service');

const getAllClients = async (req, res, next) => {
  try {
    const clients = await clientService.getAllClients(req.query);
    res.json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
};

const getClientById = async (req, res, next) => {
  try {
    const client = await clientService.getClientById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};

const createClient = async (req, res, next) => {
  try {
    const client = await clientService.createClient(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const client = await clientService.updateClient(req.params.id, req.body);
    res.json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    await clientService.deleteClient(req.params.id);
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
