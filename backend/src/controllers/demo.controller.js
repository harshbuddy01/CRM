const crypto = require('crypto');
const prisma = require('../config/prisma');
const config = require('../config');
const { BusinessError, UnauthorizedError, ValidationError } = require('../utils/AppError');
const { getUserPermissions } = require('../utils/permissions');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Simple in-memory store for OTPs (For production, use Redis)
const demoOtpStore = new Map();

const generateTokens = (user, { role, roleLabel, permissions }) => {
  const payload = { id: user.id, role, roleLabel, permissions };
  const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
  return { accessToken, refreshToken };
};

const signup = async (req, res, next) => {
  try {
    const { name, phone, email, businessType } = req.body;
    if (!name || !phone || !email) {
      throw new ValidationError('Name, phone, and email are required');
    }

    const sessionId = crypto.randomBytes(16).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10 mins TTL
    demoOtpStore.set(sessionId, {
      otp,
      data: { name, phone, email, businessType: businessType || 'Not Specified' },
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    console.log(`[Demo Signup] OTP for ${email}: ${otp}`);

    const whatsappWeb = require('../services/whatsapp-web.service');

    // ── Send OTP to the registering client on WhatsApp ──
    try {
      const clientMsg = `Your StreamKart CRM verification code is: *${otp}*\n\nUse this code to activate your 3-hour trial. Valid for 10 minutes.`;
      await whatsappWeb.sendMessage(phone, clientMsg);
      console.log(`[Demo Signup] OTP sent to client on WhatsApp: ${phone}`);
    } catch (clientWaErr) {
      console.error('[Demo Signup] Client OTP WhatsApp dispatch failed:', clientWaErr.message);
    }

    // ── Notify owner on WhatsApp via WhatsApp Web.js (QR-based, no Meta API) ──
    try {
      const msgBody = `🔔 *New 3-Hour Trial Signup!*\n\n👤 Name: ${name}\n📧 Email: ${email}\n📱 Phone: ${phone}\n🏢 Business: ${businessType || 'Not Specified'}\n\n⏰ Trial started — reach out now!`;
      await whatsappWeb.notifyOwner(msgBody);
    } catch (waErr) {
      console.error('[Demo Signup] Owner WhatsApp notification failed (non-fatal):', waErr.message);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      sessionId,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { sessionId, otp } = req.body;
    if (!sessionId || !otp) {
      throw new ValidationError('Session ID and OTP are required');
    }

    const sessionData = demoOtpStore.get(sessionId);
    if (!sessionData) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    if (sessionData.expiresAt < Date.now()) {
      demoOtpStore.delete(sessionId);
      throw new UnauthorizedError('OTP expired');
    }

    if (sessionData.otp !== otp.toString()) {
      throw new UnauthorizedError('Invalid OTP');
    }

    demoOtpStore.delete(sessionId);

    const { name, email, phone } = sessionData.data;
    
    let role = await prisma.role.findUnique({ where: { name: 'admin' } }); // fallback
    
    const demoExpiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours
    
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          mobile: phone,
          passwordHash,
          roleId: role.id,
          isDemo: true,
          demoExpiresAt,
        },
        include: { role: true },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isDemo: true,
          demoExpiresAt,
          roleId: role.id,
        },
        include: { role: true },
      });
    }

    // Seed data
    try {
      const seedScript = require('../scripts/seed-demo');
      await seedScript.seedDemoData(user.id);
    } catch (seedErr) {
      console.error('[Demo Seed] Error seeding demo data:', seedErr);
    }

    const permissions = await getUserPermissions(user.id);
    const tokens = generateTokens(user, { role: user.role.name, roleLabel: user.role.label, permissions });

    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        deviceInfo: 'Demo Session',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        roleLabel: user.role.label,
        isDemo: user.isDemo,
        demoExpiresAt: user.demoExpiresAt,
        permissions,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.isDemo) {
        try {
            const cleanupJob = require('../jobs/demo-cleanup');
            await cleanupJob.cleanupSingleDemoUser(userId);
        } catch(err) {
            console.error('[Demo Logout] error cleaning up data immediately', err);
        }
      }
    }
    res.json({ success: true, message: 'Demo logged out and cleaned up successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  verifyOtp,
  logout,
};
