# Use official Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package metadata first for caching layer
COPY package.json ./

# Install dependencies (ltijs, express, mariadb must be in package.json)
RUN npm install

# Copy remaining backend files (index.js, etc.)
COPY . .

# Expose the app port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
