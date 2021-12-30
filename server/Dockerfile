# Server Dockerfile
# Used to build all Node workers
# Different entrypoints defined in docker compose
FROM node:16-alpine3.13
RUN npm install -g nodemon typescript
# Use non-privileged user and make new folder for files
USER node 
RUN mkdir -p /home/node/app/ && chown -R node:node /home/node
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN mkdir -p /home/node/app/logs && chown -R node:node /home/node/app
WORKDIR /home/node/app

ENV PATH /home/node/app/node_modules/.bin:$PATH
COPY --chown=node:node ./server/package.json ./
COPY --chown=node:node ./server/package-lock.json ./
RUN npm install --production

COPY --chown=node:node ./server ./

RUN tsc; exit 0

ENTRYPOINT []