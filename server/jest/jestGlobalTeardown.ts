import sequelize from '../db';
import { client, subscriber } from '../db/redis';

export default async () => {
  sequelize.close();
  await client.quit();
  await subscriber.quit();
};
