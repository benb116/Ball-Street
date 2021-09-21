const dict = {};

// Stat categories in the Yahoo file and their letters
dict.yahooStatMap = {
  r: 'rushing',
  w: 'receiving',
  q: 'passing',
  // z: 'defense',
  // n: 'punting',
  x: 'returning',
  k: 'kicking',
  o: 'fumbles',
  f: 'defense',
  // t: 'offense total',
};
dict.validStatLetters = Object.keys(dict.yahooStatMap);

// Dot product coefficients for stats in each category
dict.multiplierTable = {
  q: [0, 0, 0, 0.04, 4, -1],
  r: [0, 0.1, 6],
  w: [0.5, 0.1, 6],
  x: [0, 0, 6, 2],
  o: [0, -2, 6],
  k: [3, 3, 3, 4, 5, 0, 0, 0, 0, 0, 1],
  f: [0, 1, 2, 2, 6, 2, 2, 0, 6],
};

// Map between Yahoo teamIDs and BallStreet teamIDs
dict.teamIDMap = {
  27: 30,
  6: 9,
  1: 2,
  21: 24,
  23: 25,
  2: 4,
  4: 7,
  16: 18,
  8: 11,
  25: 27,
  10: 1,
  22: 31,
  11: 14,
  26: 28,
  24: 26,
  28: 32,
  20: 22,
  29: 5,
  34: 13,
  30: 15,
  5: 8,
  12: 16,
  17: 19,
  15: 17,
  9: 12,
  18: 20,
  7: 10,
  19: 21,
  3: 6,
  14: 29,
  33: 3,
  13: 23,
};

// Calculate the point total from a player's stats
dict.SumPoints = function sumpoints(pstats) {
  const categories = Object.keys(pstats);
  return categories.reduce((accPoints, curCat) => {
    let newPoints = accPoints;
    const line = pstats[curCat].split('|');
    const multipliers = (dict.multiplierTable[curCat] || []);
    // eslint-disable-next-line no-param-reassign
    newPoints += line.reduce((accStatPoints, val, lineIndex) => {
      // eslint-disable-next-line no-param-reassign
      accStatPoints += Number(val) * (multipliers[lineIndex] || 0);
      return accStatPoints;
    }, 0);
    // Defense points
    if (curCat === 'f') {
      const pointsAllowed = Number(line[0]);
      if (pointsAllowed === 0) {
        newPoints += 10;
      } else if (pointsAllowed < 7) {
        newPoints += 7;
      } else if (pointsAllowed < 14) {
        newPoints += 4;
      } else if (pointsAllowed < 21) {
        newPoints += 1;
      } else if (pointsAllowed < 28) {
        newPoints += 0;
      } else if (pointsAllowed < 35) {
        newPoints += -1;
      } else {
        newPoints += -4;
      }
    }
    return newPoints;
  }, 0);
};

// Convert a player's yahoo ID to his Ball Street database ID
dict.YahootoBSID = function yahootobsid(playerid, state) {
  return (state.IDPlayerMap[state.playerIDMap[playerid]] || dict.teamIDMap[playerid] || 0);
};

module.exports = dict;
