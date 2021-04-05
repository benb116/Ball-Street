// League service covers:
    // Getting info about a specific league
    // Getting info about a user's leagues

const { League, Membership, User } = require('../models');
const { Op } = require("sequelize");
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
            where: {
                UserId: req.session.user.id,
            },
            include: {
                model: League,
            }
        }).then(u.dv).then(ships => {
            return ships.map(m => m.League);
        });
    },

    // Show available public leagues
    getPublicLeagues() {
        return League.findAll({
            where: {
                ispublic: true 
            }
        }).then(u.dv).then(out => {
            return out;
        });
    },

    // Get specific league info
    async getLeague(req) {
        const errortext = 'No league found';
        const _league = await League.findOne({ LeagueId: req.params.leagueID, }).then(u.dv);
        if (!_league) { return new Error(errortext); }
        if (!req.session.user.id) {
            // If not logged in, find amongst public leagues
            if (!_league.ispublic) { return new Error(errortext); }
        } else {
            const _member = await Membership.findOne({
                where: {
                    LeagueId: req.params.leagueID,
                    UserId: req.session.user.id,
                },
                include: {
                    model: League,
                }
            });
            // If not a member, don't show
            if (!_member) { return new Error(errortext); }
        }
        return _league;
    },

    // Find a league's membership list (only private leagues)
    getLeagueUsers(req) {
        return sequelize.transaction(isoOption, async (t) => {
            // Can search through memberships because we're ignoring all public leagues (incl. non-joined ones)
            const _league = await canUserSeeLeague(t, req.session.user.id, req.params.leagueID);
            const includeObj = (_league.ispublic ? {} : { model: User });
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
        let obj = {};
        obj.adminId = req.session.user.id;
        obj.name = req.body.name;
        obj.ispublic = false;
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

    // Add a member to a private league
    async addMember(req) {
        return sequelize.transaction(isoOption, async (t) => {
            const _league = await League.findByPk(req.body.leagueID, u.tobj(t));
            if (!_league) { return new Error('No league found'); }
            if (req.session.user.id !== _league.admin) { return new Error('You are not admin, cannot add new member'); }
            return Membership.create({
                UserId: req.body.userID,
                LeagueId: req.body.leagueID,
            }, u.tobj(t));
        });
    },

    // Join a public league
    async join(req) {
        return sequelize.transaction(isoOption, async (t) => {
            const _league = League.findByPk(req.body.leagueID, u.tobj(t)).then(u.dv);
            if (!_league.ispublic) { return new Error('No league found'); }
            return Membership.create({
                UserId: req.body.userID,
                LeagueId: req.body.leagueID,
            }, u.tobj(t));
        });
    }
};