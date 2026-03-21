# ============================================================
# TravelCRM — Backend Dockerfile (Enhanced Reliability)
# ============================================================

# Using full node:20 for better dependency compatibility than slim
FROM node:20

# Install system dependencies for Chromium / Puppeteer
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install ALL dependencies (including dev deps if needed for builds)
RUN npm install

# Copy all source files before generate/migrate
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose the API port
EXPOSE 8080

# Run migrations and start the server
CMD ["sh", "-c", "npm run migrate && exec npm start"]
