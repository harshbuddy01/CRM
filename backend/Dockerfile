# ============================================================
# TravelCRM — Backend Dockerfile (Railway PDF Specialist)
# ============================================================
# This environment includes all necessary system libraries 
# for headless Chromium / Puppeteer to run reliably.
# ============================================================

FROM node:20-slim

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

# Install dependencies (including puppeteer-core & @sparticuz/chromium)
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Expose the API port (Railway takes care of mapping to PORT env var)
EXPOSE 3001

# Start script launches both the API and the Background Worker via concurrently
CMD ["npm", "start"]
