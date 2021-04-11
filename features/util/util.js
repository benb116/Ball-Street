let out = {};
const config = require('../../config');
const rpos = Object.keys(config.Roster);

out.dv = function(input) {
    if (input === null) { return input; }
    if (input.length) { return input.map(out.dv); }
    if (input.toJSON) { return input.toJSON(); }
    return input;
};

out.isInvalidSpot = function(playerType, rosterName) {
    const rosterType = config.Roster[rosterName];
    if (playerType === rosterType) {
        return false;
    } else if (rosterType === config.FlexNFLPositionId) {
        const playercanflex = config.NFLPosTypes[playerType].canflex;
        if (playercanflex) {
            return false;
        } else {
            return 'Trying to put a non-flex player in a flex position!';
        }
    } else {
        return 'Trying to put a player in an incorrect position!';    
    }
};

out.isPlayerOnRoster = function(entry, playerID) {
    let res = false;
    for (var i = 0; i < rpos.length; i++) {
        if (entry[rpos[i]] === playerID) {
            res = rpos[i];
            break;
        }
    }
    return res;
};

out.isOpenRoster = function(theentry, playerType) {
    for (var i = 0; i < rpos.length; i++) {
        if (theentry[rpos[i]] === null && !(out.isInvalidSpot(playerType, rpos[i]))) {
            return rpos[i];
        }
        if (i >= rpos.length - 1) {
            return false;
        }
    }
};

out.tobj = function(t) {
    return {
        transaction: t,
        lock: t.LOCK.UPDATE
    };
};

out.Error = function(msg, status=500) {
    let err = new Error(msg);
    err.status = status;
    throw err;
};

module.exports = out;