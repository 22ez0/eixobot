# Use a imagem Node.js base com o Node v18
FROM node:18-slim

# Defina o diretório de trabalho no servidor
WORKDIR /usr/src/app

# Copie os arquivos de configuração para instalar as dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie todo o seu código-fonte para o contêiner
COPY . .

# Comando para iniciar o bot
CMD [ "npm", "dev" ]
