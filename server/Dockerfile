# Server Dockerfile
# Used to build all Node workers
# Different entrypoints defined in docker compose
FROM node:16-alpine3.13
RUN apk --no-cache --virtual build-dependencies add python3 make g++
# Use non-privileged user and make new folder for files
USER node 
RUN mkdir -p /home/node/app/
RUN mkdir -p /home/node/app/node_modules
RUN mkdir -p /home/node/app/logs
RUN chown -R node:node /home/node
WORKDIR /home/node/app

ENV PATH /home/node/app/node_modules/.bin:$PATH
COPY --chown=node:node ./server/package.json ./
COPY --chown=node:node ./server/package-lock.json ./
RUN npm install

COPY --chown=node:node ./server ./

RUN tsc
RUN npm prune --production

ENTRYPOINT []