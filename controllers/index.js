module.exports = function(sq) {
    const roster = require('./roster');
    const entry = require('./entry');
    const trade = require('./trade')(sq);
    return {
        roster,
        entry,
        trade
    };
};
