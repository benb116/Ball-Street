/* eslint-disable security/detect-non-literal-fs-filename */

import path from 'path';
import fs from 'fs';
import sequelize from '../db';
import PopulateDB from '../db/dbpopulate';
import { client } from '../db/redis';

const initSQL = fs.readFileSync(path.resolve(__dirname, '../../db/dbinit.sql'), 'utf8');

export default async () => {
  await client.FLUSHALL();
  await sequelize.query(initSQL);
  await PopulateDB();
};
