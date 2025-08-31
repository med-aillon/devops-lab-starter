# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production || npm i --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]