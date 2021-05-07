const Queue = require('bull');

const offerQueue = new Queue('offer-queue');
const protectedQueue = new Queue('protected-queue');

async function getOfferBacklog() {
  return Promise.all([
    offerQueue.getJobCounts(),
    protectedQueue.getJobCounts(),
  ]);
}

module.exports = getOfferBacklog;
