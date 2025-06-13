# Dockerfile (in the same directory)
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
RUN npm install nodemon -g
# Copy the rest of the application code 
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]