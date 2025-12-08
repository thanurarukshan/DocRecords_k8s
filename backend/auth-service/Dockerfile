# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the service code
COPY . .

# Expose the service port
EXPOSE 5001

# Start the auth service
CMD ["npm", "start"]

