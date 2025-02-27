# Usa la imagen oficial de Node.js
FROM node:22-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos del proyecto al contenedor
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copiar el código fuente
COPY . .

# Comando por defecto al ejecutar el contenedor
CMD ["node", "index.js"]