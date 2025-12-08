# Use a lightweight Node.js base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first for efficient caching
COPY package*.json ./

# Install only production dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the service port
EXPOSE 5004

# Start the prescription service
CMD ["npm", "start"]

