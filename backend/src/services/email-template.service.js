const prisma = require('../config/prisma');

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
  const signature = allSettings.find(s => s.key === 'email_signature')?.value || '';
  
  if (signature) {
    finalBody += `<br><br>${signature}`;
  }

  // 4. Send via SendGrid (Queue it)
  const queueService = require('./queue.service');
  await queueService.addEmailJob({
    to: query.email,
    cc,
    subject: finalSubject,
    html: finalBody,
  });

  // 5. Log it
  return await prisma.emailLog.create({
    data: {
      queryId,
      templateId,
      subject: finalSubject,
      body: finalBody,
      sentBy,
      status: 'queued',
    },
  });
};

module.exports = {
  createTemplate,
  getTemplates,
  getActiveTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  sendQueryEmail,
};
