const { Sequelize, Op, Model, DataTypes } = require("sequelize");

const sequelize = new Sequelize('sqlite::memory:'); // Example for sqlite
// const sequelize = new Sequelize('postgres://localhost:5432/Ben'); // Example for postgres

const initModels = require("./models/init-models");
const populate = require("./dbpopulate");

const models = initModels(sequelize);
populate(sequelize);
// (async () => await sequelize.sync({ force: true }))();