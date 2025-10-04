# Usar Node.js 18
FROM node:18-alpine

# Criar diretório de trabalho
WORKDIR /app

# Copiar package.json
COPY backend/package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar código
COPY backend/ ./
COPY frontend/ ./frontend/
COPY database/ ./database/

# Criar diretório para banco se não existir
RUN mkdir -p ./database

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["node", "server.js"]