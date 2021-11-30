const sequelize = require('../db');

afterAll(() => {
  sequelize.close();
});
