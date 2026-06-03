FROM node:20
 
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxext6 libxfixes3 \
    libxrandr2 libgbm1 libasound2 libpango-1.0-0 libcairo2 wget gnupg \
    && rm -rf /var/lib/apt/lists/*
 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
EXPOSE 8080
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node src/index.js & node src/worker.js & wait"]
