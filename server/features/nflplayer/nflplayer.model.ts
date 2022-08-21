// Model for an NFL Player (e.g. Tom Brady)
import {
  Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes,
} from 'sequelize';
import sequelize from '../../db';

import NFLTeam from '../nflteam/nflteam.model';
import NFLPosition from '../nflposition/nflposition.model';
import { NFLPosIDType } from '../../config';

class NFLPlayer extends Model<InferAttributes<NFLPlayer>, InferCreationAttributes<NFLPlayer>> {
  declare id: number;
  declare name: string;
  declare preprice: number | null;
  declare postprice: number | null;
  declare NFLPositionId: NFLPosIDType;
  declare NFLTeamId: number;
  declare active: boolean;
  declare injuryStatus: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

NFLPlayer.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  preprice: { // How much can someone pay to add before games start
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  postprice: { // How many points is the player worth after a game
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  NFLPositionId: { // RB, not RB2
    type: DataTypes.INTEGER,
    references: { model: NFLPosition },
    allowNull: false,
  },
  NFLTeamId: {
    type: DataTypes.INTEGER,
    references: { model: NFLTeam },
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  injuryStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
    validate: {
      isIn: [[null, 'P', 'Q', 'D', 'O']],
    },
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  indexes: [
    { // Make it faster to search for offers that aren't filled or cancelled
      name: 'IX_NFLPlayer_Active',
      fields: ['active', 'NFLTeamId'],
      where: {
        active: true,
      },
    },
  ],
});

NFLPlayer.belongsTo(NFLTeam);
NFLPlayer.belongsTo(NFLPosition);

export default NFLPlayer;
