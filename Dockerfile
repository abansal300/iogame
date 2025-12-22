# Multi-stage Dockerfile for production deployment

# Stage 1: Build client
FROM node:20-alpine AS client-builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci --workspace=client --workspace=shared

# Copy source files
COPY client ./client
COPY shared ./shared

# Build client
RUN npm run build --workspace=client

# Stage 2: Build server
FROM node:20-alpine AS server-builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install dependencies (including tsx for runtime)
RUN npm ci --workspace=server --workspace=shared

# Copy source files
COPY server ./server
COPY shared ./shared

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app

# Copy server dependencies and code
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/server ./server
COPY --from=server-builder /app/shared ./shared
COPY --from=server-builder /app/package*.json ./

# Copy built client files
COPY --from=client-builder /app/client/dist ./client/dist

# Serve client files from server
RUN cd server && npm install express

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Start server
CMD ["npm", "run", "start", "--workspace=server"]
