import Sequelize, {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';

import { DefaultProtected } from '../../config';
import sequelize from '../../db';
import Contest from '../contest/contest.model';
import NFLPlayer from '../nflplayer/nflplayer.model';
import User from '../user/user.model';

class Offer extends Model<InferAttributes<Offer>, InferCreationAttributes<Offer>> {
  declare id: CreationOptional<string>;
  declare isbid: boolean;
  declare price: number;
  declare protected: CreationOptional<boolean>;
  declare filled: CreationOptional<boolean>;
  declare cancelled: CreationOptional<boolean>;
  declare UserId: number;
  declare ContestId: number;
  declare NFLPlayerId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Offer.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  isbid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  protected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: DefaultProtected,
  },
  filled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  cancelled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  UserId: {
    type: DataTypes.INTEGER,
    references: { model: User },
    allowNull: false,
  },
  ContestId: {
    type: DataTypes.INTEGER,
    references: { model: Contest },
    allowNull: false,
  },
  NFLPlayerId: {
    type: DataTypes.INTEGER,
    references: { model: NFLPlayer },
    allowNull: false,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  indexes: [
    { // Make it faster to search for offers that aren't filled or cancelled
      name: 'IX_Offer-Active',
      fields: ['ContestId', 'UserId', 'NFLPlayerId', {
        name: 'createdAt',
        order: 'ASC',
      }],
      where: {
        filled: false,
        cancelled: false,
      },
    },
    { // Can only have one offer per user per contest per player that's active
      name: 'IX_Offer-OneActive',
      unique: true,
      fields: ['ContestId', 'UserId', 'NFLPlayerId'],
      where: {
        filled: false,
        cancelled: false,
      },
    },
  ],
});

Offer.belongsTo(User);
Offer.belongsTo(Contest);
Offer.belongsTo(NFLPlayer);

export default Offer;
