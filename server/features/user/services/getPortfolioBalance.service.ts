import Joi from 'joi';

import { validate, uError } from '../../util/util';
import validators from '../../util/util.schema';
import { ServiceInput } from '../../util/util.service';
import User from '../user.model';

import type { PortfolioBalanceOutputType } from '../../../../types/api/account.api';

const schema = Joi.object<GetPortfolioBalanceInput>({
  user: validators.user,
  params: validators.noObj,
  body: validators.noObj,
});

interface GetPortfolioBalanceInput extends ServiceInput {
  params: Record<string, never>,
  body: Record<string, never>,
}

async function getPortfolioBalance(req: GetPortfolioBalanceInput): Promise<PortfolioBalanceOutputType> {
  const value = validate(req, schema);
  const theuser = await User.findByPk(value.user);
  if (!theuser) { throw uError('User not found', 404); }
  return {
    balance: theuser.cash,
    balance_dollars: (theuser.cash / 100).toFixed(2),
  };
}

export default getPortfolioBalance;
