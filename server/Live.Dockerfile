FROM node:alpine3.13

USER node
RUN mkdir -p /home/node/app/ && chown -R node:node /home/node
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./server/package.json ./
RUN npm install

COPY --chown=node:node ./server ./
EXPOSE 8080

CMD [ "node", "workers/live.worker.js" ]
