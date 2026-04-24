# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy source and config
COPY tsconfig.json ./
COPY . . 

RUN npm run build

# Production stage
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# --- NEW SECTION TO FIX PERMISSIONS ---
# Create the directory and give ownership to the 'node' user
RUN mkdir -p uploads/avatars && chown -R node:node /app

# Now it is safe to switch to the non-root user
USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]