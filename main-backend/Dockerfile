FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "npm", "start" ]