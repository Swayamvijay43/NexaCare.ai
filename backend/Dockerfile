FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "run", "dev"]