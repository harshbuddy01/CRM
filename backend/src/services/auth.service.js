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

    const tokens = generateTokens(user);
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

  return true;
};

module.exports = {
  register,
  login,
  refreshToken,
  changePassword,
};
