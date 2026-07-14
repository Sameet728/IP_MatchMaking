# 1. Base stage: Set up working directory and copy dependencies config
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# 2. Development stage: Used for hot-reloading development environment
FROM base AS development
# Install all dependencies (including devDependencies)
RUN npm install
# Copy the rest of the application files
COPY . .
# Expose port 5173 (Vite's default port)
EXPOSE 5173
# Run Vite dev server, bound to all network interfaces (0.0.0.0)
CMD ["npm", "run", "dev", "--", "--host"]

# 3. Builder stage: Compiles the React SPA for production
FROM base AS builder
# Install all dependencies (including devDependencies)
RUN npm ci
# Copy all source files
COPY . .
# Build static assets (creates dist/ folder)
RUN npm run build

# 4. Production stage: Serve static files with Nginx
FROM nginx:alpine AS production
# Copy the build output from the builder stage to Nginx's public folder
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom Nginx configuration to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80
EXPOSE 80
# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
