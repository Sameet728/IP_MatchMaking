# 1. Base stage: Set up directory and copy configuration files
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

# 2. Development stage: Used for hot-reloading dev environment
FROM base AS development
# Install all dependencies (including devDependencies)
RUN npm install
# Copy the rest of the backend files
COPY . .
# Generate the Prisma client based on schema
RUN npm run db:generate
# Expose Port 4000
EXPOSE 4000
# Run the development server
CMD ["npm", "run", "dev"]

# 3. Builder stage: Compiles code and prepares production dependencies
FROM base AS builder
# Install all dependencies for compiling
RUN npm ci
# Copy source files
COPY . .
# Generate Prisma client
RUN npm run db:generate
# Compile TypeScript to JavaScript (creates dist/ folder)
RUN npm run build
# Prune node_modules to keep only production-needed dependencies
RUN npm prune --production

# 4. Production stage: Minimal runtime image
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy only production dependencies and compiled build outputs from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose Port 4000
EXPOSE 4000

# Start production server
CMD ["npm", "run", "start"]
