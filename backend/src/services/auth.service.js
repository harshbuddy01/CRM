// ============================================================
// TravelCRM — Auth Service
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const config = require('../config');
const { BusinessError, UnauthorizedError, NotFoundError } = require('../utils/AppError');
const { getUserPermissions } = require('../utils/permissions');

const generateTokens = (user, { role, roleLabel, permissions }) => {
  const payload = { id: user.id, role, roleLabel, permissions };
  const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
  return { accessToken, refreshToken };
};

const register = async ({ name, email, password, roleId, createdBy, mobileOnly = false }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BusinessError('Email already in use');
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new NotFoundError('Role');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      roleId,
      createdBy,
      mobileOnly,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: { select: { name: true, label: true } },
      isActive: true,
      mobileOnly: true,
      createdAt: true,
    },
  });

  return user;
};

const login = async (email, password) => {

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid credentials or account inactive');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const permissions = await getUserPermissions(user.id);
  const tokens = generateTokens(user, { role: user.role.name, roleLabel: user.role.label, permissions });

  // Create session
  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      deviceInfo: 'Web', 
      expiresAt,
    }
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      roleLabel: user.role.label,
      mobileOnly: user.mobileOnly,
      permissions,
    },
    ...tokens,
  };
};

const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { role: true } });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid user');
    }

    // Verify session
    const sessions = await prisma.userSession.findMany({ where: { userId: user.id } });
    let validSession = null;
    for (const session of sessions) {
      if (session.expiresAt > new Date()) {
        const isMatch = await bcrypt.compare(token, session.refreshTokenHash);
        if (isMatch) {
          validSession = session;
          break;
        }
      }
    }

    if (!validSession) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Rotate tokens
    // Reload permissions at refresh time so permission changes take effect
    const permissions = await getUserPermissions(user.id);
    const tokens = generateTokens(user, { role: user.role.name, roleLabel: user.role.label, permissions });
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Update existing session record
    await prisma.userSession.update({
      where: { id: validSession.id },
      data: { refreshTokenHash: newHash, expiresAt }
    });

    return tokens;
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    throw error;
  }
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) throw new UnauthorizedError('Incorrect old password');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  // Log out from all devices by deleting all sessions
  await prisma.userSession.deleteMany({
    where: { userId },
  });

  return true;
};

const logout = async (userId, refreshTokenStr) => {
  if (!refreshTokenStr) {
    // Fallback: delete all if specific token not provided
    await prisma.userSession.deleteMany({ where: { userId } });
    return;
  }
  
  const sessions = await prisma.userSession.findMany({ where: { userId } });
  for (const session of sessions) {
    const isMatch = await bcrypt.compare(refreshTokenStr, session.refreshTokenHash);
    if (isMatch) {
      await prisma.userSession.delete({ where: { id: session.id } });
      break;
    }
  }
};

/**
 * Forgot Password — Generate a reset link.
 * The token is a JWT signed with (JWT_SECRET + passwordHash).
 * This makes the token single-use: once the password is changed,
 * the old hash changes and the token becomes invalid.
 */
const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user || !user.isActive) {
    return { message: 'If an account exists with that email, a reset link has been sent.' };
  }

  // Sign with secret + passwordHash so it becomes invalid after use
  const resetSecret = config.jwt.secret + user.passwordHash;
  const resetToken = jwt.sign({ id: user.id, purpose: 'password_reset' }, resetSecret, { expiresIn: '15m' });

  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}&id=${user.id}`;

  // If SendGrid/email is configured, send the email
  const sgApiKey = config.sendgrid?.apiKey;
  if (sgApiKey) {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(sgApiKey);
      await sgMail.send({
        to: email,
        from: config.email.from,
        subject: 'TravelCRM — Reset Your Password',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
          <p><a href="${resetUrl}" style="padding:12px 24px;background:#6366f1;color:white;border-radius:6px;text-decoration:none;font-weight:bold;">Reset Password</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p style="color:#999;font-size:12px;">Link: ${resetUrl}</p>
        `,
      });
    } catch (err) {
      // Log but don't fail — user shouldn't know if email sending failed
      const logger = require('../utils/logger');
      logger.error('[Auth] Failed to send reset email:', err.message);
    }
  } else {
    // No email provider — log the link to console for development
    const logger = require('../utils/logger');
    logger.info(`[Auth] Password reset link (no email provider configured):`);
    logger.info(`[Auth] ${resetUrl}`);
  }

  return { message: 'If an account exists with that email, a reset link has been sent.' };
};

/**
 * Reset Password — Verify token and set new password.
 */
const resetPassword = async (userId, token, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new BusinessError('Invalid or expired reset link');

  // Verify with the same secret used to sign
  const resetSecret = config.jwt.secret + user.passwordHash;
  try {
    const decoded = jwt.verify(token, resetSecret);
    if (decoded.purpose !== 'password_reset' || decoded.id !== userId) {
      throw new BusinessError('Invalid or expired reset link');
    }
  } catch (err) {
    throw new BusinessError('Invalid or expired reset link');
  }

  // Hash and update
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  // Invalidate all sessions (force re-login)
  await prisma.userSession.deleteMany({ where: { userId } });

  return { message: 'Password has been reset successfully. Please log in with your new password.' };
};

module.exports = {
  register,
  login,
  refreshToken,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
};
