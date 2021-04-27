const { Op } = require('sequelize');

const u = require('../util/util');
const config = require('../../config');

const sequelize = require('../../db');
const { Entry, User, Contest } = require('../../models');
const { canUserSeeLeague } = require('../util/util.service');

const isoOption = {
  // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
  // Show all entries in a contest
  getContestEntries(req) {
    // Only show a specific contest's data if user is in contest's league
    return sequelize.transaction(isoOption, async (t) => {
      const theleague = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
      const includeObj = (theleague.ispublic ? {} : { model: User });
      return Entry.findAll({ where: { ContestId: req.params.contestID }, includeObj });
    });
  },

  // Show a specific of the user's entries
  getEntry(req) {
    return Entry.findOne({
      where: {
        UserId: req.session.user.id,
        ContestId: req.params.contestID,
      },
    }).then(u.dv);
  },

  // Join a new contest
  async createEntry(req) {
    const obj = {};
    obj.UserId = req.session.user.id;
    obj.ContestId = req.params.contestID;
    // Only allow if user is in contest's league
    return sequelize.transaction(isoOption, async (t) => {
      await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
      const contestBudget = await Contest.findByPk(req.params.contestID).then(u.dv)
        .then((c) => c.budget);
      obj.pointtotal = contestBudget;
      return Entry.create(obj, u.tobj(t)).then(u.dv);
    })
      .catch((err) => {
        const errmess = err.parent.constraint || err[0].message;
        u.Error(errmess, 406);
      });
  },

  async reorderRoster(req) {
    return sequelize.transaction(isoOption, async (t) => {
      const postype1 = config.Roster[req.body.pos1];
      const postype2 = config.Roster[req.body.pos2];

      if (postype1 === 0 && !config.NFLPosTypes[postype2].canflex) {
        u.Error('Cannot put a non-flex player in a flex position', 406);
      } else if (postype2 === 0 && !config.NFLPosTypes[postype1].canflex) {
        u.Error('Cannot put a non-flex player in a flex position', 406);
      } else if (postype1 !== postype2) {
        u.Error('Cannot put that player in that position', 406);
      }

      await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
      const theentry = await Entry.findOne({
        where: {
          UserId: req.session.user.id,
          ContestId: req.params.contestID,
        },
      }, u.tobj(t)).then(u.dv);

      const playerIDin1 = theentry[req.body.pos1];
      const playerIDin2 = theentry[req.body.pos2];

      if (!playerIDin1 && !playerIDin2) {
        u.Error('No players found', 404);
      }

      theentry[req.body.pos1] = playerIDin2;
      theentry[req.body.pos2] = playerIDin1;

      await theentry.save({ transaction: t });
      return theentry;
    })
      .catch((err) => {
        const errmess = err.parent.constraint || err[0].message;
        u.Error(errmess, 406);
      });
  },

  // Private - get all entries across all contests for the current week
  async getWeekEntries() {
    const weekcontests = await Contest.findAll({
      where: {
        nflweek: config.currentNFLWeek,
      },
    })
      .then(u.dv)
      .then((contests) => contests.map((c) => c.id));
    return Entry.findAll({
      where: {
        ContestId: {
          [Op.or]: weekcontests,
        },
      },
      include: {
        model: User,
      },
    })
      .then(u.dv);
  },
};
