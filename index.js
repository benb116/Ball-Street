const { Sequelize, Op, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize('sqlite::memory:'); // Example for sqlite
// const sequelize = new Sequelize('postgres://localhost:5432/Ben'); // Example for postgres

const models = require('./models/').initModels(sequelize);

const populate = require('./db/dbpopulate');
populate(sequelize);

const controllers = require('./controllers/');

// const { NFLPosition, RosterPosition, NFLDivision, NFLTeam, NFLPlayer, Contest, User } = models;