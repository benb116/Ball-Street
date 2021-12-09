import Sequelize, { DataTypes } from 'sequelize';
import { DefaultProtected } from '../../config';

export default function model(sequelize) {
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
    sequelize,
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
