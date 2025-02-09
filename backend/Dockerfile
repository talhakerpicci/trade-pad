FROM node:20-alpine

WORKDIR /app

# Install netcat for database connection checking
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Make the startup script executable
COPY scripts/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 5000

# Use the startup script as the entry point
CMD ["/start.sh"] 