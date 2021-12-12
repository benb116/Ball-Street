import Sequelize, { DataTypes, ModelDefined, Optional } from 'sequelize';
import sequelize from '../../db';
import { DefaultProtected } from '../../config';
import User from '../user/user.model';
import Contest from '../contest/contest.model';
import NFLPlayer from '../nflplayer/nflplayer.model';

export interface OfferType {
  id: string,
  isbid: boolean,
  price: number,
  protected: boolean,
  filled: boolean,
  cancelled: boolean,
  UserId: number,
  ContestId: number,
  NFLPlayerId: number,
  createdAt: string,
  updatedAt: string,
}
type OfferCreateType = Optional<OfferType, 'id' | 'protected' | 'filled' | 'cancelled' | 'createdAt' | 'updatedAt'>;

const Offer: ModelDefined<OfferType, OfferCreateType> = sequelize.define('Offer', {
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

}, {
  indexes: [
    { // Make it faster to search for offers that aren't filled or cancelled
      name: 'IX_Offer-Active',
      fields: ['id'],
      where: {
        filled: false,
        cancelled: false,
      },
    },
    { // Can only have one offer per user per contest per player that's active
      name: 'IX_Offer-OneActive',
      unique: true,
      fields: ['UserId', 'ContestId', 'NFLPlayerId'],
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
