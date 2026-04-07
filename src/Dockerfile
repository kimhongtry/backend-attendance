# --- STAGE 1: Build Stage ---
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including typescript)
RUN npm install

# Copy the entire source code (src, etc.)
COPY . .

# Compile TypeScript to JavaScript (creates the /dist folder)
RUN npm run build

# --- STAGE 2: Production Stage ---
FROM node:20-alpine

WORKDIR /app

# Copy only the package files
COPY package*.json ./

# Install ONLY production dependencies (no typescript/dev-tools)
RUN npm install --omit=dev

# Copy the compiled JS from the builder stage
COPY --from=builder /app/dist ./dist

# Copy .env if you want it inside (though usually passed at runtime)
# COPY .env .env 

# Expose the port from your BASE_URL (5000)
EXPOSE 5000

# Start the server using the compiled entry point
# Based on your structure, it's likely dist/server.js or dist/app.js
CMD ["node", "dist/server.js"]