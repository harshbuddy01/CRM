// ============================================================
// TravelCRM — Payment Service
// ============================================================

const prisma = require('../config/prisma');
const { BusinessError, NotFoundError } = require('../utils/AppError');
const config = require('../config');
const crypto = require('crypto');
const Razorpay = require('razorpay');

let razorpayInstance = null;
if (config.razorpay.keyId && config.razorpay.keySecret) {
  razorpayInstance = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

const listPayments = async ({ queryId, tourId, status, page = 1, limit = 50 }) => {
  const where = { deletedAt: null };
  if (queryId) where.queryId = queryId;
  if (tourId) where.tourId = tourId;
  if (status) where.status = status;

  const offset = (page - 1) * limit;
  const payments = await prisma.payment.findMany({
    where,
    skip: offset,
    take: parseInt(limit, 10),
    orderBy: { paymentDate: 'desc' },
    include: {
      user: { select: { name: true } },
    },
  });

  const total = await prisma.payment.count({ where });
  return { payments, total, page, totalPages: Math.ceil(total / limit) };
};

const recordManualPayment = async (data, userId) => {
  // Validate tour or query exists
  if (!data.queryId && !data.tourId) {
    throw new BusinessError('Payment must be associated with a Query or Tour');
  }

  const payment = await prisma.payment.create({
    data: {
      queryId: data.queryId || null,
      tourId: data.tourId || null,
      amount: data.amount,
      mode: data.mode, // 'upi','neft','card','cash','cheque'
      referenceUtr: data.referenceUtr,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
      status: 'verified', // Manual entries are verified by default
      notes: data.notes || null,
      recordedBy: userId,
    }
  });

  if (payment.queryId) {
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'payment.recorded',
        entityType: 'query',
        entityId: payment.queryId,
        newValue: {
          amount: Number(payment.amount),
          mode: payment.mode,
          reference: payment.referenceUtr
        }
      }
    });

    const query = await prisma.query.findUnique({ where: { id: payment.queryId }, select: { assignedTo: true, queryCode: true } });
    if (query?.assignedTo && query.assignedTo !== userId) {
      await prisma.notification.create({
        data: {
          userId: query.assignedTo,
          type: 'payment_received',
          message: `A manual payment of ₹${payment.amount} was recorded for Lead ${query.queryCode}.`,
          priority: 'normal',
          relatedType: 'query',
          relatedId: payment.queryId,
          channel: 'in_app'
        }
      });
    }
  }

  return payment;
};

const generateRazorpayLink = async ({ queryId, tourId, amount, description }) => {
  if (!razorpayInstance) {
    throw new BusinessError('Razorpay is not configured on this server');
  }

  // Create a pending payment record
  const payment = await prisma.payment.create({
    data: {
      queryId: queryId || null,
      tourId: tourId || null,
      amount,
      mode: 'razorpay_link',
      paymentDate: new Date(),
      status: 'pending',
      recordedBy: null, // Will replace with user ID if passed, but typically system generates
    }
  });

  try {
    const paymentLinkRequest = {
      amount: amount * 100, // in paise
      currency: "INR",
      accept_partial: false,
      description: description || 'TravelCRM Booking Payment',
      notify: { sms: true, email: true },
      reminder_enable: true,
      notes: {
        payment_id: payment.id,
        query_id: queryId || '',
        tour_id: tourId || '',
      }
    };

    const link = await razorpayInstance.paymentLink.create(paymentLinkRequest);
    return { linkUrl: link.short_url, paymentId: payment.id };
  } catch (error) {
    // Cleanup pending payment if link fails
    await prisma.payment.delete({ where: { id: payment.id } });
    throw new BusinessError(`Failed to generate Razorpay link: ${error.message}`);
  }
};

const handleWebhook = async (body, rawBody, signature) => {
  if (!config.razorpay.webhookSecret) {
    throw new BusinessError('Webhook secret not configured');
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new BusinessError('Invalid signature');
  }

  if (body.event === 'payment.captured' || body.event === 'payment_link.paid') {
    const entity = body.payload.payment?.entity || body.payload.payment_link?.entity;
    const { payment_id: localPaymentId, query_id: qId, tour_id: tId } = entity.notes || {};
    const razorpayPaymentId = entity.id;
    const amount = (entity.amount || entity.amount_paid) / 100;

    // Log the integration event for the unified timeline
    await prisma.integrationLog.create({
      data: {
        type: 'razorpay',
        direction: 'inbound',
        status: 'success',
        relatedId: qId || null,
        payload: {
          event: body.event,
          razorpayPaymentId,
          amount,
          localPaymentId
        }
      }
    });

    if (localPaymentId) {
      await prisma.payment.update({
        where: { id: localPaymentId },
        data: {
          status: 'verified',
          referenceUtr: razorpayPaymentId,
        }
      });
    } else {
      // In case the payment wasn't generated by our link, but from a manual transfer that Razorpay caught
      await prisma.payment.create({
        data: {
          queryId: qId || null,
          tourId: tId || null,
          amount,
          mode: 'razorpay',
          referenceUtr: razorpayPaymentId,
          paymentDate: new Date(),
          status: 'verified',
          recordedBy: null,
          idempotencyKey: razorpayPaymentId
        }
      });
    }

    if (qId) {
      const query = await prisma.query.findUnique({ where: { id: qId }, select: { assignedTo: true, queryCode: true } });
      if (query?.assignedTo) {
        await prisma.notification.create({
          data: {
            userId: query.assignedTo,
            type: 'payment_received',
            message: `A Razorpay payment of ₹${amount} was received for Lead ${query.queryCode}.`,
            priority: 'high',
            relatedType: 'query',
            relatedId: qId,
            channel: 'in_app'
          }
        });
      }
    }
  } else if (body.event.includes('failed')) {
    // Log failures too
    const entity = body.payload.payment?.entity || body.payload.payment_link?.entity;
    const { query_id: qId } = entity?.notes || {};
    
    await prisma.integrationLog.create({
      data: {
        type: 'razorpay',
        direction: 'inbound',
        status: 'failed',
        relatedId: qId || null,
        payload: { event: body.event, error: body.payload.payment?.entity?.error_description }
      }
    });
  }

  return { success: true };
};

const getOverdueTracker = async () => {
  // Find all tours where total payments < proposal selling price
  // Using direct SQL might be easier, but doing it in code:
  
  const activeTours = await prisma.tour.findMany({
    where: { status: { in: ['upcoming', 'running'] }, deletedAt: null },
    include: {
      payments: { where: { status: 'verified', deletedAt: null } },
      proposal: true,
      query: { select: { name: true, phone: true } }
    }
  });

  const overdue = activeTours.map(tour => {
    const totalPaid = tour.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalCost = tour.proposal ? Number(tour.proposal.sellingPrice) : 0;
    const balance = totalCost - totalPaid;
    
    // Condition for overdue: (Tour starts within 7 days AND balance > 0)
    const daysToStart = (tour.startDate - new Date()) / (1000 * 60 * 60 * 24);
    
    return {
      tourId: tour.id,
      tourCode: tour.tourCode,
      customerName: tour.query.name,
      phone: tour.query.phone,
      startDate: tour.startDate,
      totalCost,
      totalPaid,
      balance,
      isOverdue: daysToStart <= 7 && balance > 0
    };
  }).filter(t => t.isOverdue);

  return overdue;
};

const updatePayment = async (paymentId, data, userId) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new NotFoundError('Payment');

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      ...(data.amount !== undefined && { amount: Number(data.amount) }),
      ...(data.mode !== undefined && { mode: data.mode }),
      ...(data.referenceUtr !== undefined && { referenceUtr: data.referenceUtr }),
      ...(data.paymentDate !== undefined && { paymentDate: new Date(data.paymentDate) }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.status !== undefined && { status: data.status }),
    }
  });

  return updated;
};

const deletePayment = async (paymentId, userId) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new NotFoundError('Payment');

  const deleted = await prisma.payment.update({
    where: { id: paymentId },
    data: { deletedAt: new Date() }
  });

  return deleted;
};

module.exports = {
  listPayments,
  recordManualPayment,
  generateRazorpayLink,
  handleWebhook,
  getOverdueTracker,
  updatePayment,
  deletePayment
};
