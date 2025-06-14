FROM node:22-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Use npm ci for faster, more reliable builds
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

ENV LISTEN_ADDRESS=0.0.0.0
ENV PORT=80

# Use JSON format for CMD to avoid signal handling issues
CMD ["npm", "start"]

EXPOSE 80
