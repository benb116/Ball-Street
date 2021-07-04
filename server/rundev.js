// Run this script to launch worker processes at once

// require('./index');
require('./workers/offer.worker');
require('./workers/live.worker');
require('./workers/leader.worker');
// const { statSim } = require('./workers/stats.worker');

// statSim();
