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
  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new BusinessError('Email already in use');
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new NotFoundError('Role');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
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
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid credentials or account inactive');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate 6-digit verification code (OTP)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const twoFactorSessionId = require('crypto').randomBytes(32).toString('hex');
  const twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save 2FA state to the database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorCode: code,
      twoFactorExpires,
      twoFactorSessionId,
    },
  });

  // Check email provider configuration
  const brevoConfigured = process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS;

  if (!brevoConfigured) {
    const logger = require('../utils/logger');
    logger.info(`[Auth 2FA] Verification code for ${user.email} (no email provider): ${code}`);
  } else {
    try {
      const { sendMail } = require('../config/mailer');
      const adminFrom = `"${config.email.adminFromName}" <${config.email.adminFrom}>`;
      await sendMail({
        from: adminFrom,
        to: user.email,
        subject: 'TravelCRM — Two-Step Verification Code',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">✈️ TravelCRM</h1>
            </div>
            <div style="padding: 32px 24px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">Two-Step Verification Code</h2>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi <strong>${user.name}</strong>,<br/>Here is your 6-digit verification code to log in to your account. This code is valid for <strong>10 minutes</strong>.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; border: 2px dashed #cbd5e1; padding: 12px 24px; border-radius: 8px; background: #f8fafc; font-family: monospace;">${code}</span>
              </div>
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0; text-align: center;">
                If you did not request this code, please secure your account immediately or contact your administrator.
              </p>
            </div>
            <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">${config.frontendUrl || 'TravelCRM'}</p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      const logger = require('../utils/logger');
      logger.error(`[Auth 2FA] Failed to send 2FA email to ${user.email}:`, err.message);
    }
  }

  return {
    requires2FA: true,
    twoFactorSessionId,
  };
};

const verify2FA = async (twoFactorSessionId, code) => {
  const { ValidationError } = require('../utils/AppError');
  if (!twoFactorSessionId || !code) {
    throw new ValidationError('Verification session ID and code are required');
  }

  const user = await prisma.user.findFirst({
    where: { twoFactorSessionId },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid verification session');
  }

  if (!user.twoFactorExpires || user.twoFactorExpires < new Date()) {
    throw new UnauthorizedError('Verification code has expired');
  }

  if (user.twoFactorCode !== code) {
    throw new UnauthorizedError('Invalid verification code');
  }

  // Clear 2FA credentials once verified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorCode: null,
      twoFactorExpires: null,
      twoFactorSessionId: null,
    },
  });

  const permissions = await getUserPermissions(user.id);
  const tokens = generateTokens(user, { role: user.role.name, roleLabel: user.role.label, permissions });

  // Create session
  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
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
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours (was 7 days)

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

  const passwordHash = await bcrypt.hash(newPassword, 12);
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
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Case 1 — User not found: don't reveal if email exists
  if (!user) {
    return { message: 'If this email is registered, a reset link has been sent.', emailSent: false, noAccount: true };
  }

  // Case 2 — User is inactive
  if (!user.isActive) {
    return { message: 'Your account is inactive. Contact your administrator.', emailSent: false, accountInactive: true };
  }

  // Sign with secret + passwordHash so it becomes invalid after use
  const resetSecret = config.jwt.secret + user.passwordHash;
  const resetToken = jwt.sign({ id: user.id, purpose: 'password_reset' }, resetSecret, { expiresIn: '15m' });
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}&id=${user.id}`;

  // Check if email provider is configured (Brevo SMTP)
  const brevoConfigured = process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS;

  // Case 3 — No email provider configured
  if (!brevoConfigured) {
    const logger = require('../utils/logger');
    logger.info(`[Auth] Password reset link (no email provider configured):`);
    logger.info(`[Auth] ${resetUrl}`);
    return { message: 'Email service not configured. Contact your administrator.', emailSent: false, noEmailProvider: true };
  }

  // Try to send the email
  try {
    const { sendMail } = require('../config/mailer');
    const adminFrom = `"${config.email.adminFromName}" <${config.email.adminFrom}>`;
    await sendMail({
      from: adminFrom,
      to: email,
      subject: 'TravelCRM — Reset Your Password',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">✈️ TravelCRM</h1>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">Reset Your Password</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              Hi <strong>${user.name}</strong>,<br/>We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.
            </p>
            <div style="text-align: center; margin: 0 0 24px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600;">Reset Password</a>
            </div>
            <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0; text-align: center;">
              If you didn't request this, you can safely ignore this email.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px;">
              <p style="color: #64748b; font-size: 12px; margin: 0; word-break: break-all;">Direct link: ${resetUrl}</p>
            </div>
          </div>
          <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">${config.frontendUrl || 'TravelCRM'}</p>
          </div>
        </div>
      `,
    });
    // Case 4 — Email sent successfully
    return { message: 'Reset link sent. Check your inbox.', emailSent: true };
  } catch (err) {
    // Case 5 — Email failed to send
    const logger = require('../utils/logger');
    logger.error('[Auth] Failed to send reset email:', err.message);
    return { message: 'Email could not be sent. Contact your administrator.', emailSent: false, emailFailed: true };
  }
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
  const passwordHash = await bcrypt.hash(newPassword, 12);
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
