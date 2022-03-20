import sequelize from '../db';

export default async () => {
  await sequelize.close();
};
