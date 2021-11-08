# Server Dockerfile
# Used to build all Node workers
# Different entrypoints defined in docker compose
FROM node:16-alpine3.13 AS BUILD_IMAGE

# Use non-privileged user and make new folder for files
USER node 
RUN mkdir -p /home/node/app/ && chown -R node:node /home/node
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

# nodemon helps for debugging
# TODO: should we only use nodemon during dev?
RUN npm install nodemon

COPY --chown=node:node ./server/package.json ./
COPY --chown=node:node ./server/package-lock.json ./
RUN npm install
ENV PATH /home/node/app/node_modules/.bin:$PATH

# Clear extra cache files
FROM node:alpine3.13

USER node
RUN mkdir -p /home/node/app/ && chown -R node:node /home/node
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --from=BUILD_IMAGE /home/node/app/ ./

COPY --chown=node:node ./server ./

ENTRYPOINT []