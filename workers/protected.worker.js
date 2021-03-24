const config = require('../config');
const Queue = require('bull');

const protectedQueue = new Queue('protected-queue');
const {Offer, ProtectedMatch, Trade } = require('../models');
const {fillOffers, attemptFill} = require('./trade.worker');

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

// New Job {
//   existingOffer: '0b6f156d-d5c8-4232-9406-766ca3b86e81',
//   newOffer: 'c701f5eb-7c6c-49a4-b16d-5a6382286c71'
// }

async function runProt(e, n) {
    const res = await attemptFill(e, n);
}