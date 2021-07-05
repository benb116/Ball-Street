FROM node:alpine3.13

USER node
RUN mkdir -p /home/node/app/ && chown -R node:node /home/node
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

RUN npm install nodemon

COPY --chown=node:node ./server/package.json ./
RUN npm install


COPY --chown=node:node ./server ./
EXPOSE 5000

CMD [ "node", "app.js" ]
