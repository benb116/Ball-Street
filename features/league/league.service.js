const u = require('../util/util');

const sequelize = require('../../db');
const { League, Membership, User } = require('../../models');
const { canUserSeeLeague } = require('../util/util.service');

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
      const theleague = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
      if (theleague.ispublic) { return []; }
      const queryObj = {
        where: {
          LeagueId: req.params.leagueID,
        },
        include: {
          model: User,
        },
      };
      return Membership.findAll(queryObj, u.tobj(t)).then(u.dv)
        .then((records) => records.map((r) => r.User))
        .then((users) => users.map((user) => user.name));
    });
  },

  // Make a new league
  async createLeague(req) {
    const obj = {};
    obj.adminId = req.session.user.id;
    obj.name = req.body.name;
    obj.ispublic = false;
    return sequelize.transaction(isoOption, async (t) => {
      const newleague = await League.create(obj, { transaction: t }).then(u.dv);
      await Membership.create({
        UserId: obj.adminId,
        LeagueId: newleague.id,
      }, u.tobj(t))
        .catch((err) => u.Error(err.parent.constraint, 406));
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
      }, u.tobj(t))
        .then((mem) => {
          const out = mem;
          out.name = theuser.name;
          return out;
        })
        .catch((err) => u.Error(err.parent.constraint, 406));
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
      }, u.tobj(t))
        .catch((err) => u.Error(err.parent.constraint, 406));
    });
  },
};
