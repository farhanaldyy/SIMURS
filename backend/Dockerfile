FROM node:20-alpine

WORKDIR /app

# Install MariaDB client tools for native mysqldump / mariadb-dump backup capabilities
RUN apk add --no-cache mariadb-client

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=src/prisma/schema.prisma

EXPOSE 3000

CMD ["npm", "run", "dev"]
