// League service covers:
// Getting info about a specific league
// Getting info about a user's leagues

// const { Op } = require('sequelize');
const { League, Membership, User } = require('../models');
const sequelize = require('../db');
const u = require('../util');
const { canUserSeeLeague } = require('./util.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
  // Get all leagues a user has joined
  getUserLeagues(req) {
    return Membership.findAll({
      where: { UserId: req.session.user.id },
      include: { model: League },
    }).then(u.dv).then((ships) => ships.map((m) => m.League));
  },

  // Show available public leagues
  getPublicLeagues() {
    return League.findAll({ where: { ispublic: true } }).then(u.dv).then((out) => out);
  },

  // Get specific league info
  async getLeague(req) {
    return canUserSeeLeague(0, req.session.user.id, req.params.leagueID);
  },

  // Find a league's membership list (only private leagues)
  getLeagueUsers(req) {
    return sequelize.transaction(isoOption, async (t) => {
      // Can search through memberships because we're ignoring
      // all public leagues (incl. non-joined ones)
      const theleague = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
      const includeObj = (theleague.ispublic ? {} : { model: User });
      return Membership.findAll({
        where: {
          LeagueId: req.body.leagueID,
        },
        include: includeObj,
      }, u.tobj(t));
    });
  },

  // Make a new league
  async createLeague(req) {
    const obj = {};
    obj.adminId = req.session.user.id;
    obj.name = req.body.name;
    obj.ispublic = false;
    obj.budget = req.body.budget;
    return sequelize.transaction(isoOption, async (t) => {
      const newleague = await League.create(obj, { transaction: t }).then(u.dv);
      await Membership.create({
        UserId: obj.adminId,
        LeagueId: newleague.id,
      }, u.tobj(t));
      return newleague;
    });
  },

  // Add a member to a private league
  async addMember(req) {
    return sequelize.transaction(isoOption, async (t) => {
      const theleague = await League.findByPk(req.params.leagueID, u.tobj(t)).then(u.dv);
      if (!theleague) { u.Error('No league found', 404); }

      if (req.session.user.id !== theleague.adminId) { u.Error('You are not admin, cannot add new member', 403); }

      const theuser = await User.findOne({ where: { email: req.body.email } }).then(u.dv);
      if (!theuser) { u.Error('No user found', 404); }

      return Membership.create({
        UserId: theuser.id,
        LeagueId: req.params.leagueID,
      }, u.tobj(t));
    });
  },

  // Join a public league
  async join(req) {
    return sequelize.transaction(isoOption, async (t) => {
      const theleague = League.findByPk(req.body.leagueID, u.tobj(t)).then(u.dv);
      if (!theleague.ispublic) { u.Error('No league found', 404); }
      return Membership.create({
        UserId: req.body.userID,
        LeagueId: req.body.leagueID,
      }, u.tobj(t));
    });
  },
};
