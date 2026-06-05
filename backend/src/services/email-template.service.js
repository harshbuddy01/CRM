const prisma = require('../config/prisma');
const { getArtisanalEmailFrame } = require('../templates/artisanalEmail.template');

const createTemplate = async (data) => {
  return await prisma.emailTemplate.create({
    data: {
      name: data.name,
      subject: data.subject,
      bodyRichText: data.bodyRichText,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
};

const getTemplates = async () => {
  return await prisma.emailTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

const getActiveTemplates = async () => {
  return await prisma.emailTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
};

const getTemplateById = async (id) => {
  const template = await prisma.emailTemplate.findUnique({
    where: { id },
  });
  if (!template) {
    const error = new Error('Email template not found');
    error.status = 404;
    throw error;
  }
  return template;
};

const updateTemplate = async (id, data) => {
  return await prisma.emailTemplate.update({
    where: { id },
    data: {
      name: data.name,
      subject: data.subject,
      bodyRichText: data.bodyRichText,
      isActive: data.isActive,
    },
  });
};

const deleteTemplate = async (id) => {
  return await prisma.emailTemplate.delete({
    where: { id },
  });
};

const sendQueryEmail = async ({ queryId, templateId, subject, body, cc, sentBy }) => {
  const query = await prisma.query.findUnique({
    where: { id: queryId },
    include: { client: true },
  });

  if (!query) throw new Error('Query not found');

  let finalSubject = subject;
  let finalBody = body;

  // 1. If templateId is provided, fetch it and use its content if subject/body are missing
  if (templateId) {
    const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
    if (template) {
      if (!finalSubject) finalSubject = template.subject;
      if (!finalBody) finalBody = template.bodyRichText;
    }
  }

  // 2. Variable Interpolation
  const variables = {
    '#{customerName}': query.name || (query.client ? query.client.name : 'Customer'),
    '#{queryId}': query.queryCode,
  };

  Object.entries(variables).forEach(([key, val]) => {
    finalSubject = finalSubject.replace(new RegExp(key, 'g'), val);
    finalBody = finalBody.replace(new RegExp(key, 'g'), val);
  });

  // 3. Append Company Signature
  const orgSettingsService = require('./org-setting.service');
  const allSettings = await orgSettingsService.getAllSettings();
  const signature = allSettings.emailSignature || '';
  
  // 4. Wrap in Artisanal Frame
  const isProposal = finalSubject.toLowerCase().includes('proposal') || finalSubject.toLowerCase().includes('itinerary');
  
  if (isProposal) {
    finalBody = `<p style="font-size: 20px; font-weight: 700; color: #a5813b; margin-bottom: 20px;">A handcrafted invitation for your mountain escape awaits...</p>${finalBody}`;
  }

  const wrappedBody = getArtisanalEmailFrame({
    subject: finalSubject,
    bodyContent: finalBody,
    agentSignature: signature,
    inviteType: isProposal ? 'proposal' : 'general'
  });

  // 5. Send via SendGrid (Queue it)
  const queueService = require('./queue.service');
  await queueService.enqueueEmailJob(
    queryId,
    query.email,
    finalSubject,
    wrappedBody,
    cc
  );

  // 5. Log it
  const log = await prisma.emailLog.create({
    data: {
      queryId,
      templateId,
      to: query.email,
      cc: cc || null,
      subject: finalSubject,
      body: finalBody,
      sentBy,
      status: 'sent',
      communicationType: 'customer',
    },
  });

  // 6. Create ActivityLog for unified history
  await prisma.activityLog.create({
    data: {
      userId: sentBy,
      action: 'integration.email.success',
      entityType: 'query',
      entityId: queryId,
      newValue: { to: query.email, subject: finalSubject }
    }
  });

  return log;
};

const sendSupplierEmail = async ({ queryId, supplierIds, subject, body, cc, sentBy }) => {
  const query = await prisma.query.findUnique({
    where: { id: queryId },
  });

  if (!query) throw new Error('Query not found');
  if (!supplierIds || !supplierIds.length) throw new Error('No suppliers selected');

  const suppliers = await prisma.supplier.findMany({
    where: { id: { in: supplierIds } }
  });

  const queueService = require('./queue.service');
  
  const logs = [];

  const orgSettingsService = require('./org-setting.service');
  const allSettings = await orgSettingsService.getAllSettings();
  const signature = allSettings.emailSignature || '';

  for (const supplier of suppliers) {
    if (!supplier.email) continue; // skip suppliers without email

    const wrappedBody = getArtisanalEmailFrame({
      subject: subject,
      bodyContent: body,
      agentSignature: signature,
      inviteType: 'general'
    });

    // Send via SendGrid
    await queueService.enqueueEmailJob(
      queryId,
      supplier.email,
      subject,
      wrappedBody,
      cc
    );

    // Log it
    const log = await prisma.emailLog.create({
      data: {
        queryId,
        to: supplier.email,
        cc: cc || null,
        subject: subject,
        body: body, // Save raw body in log for clean CRM rendering
        sentBy,
        status: 'sent',
        communicationType: 'supplier',
      },
    });
    logs.push(log);
  }
  
  if (logs.length > 0) {
    // Create ActivityLog for unified history
    await prisma.activityLog.create({
      data: {
        userId: sentBy,
        action: 'integration.email.success',
        entityType: 'query',
        entityId: queryId,
        newValue: { target: 'Suppliers', count: logs.length, subject }
      }
    });
  }

  return logs;
};

module.exports = {
  createTemplate,
  getTemplates,
  getActiveTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  sendQueryEmail,
  sendSupplierEmail,
};
