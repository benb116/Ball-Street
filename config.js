const config = {
    FlexNFLPositionId: 99,
    ProtectionDelay: 30, // seconds
    Roster: {
        'QB1': 1,
        'RB1': 2,
        'RB2': 2,
        'WR1': 3,
        'WR2': 3,
        'TE1': 4,
        'FLEX1': 0,
        'FLEX2': 0,
        'K1': 5,
        'DEF1': 6
    },
    // Define NFL positions
    NFLPosTypes: {
        '1': {name: 'QB', canflex: false},
        '2': {name: 'RB', canflex: true},
        '3': {name: 'WR', canflex: true},
        '4': {name: 'TE', canflex: true},
        '5': {name: 'K', canflex: false},
        '6': {name: 'DEF', canflex: false},
    },
    DefaultProtected: false,
};

config.Roster.FLEX1 = config.FlexNFLPositionId;
config.Roster.FLEX2 = config.FlexNFLPositionId;

module.exports = config;