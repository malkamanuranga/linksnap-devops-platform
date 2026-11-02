FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM base AS test
RUN npm install
COPY . .
RUN npm test
