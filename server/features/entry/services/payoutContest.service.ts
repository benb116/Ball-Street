import { Transaction } from 'sequelize';
import { LedgerKinds, profitFeePercentage, RosterPositions } from '../../../config';
import sequelize from '../../../db';
import Contest from '../../contest/contest.model';
import LedgerEntry from '../../ledger/ledgerEntry.model';
import User from '../../user/user.model';

import { tobj, uError } from '../../util/util';

import Entry from '../entry.model';

// Pay out prizes to all users with entries in a contest
// Take fees as defined
async function payoutContest(contestID:number) {
  return sequelize.transaction(async (t) => {
    const contestBuyIn = await Contest.findByPk(contestID).then((c) => c?.buyin);
    if (!contestBuyIn) return;

    const contestEntries = await Entry.findAll({
      where: {
        ContestId: contestID,
      },
      ...tobj(t), // Lock all entries
    });

    // Calculate sum total of points scored by all entries
    // Also confirm that no players remain to be converted to points
    const sumPoints = contestEntries.reduce((acc, cur) => {
      const isValid = RosterPositions.every((rpos) => cur[rpos] === null);
      if (!isValid) return uError(`Entry has remaining players contest:${cur.ContestId} user:${cur.UserId}`);
      return acc + cur.pointtotal;
    }, 0);

    const averagePoints = sumPoints / contestEntries.length;
    // Do all awards as one big transaction
    const payoutPromises = contestEntries.map((e) => payoutTransaction(e, t, averagePoints, contestBuyIn));
    await Promise.all(payoutPromises);
  });
}

// For a given user/entry, determine prize, adjust balance, and add ledger entries
async function payoutTransaction(entry: Entry, t: Transaction, averagePoints: number, contestBuyIn: number) {
  const entryFraction = entry.pointtotal / averagePoints;
  const grossPayout = Math.round(entryFraction * contestBuyIn);
  const profit = grossPayout - contestBuyIn;
  const theuser = await User.findOne({ where: { id: entry.UserId }, ...tobj(t) });
  if (!theuser) return uError('No user found', 404);

  theuser.cash += profit;

  const ledgerObjPrize = {
    UserId: entry.UserId,
    ContestId: null,
    LedgerKindId: LedgerKinds['Entry Prize'].id,
    value: profit,
  };

  const promises = [];
  promises.push(LedgerEntry.create(ledgerObjPrize, tobj(t)));

  // For any entry that made a profit, take a percentage fee of the profit
  const profitFee = Math.round(profit * profitFeePercentage);
  if (profitFee > 0) {
    theuser.cash -= profitFee;
    const ledgerObjFee = {
      UserId: entry.UserId,
      ContestId: null,
      LedgerKindId: LedgerKinds['Profit Fee'].id,
      value: profitFee,
    };

    promises.push(LedgerEntry.create(ledgerObjFee, tobj(t)));
  }

  promises.push(theuser.save({ transaction: t }));
  // Mark pointtotal as 0 to prevent the entry from being cashed out multiple times
  // eslint-disable-next-line no-param-reassign
  entry.pointtotal = 0;
  promises.push(entry.save({ transaction: t }));
  return Promise.all(promises);
}

export default payoutContest;
