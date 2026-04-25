# # Build stage
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . . 
# RUN npm run build

# # Production stage
# FROM node:20-alpine
# ENV NODE_ENV=production
# WORKDIR /app
# COPY package*.json ./
# RUN npm install --omit=dev
# COPY --from=builder /app/dist ./dist

# # Create uploads directory and fix permissions
# RUN mkdir -p uploads/avatars && chown -R node:node /app

# USER node
# EXPOSE 5000
# CMD ["node", "dist/server.js"]
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

# Create uploads directory and fix permissions
RUN mkdir -p uploads/avatars && chown -R node:node /app

USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]