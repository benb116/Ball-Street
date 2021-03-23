const config = require('../config');
const Queue = require('bull');

const protectedQueue = new Queue('protected-queue');
const {Offer, ProtectedMatch, Trade } = require('../models');

protectedQueue.process(async (job) => {
    console.log('\r\nNew Job', job.data);
});

// Transaction
// Run through a trade sequence btwn existing and new, but roll back at last min
//     Don't select existing for update so other trans can also access
// Get all offers that would match existing
//     Sort by price then date, don't care whether they are protected
// Select one at random and try to trade
// If doesnt go through, random other
