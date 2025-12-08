# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install all dependencies (including dotenv)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the service port
EXPOSE 5008

# Start the service
CMD ["npm", "start"]

