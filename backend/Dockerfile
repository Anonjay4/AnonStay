FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies based on lockfile
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Expose backend port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
