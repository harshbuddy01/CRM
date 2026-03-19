// ============================================================
// TravelCRM — Auth Service
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const config = require('../config');
const { BusinessError, UnauthorizedError, NotFoundError } = require('../utils/AppError');
const { getUserPermissions } = require('../middlewares/authenticate');

const generateTokens = (user) => {
  const payload = { id: user.id };
  const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
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

  const tokens = generateTokens(user);
  const permissions = await getUserPermissions(user.id);

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
    const tokens = generateTokens(user);
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Update existing session record
    await prisma.userSession.update({
      where: { id: validSession.id },
      data: { refreshTokenHash: newHash, expiresAt }
    });

    return tokens;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
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

module.exports = {
  register,
  login,
  refreshToken,
  changePassword,
  logout
};
