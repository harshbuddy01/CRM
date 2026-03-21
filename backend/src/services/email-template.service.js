const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

module.exports = {
  createTemplate,
  getTemplates,
  getActiveTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};
