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
      updatedAt: user.updatedAt,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, roleId, maxLeads, mobileOnly, sendCredentials } = req.body;

    if (!name || !email || !password || !roleId) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and roleId are required' });
    }

    const user = await userService.createUser({ name, email, password, roleId, maxLeads, mobileOnly });

    // Send welcome email in background — only if sendCredentials is not explicitly false
    if (sendCredentials !== false) {
      const config = require('../config');

      // Only attempt to send if an email provider is configured
      const hasEmailProvider = !!(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS);
      if (hasEmailProvider) {
        setImmediate(async () => {
          try {
            const queueService = require('../services/queue.service');
            const loginUrl = `${config.frontendUrl || 'https://travelcrm.railway.app'}/login`;
            const htmlBody = buildCredentialEmailHtml({ name, email, password, loginUrl, companyUrl: config.frontendUrl });
            const from = `"${config.email.adminFromName}" <${config.email.adminFrom}>`;
            await queueService.enqueueEmailJob(null, email, 'Welcome to TravelCRM ✈️ — Your Account is Ready', htmlBody, null, from);
          } catch (err) {
            const logger = require('../utils/logger');
            logger.error('[User] Failed to queue welcome email:', err.message);
          }
        });
      }
    }

    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (error) {
    next(error);
  }
};

const resetAndSendPassword = async (req, res, next) => {
  try {
    const prisma = require('../config/prisma');
    const bcrypt = require('bcryptjs');
    const config = require('../config');

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate a random 10-character password (letters + numbers)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let newPassword = '';
    for (let i = 0; i < 10; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Hash and save
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    // Send email with new credentials
    const hasEmailProvider = !!(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS);
    if (hasEmailProvider) {
      const queueService = require('../services/queue.service');
      const loginUrl = `${config.frontendUrl || 'https://travelcrm.railway.app'}/login`;
      const htmlBody = buildCredentialEmailHtml({
        name: user.name,
        email: user.email,
        password: newPassword,
        loginUrl,
        companyUrl: config.frontendUrl,
        isReset: true,
      });
      const from = `"${config.email.adminFromName}" <${config.email.adminFrom}>`;
      await queueService.enqueueEmailJob(null, user.email, 'Your TravelCRM Password Has Been Reset', htmlBody, null, from);
    }

    res.json({ success: true, message: `Password has been reset and emailed to ${user.name}.` });
  } catch (error) {
    next(error);
  }
};

/**
 * Shared HTML builder for welcome + reset credential emails
 */
function buildCredentialEmailHtml({ name, email, password, loginUrl, companyUrl, isReset = false }) {
  const heading = isReset ? 'Your Password Has Been Reset' : 'Welcome to TravelCRM! ✈️';
  const intro = isReset
    ? 'Your password has been reset by the administrator. Below are your updated login credentials:'
    : 'Your account has been created successfully. Below are your login credentials:';

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">✈️ TravelCRM</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">${heading}</h2>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Hi <strong>${name}</strong>,<br/>${intro}
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 0 0 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Login URL</td></tr>
            <tr><td style="padding: 0 0 16px 0;"><a href="${loginUrl}" style="color: #4f46e5; font-size: 14px; word-break: break-all;">${loginUrl}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</td></tr>
            <tr><td style="padding: 0 0 16px 0; color: #1f2937; font-size: 15px; font-weight: 500;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Password</td></tr>
            <tr><td style="padding: 0 0 0 0;"><code style="background: #eef2ff; color: #4338ca; padding: 6px 14px; border-radius: 6px; font-size: 16px; font-weight: 700; letter-spacing: 1px;">${password}</code></td></tr>
          </table>
        </div>
        <div style="text-align: center; margin: 0 0 24px 0;">
          <a href="${loginUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600;">Sign In to TravelCRM</a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
          For security, please change your password from your <strong>Profile</strong> page after your first login.
        </p>
      </div>
      <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">${companyUrl || 'TravelCRM'}</p>
      </div>
    </div>
  `;
}

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user.id);
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

const deleteUser = async (req, res, next) => {
  try {
    const { reassignToId } = req.body;
    await userService.deleteUser(req.params.id, req.user.id, reassignToId);
    res.json({ success: true, message: 'User deactivated and workload re-assigned' });
  } catch (error) {
    next(error);
  }
};

const getUserOffboardStats = async (req, res, next) => {
  try {
    const stats = await userService.getUserOffboardStats(req.params.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveAgents,
  listAllUsers,
  createUser,
  resetAndSendPassword,
  updateUser,
  deleteUser,
  getUserOffboardStats,
  listRoles,
  getUserPermissions,
  setPermissionOverride,
  removePermissionOverride,
};
