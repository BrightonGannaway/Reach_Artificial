FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

COPY ./client ./client
COPY ./server ./server

RUN npm install \
    && npm install socket.io \
    && npm install ssh2
    

EXPOSE 8080

CMD [ "node", "server/server.js" ]