import { DataTypes } from 'sequelize';
import sequelize from './db';

import mcontest from './features/contest/contest.model';
import mentry from './features/entry/entry.model';
import mnflplayer from './features/nflplayer/nflplayer.model';
import mnflposition from './features/nflposition/nflposition.model';
import mnflteam from './features/nflteam/nflteam.model';
import mnflgame from './features/nflgame/nflgame.model';
import moffer from './features/offer/offer.model';
import mprotectedmatch from './features/protectedmatch/protectedmatch.model';
import mpricehistory from './features/pricehistory/pricehistory.model';
import mtrade from './features/trade/trade.model';
import muser from './features/user/user.model';

export const Contest = mcontest(sequelize, DataTypes);
export const Entry = mentry(sequelize, DataTypes);
export const NFLPlayer = mnflplayer(sequelize, DataTypes);
export const NFLPosition = mnflposition(sequelize, DataTypes);
export const NFLTeam = mnflteam(sequelize, DataTypes);
export const NFLGame = mnflgame(sequelize, DataTypes);
export const Offer = moffer(sequelize, DataTypes);
export const ProtectedMatch = mprotectedmatch(sequelize, DataTypes);
export const PriceHistory = mpricehistory(sequelize, DataTypes);
export const Trade = mtrade(sequelize, DataTypes);
export const User = muser(sequelize, DataTypes);

Contest.hasMany(Entry);
Entry.belongsTo(Contest);

User.hasMany(Entry);
Entry.belongsTo(User);

User.hasMany(Offer);
Offer.belongsTo(User);

Trade.belongsTo(Offer, { as: 'bid', foreignKey: 'bidId' });
Trade.belongsTo(Offer, { as: 'ask', foreignKey: 'askId' });

ProtectedMatch.belongsTo(Offer, { as: 'existing', foreignKey: 'existingId' });
ProtectedMatch.belongsTo(Offer, { as: 'new', foreignKey: 'newId' });

NFLPlayer.belongsTo(NFLTeam);
NFLTeam.hasMany(NFLPlayer);

NFLPlayer.belongsTo(NFLPosition);
NFLPosition.hasMany(NFLPlayer);

NFLGame.belongsTo(NFLTeam, { as: 'home', foreignKey: 'HomeId' });
NFLGame.belongsTo(NFLTeam, { as: 'away', foreignKey: 'AwayId' });

export default sequelize;
