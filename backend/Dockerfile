# ✅ VERSION OPTIMISÉE
FROM node:18-alpine
WORKDIR /app

# Installer les dépendances en premier (cache Docker)
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer un utilisateur non-root (sécurité)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001
USER backend

EXPOSE 3000
CMD ["npm", "start"]