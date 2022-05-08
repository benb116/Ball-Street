# Webserver/client dockerfile
# Depending on dev vs prod, use react dev server or nginx
# Targeting based on NODE_ENV in docker compose

# dev environment
FROM node:16-alpine3.13 as development
# Non-privileged user
USER node
RUN mkdir -p /home/node/app/ && chown -R node:node /home/node
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./client/package.json ./
COPY --chown=node:node ./client/package-lock.json ./
RUN npm install

COPY --chown=node:node ./client ./
# Prevent warnings and errors from stopping server
ENV DISABLE_ESLINT_PLUGIN=true
ENV TSC_COMPILE_ON_ERROR=true
# immediately killed in production
CMD [ "npm", "start" ]

# build optimized files
FROM development as builder
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# production environment
FROM nginx:stable-alpine as production
COPY --from=builder /home/node/app/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]