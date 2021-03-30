// League service covers:
    // Getting info about a specific league
    // Getting info about a user's leagues

const { League, Membership, User } = require('../models');
const { Op } = require("sequelize");
const sequelize = require('../db');
const u = require('../util');
const isoOption = {
    // isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
};

module.exports = {
    getUserLeagues(req) {
        return Membership.findAll({
            where: {
                UserId: req.session.user.id,
            },
            include: {
                model: League,
            }
        }).then(u.dv);
    },
    getPublicLeagues() {
        return League.findAll({
            where: {
                ispublic: true 
            }
        });
    },
    getLeague(req) {
        if (!req.session.user.id) {
            return League.findOne({
                LeagueId: req.params.leagueID,
                ispublic: true,
            }).then(u.dv);

        } else {
            return Membership.findOne({
                where: {
                    LeagueId: req.params.leagueID,
                    UserId: req.session.user.id,
                },
                include: {
                    model: League,
                }
            }).then(u.dv);
        }
    },
    getLeagueUsers(req) {
        let whereObj = {
            LeagueId: req.params.leagueID
        };
        let inclObj = {
            model: League,
        };
        if (!req.session.user.id) {
            inclObj.ispublic = true;
        } else {
            whereObj.UserId = req.session.user.id;
        }
        return Membership.findOne({
            where: whereObj,
            include: inclObj,
        }).then(u.dv);
    },
    async createLeague(req) {
        let obj = {};
        obj.adminId = req.session.user.id;
        obj.name = req.body.name;
        obj.ispublic = req.body.ispublic;
        obj.budget = req.body.budget;
        return sequelize.transaction(isoOption, async (t) => {
            const newleague = await League.create(obj, {transaction: t}).then(u.dv);
            const newMember = await Membership.create({
                UserId: obj.adminId,
                LeagueId: newleague.id,
            }, {transaction: t});
            return newleague;
        });
    },
    async addMember(req) {
        return sequelize.transaction(isoOption, async (t) => {
            const admin = League.findByPk(req.body.leagueID, u.tobj(t)).then(u.dv).then(out => out.adminId);
            if (req.session.user.id !== admin) { return new Error('You are not admin, cannot add new member'); }
            return Membership.create({
                UserId: req.body.userID,
                LeagueId: req.body.leagueID,
            }, u.tobj(t));
        });
    },
    async join(req) {
        return sequelize.transaction(isoOption, async (t) => {
            const ispublic = League.findByPk(req.body.leagueID, u.tobj(t)).then(u.dv).then(out => out.ispublic);
            if (!ispublic) { return new Error('No league found'); }
            return Membership.create({
                UserId: req.body.userID,
                LeagueId: req.body.leagueID,
            }, u.tobj(t));
        });
    }
};