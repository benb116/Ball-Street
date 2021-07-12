// eslint-disable-next-line import/no-extraneous-dependencies
const createProxyMiddleware = require('http-proxy-middleware');

module.exports = function setup(app) {
  app.use(
    createProxyMiddleware(
      '/ballstreetlive', {
        target: 'ws://live:8080',
        changeOrigin: true,
        ws: true,
      },
    ),
  );
  app.use(
    '/app',
    createProxyMiddleware({
      target: 'http://api:5000',
      changeOrigin: true,
    }),
  );
};
