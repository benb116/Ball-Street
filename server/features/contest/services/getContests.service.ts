import Contest from '../contest.model';

// Get all contests
async function getContests() {
  return Contest.findAll();
}

export default getContests;
