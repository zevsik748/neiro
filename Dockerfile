# Минимальный Dockerfile для Node.js Express
FROM node:24

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm install

COPY backend/server.js ./
COPY frontend ./frontend

EXPOSE 8000

CMD ["npm", "start"]
