FROM node:20
 
RUN apt-get update && apt-get install -y \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxext6 libxfixes3 \
    libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2 wget gnupg \
    chromium \
    && rm -rf /var/lib/apt/lists/*
 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
EXPOSE 8080
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js & node src/worker.js & wait"]
