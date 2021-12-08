const sequelize = require('../db');
const { client, subscriber } = require('../db/redis');

module.exports = async () => {
  sequelize.close();
  await client.quit();
  await subscriber.quit();
};
