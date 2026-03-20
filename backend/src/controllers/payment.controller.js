// ============================================================
// TravelCRM — Payment Controller
// ============================================================

const paymentService = require('../services/payment.service');
const { BusinessError } = require('../utils/AppError');

const list = async (req, res, next) => {
  try {
    const result = await paymentService.listPayments({
      ...req.query,
      queryId: req.query.queryId,
      tourId: req.query.tourId,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const { amount, mode } = req.body;
    if (!amount || amount <= 0) {
      throw new BusinessError('Amount must be greater than zero');
    }
    if (!['upi','neft','card','cash','cheque'].includes(mode)) {
      throw new BusinessError('Invalid payment mode');
    }

    const result = await paymentService.recordManualPayment({
      ...req.body,
      queryId: req.params.queryId || req.body.queryId, // Supports routing either /queries/:id/payments or direct POST
      tourId: req.params.tourId || req.body.tourId,
    }, req.user.id);
    res.status(201).json({ success: true, message: 'Payment recorded', data: result });
  } catch (error) {
    next(error);
  }
};

const razorpayLink = async (req, res, next) => {
  try {
    const { amount, description, queryId, tourId } = req.body;
    if (!amount || amount <= 0) {
      throw new BusinessError('Amount must be greater than zero');
    }

    const { linkUrl } = await paymentService.generateRazorpayLink({
      queryId,
      tourId,
      amount,
      description,
    });
    res.status(201).json({ success: true, linkUrl });
  } catch (error) {
    next(error);
  }
};

const webhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    await paymentService.handleWebhook(req.body, signature);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

const overdue = async (req, res, next) => {
  try {
    const result = await paymentService.getOverdueTracker();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  recordPayment,
  razorpayLink,
  webhook,
  overdue,
};
