const { Sequelize, Op, Model, DataTypes } = require("sequelize");

const sequelize = new Sequelize('sqlite::memory:'); // Example for sqlite
// const sequelize = new Sequelize('postgres://localhost:5432/Ben'); // Example for postgres

const initModels = require("./models/init-models");

const models = initModels(sequelize);

(async () => await sequelize.sync({ force: true }))();