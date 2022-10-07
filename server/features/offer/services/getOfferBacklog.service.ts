import Queue from 'bull';

import { queueOptions } from '@db/redis';

const offerQueue = new Queue('offer-queue', queueOptions);
const protectedQueue = new Queue('protected-queue', queueOptions);

/** How many offer jobs are still on the redis queues.
 * Not how many are on the promise queues
 */
async function getOfferBacklog() {
  return Promise.all([
    offerQueue.getJobCounts(),
    protectedQueue.getJobCounts(),
  ]);
}

export default getOfferBacklog;
