FROM node:alpine3.13 AS BUILD_IMAGE

USER node
RUN mkdir -p /home/node/app/ && chown -R node:node /home/node
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./server/package.json ./
RUN npm install

COPY --chown=node:node ./server ./

FROM node:alpine3.13

USER node
RUN mkdir -p /home/node/app/ && chown -R node:node /home/node
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --from=BUILD_IMAGE /home/node/app/ ./

EXPOSE 5000

ENTRYPOINT []