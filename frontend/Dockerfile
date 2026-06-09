# Frontend VesteBem — build do Vite (React) servido como estatico via nginx

# ---------- Estagio 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Cache de dependencias
COPY package*.json ./
RUN npm install

# O Vite injeta as VITE_* no bundle em TEMPO DE BUILD (sao valores client-side,
# publicos por natureza). Por isso entram como build args, nao como env de runtime.
ARG VITE_API_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ENV VITE_API_URL=$VITE_API_URL \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

COPY . .
RUN npm run build

# ---------- Estagio 2: servico estatico ----------
FROM nginx:alpine AS serve

# Config com fallback de SPA (mesma ideia do vercel.json)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Apenas o resultado do build vai para a imagem final (sem node_modules/codigo)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
