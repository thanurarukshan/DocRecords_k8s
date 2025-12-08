# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first for dependency caching
COPY package*.json ./

# Install only production dependencies
RUN npm install

# Copy all service source files
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the patient service
CMD ["npm", "start"]

