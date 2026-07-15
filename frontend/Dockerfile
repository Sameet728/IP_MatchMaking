FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Install a simple static server
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Start static server
CMD ["serve", "-s", "dist", "-l", "5173", "--cors"]
