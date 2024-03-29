/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'fs';
import path from 'path';

import sequelize from '../db';
import PopulateDB from '../db/dbpopulate';
import { client } from '../db/redis';

const initSQL = fs.readFileSync(path.resolve(__dirname, '../db/dbinit.sql'), 'utf8');

export default async () => {
  try {
    await client.FLUSHALL();
    await sequelize.query(initSQL);
    await PopulateDB();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};
