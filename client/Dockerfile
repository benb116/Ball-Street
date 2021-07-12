# build environment
FROM node:alpine3.13 as development
USER node
RUN mkdir -p /home/node/app/ && chown -R node:node /home/node
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./client/package.json ./
RUN npm install --include=dev

COPY --chown=node:node ./client ./
ENV DISABLE_ESLINT_PLUGIN=true

CMD [ "npm", "start" ]

FROM development as builder

RUN npm run build

# production environment
FROM nginx:stable-alpine as production
COPY --from=builder /home/node/app/build /usr/share/nginx/html
COPY ./nginx-conf/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]