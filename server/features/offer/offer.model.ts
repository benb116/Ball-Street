import Sequelize, { DataTypes, Sequelize as Seq } from 'sequelize';
import { DefaultProtected } from '../../config';

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

export default function model(sequelize: Seq) {
  return sequelize.define('Offer', {
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
      references: { model: 'Users' },
      allowNull: false,
    },
    ContestId: {
      type: DataTypes.INTEGER,
      references: { model: 'Contests' },
      allowNull: false,
    },
    NFLPlayerId: {
      type: DataTypes.INTEGER,
      references: { model: 'NFLPlayers' },
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
}
