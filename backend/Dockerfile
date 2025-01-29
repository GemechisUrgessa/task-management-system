# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app

# Install dependencies for wait-for-db script
RUN apk add --no-cache netcat-openbsd postgresql-client

COPY package*.json ./
RUN npm install
COPY . .
RUN rm -f .env

# Make the wait script executable
RUN chmod +x wait-for-db.sh

CMD ["sh", "-c", "./wait-for-db.sh && npm run migration:run && npm run dev"]
