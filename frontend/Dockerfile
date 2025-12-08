# Step 1 — Use Node image to build the app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend source code
COPY . .

# Build the Vite app
RUN npm run build

# Step 2 — Use a lightweight image to serve the app
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install serve globally to host the built files
RUN npm install -g serve

# Copy built assets from previous stage
COPY --from=builder /app/dist ./dist

# Expose port 5173
EXPOSE 5173

# Start the frontend
CMD ["serve", "-s", "dist", "-l", "5173"]

