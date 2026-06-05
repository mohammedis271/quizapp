# Stage 1: Build Frontend
FROM node:24 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend and serve Frontend
FROM node:24
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 5000
CMD ["node", "index.js"]
