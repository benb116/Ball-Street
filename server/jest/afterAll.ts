import sequelize from '../db';

afterAll(() => {
  sequelize.close();
});
