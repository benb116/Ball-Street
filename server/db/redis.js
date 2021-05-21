const redis = require('redis');

const client = (function createClient() {
  return redis.createClient();
}());

const subscriber = (function createClient() {
  return redis.createClient();
}());

module.exports = {
  client,
  subscriber,
};
