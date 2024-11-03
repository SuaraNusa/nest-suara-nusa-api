# Stage 1: Build dependencies
FROM node:22 AS builder

WORKDIR /usr/src/app

# Salin package.json dan package-lock.json lalu instal dependensi
COPY package*.json ./
RUN npm install

# Salin Prisma schema dan generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Salin seluruh kode aplikasi dan build
COPY . .
RUN npm run build

# Stage 2: Copy build output to final image
FROM node:22 AS runner

WORKDIR /usr/src/app

# Install libasound2 untuk mendukung audio
RUN apt-get update && apt-get install -y libasound2 && rm -rf /var/lib/apt/lists/*

# Salin node_modules dan hasil build dari tahap builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Expose port yang digunakan oleh aplikasi
EXPOSE 8080

# Jalankan aplikasi
CMD ["node", "dist/main.js"]
