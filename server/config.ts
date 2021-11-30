const config = {
  CallbackURL: process.env.CALLBACK_URL,
  FlexNFLPositionId: 99,
  // How long to wait before filling a protected offer
  ProtectionDelay: 30, // seconds
  // Define the roster positions
  Roster: {
    QB1: 1,
    RB1: 2,
    RB2: 2,
    WR1: 3,
    WR2: 3,
    TE1: 4,
    FLEX1: 0,
    FLEX2: 0,
    K1: 5,
    DEF1: 6,
  },
  // Define NFL positions
  NFLPosTypes: {
    1: { name: 'QB', canflex: false },
    2: { name: 'RB', canflex: true },
    3: { name: 'WR', canflex: true },
    4: { name: 'TE', canflex: true },
    5: { name: 'K', canflex: false },
    6: { name: 'DEF', canflex: false },
  },
  // Are offers protected by default?
  DefaultProtected: false,
  // How often to refresh websocket info
  RefreshTime: 5, // seconds
  verificationTimeout: 5, // minutes
  verificationTokenLength: 128,
};

config.Roster.FLEX1 = config.FlexNFLPositionId;
config.Roster.FLEX2 = config.FlexNFLPositionId;

export default config;
