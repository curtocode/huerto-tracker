FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copiar código
COPY . .

# Eliminar caché de Next.js si existe
RUN rm -rf .next

# Build de Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]