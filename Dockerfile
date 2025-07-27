# Root Dockerfile for the entire application
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build the client
RUN cd client && npm run build

# Expose ports
EXPOSE 3000 5000

# Start both client and server
CMD ["npm", "run", "dev"]