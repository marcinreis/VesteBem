# Backend VesteBem — Node + Express + Firebase Admin
FROM node:20-alpine

WORKDIR /app

# Copia os manifests primeiro para aproveitar o cache de camadas do Docker:
# enquanto package.json nao muda, a camada de dependencias e reaproveitada.
COPY package*.json ./
RUN npm install --omit=dev

# Codigo da aplicacao
COPY . .

ENV NODE_ENV=production

# index.js usa process.env.PORT || 3000 (Railway injeta PORT em runtime).
EXPOSE 3000

CMD ["npm", "start"]
