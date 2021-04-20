const config = require('../../config');
const u = require('../util/util');

const sequelize = require('../../db');
const { Contest } = require('../../models');
const { canUserSeeLeague } = require('../util/util.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
  // Get info for all contests in a specific league
  getLeagueContests(req) {
    // Requires authorization or looking at a public league
    return sequelize.transaction(isoOption, async (t) => {
      await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
      return Contest.findAll({
        where: {
          LeagueId: req.params.leagueID,
        },
      }, u.tobj(t)).then(u.dv);
    });
  },

  // Get info for a specific contest
  getContest(req) {
    // Requires authorization or looking at a public league
    return sequelize.transaction(isoOption, async (t) => {
      const theleague = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
      if (!theleague) { u.Error('No league found', 404); }
      return Contest.findByPk(req.params.contestID, u.tobj(t));
    });
  },

  // Create a new contest in a private league
  createContest(req) {
    return sequelize.transaction(isoOption, async (t) => {
      const theleague = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
      if (theleague.ispublic) { u.Error('Cannot create contests in a public league', 403); }
      if (req.session.user.id !== theleague.adminId) { u.Error('Must be league admin to make new contests', 403); }
      return Contest.create({
        name: req.body.name,
        nflweek: config.currentNFLWeek,
        LeagueId: theleague.id,
        budget: req.body.budget,
      }, u.tobj(t)).catch((err) => {
        const errmess = err.parent.constraint || err[0].message;
        u.Error(errmess, 406);
      });
    });
  },
};
