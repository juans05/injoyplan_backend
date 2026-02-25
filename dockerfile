# Step 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and generate Prisma client
COPY . .
RUN npx prisma generate

# Build the app
RUN npm run build

# Step 2: Run the application
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only the necessary files from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose the port
EXPOSE 3000
ENV PORT=3000

# Run migrations and start the app
# Note: In production we use 'prisma migrate deploy' or 'prisma db push'
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/src/main.js"]
