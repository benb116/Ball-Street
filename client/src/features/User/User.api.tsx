import BaseAPI from '../../helpers/api';

import type {
  AccountOutputType,
  DepositWithdrawType,
  LedgerEntryJoinedKindType,
  LedgerEntryType,
} from '../../../../types/api/account.api';
import type {
  EvalPassResetInputType,
  GenPassResetInputType,
  GenVerifyOutputType,
  LoginInputType,
  LoginOutputType,
  SignupInputType,
} from '../../../../types/api/user.api';

const UserAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    signup: build.mutation<LoginOutputType | GenVerifyOutputType, SignupInputType>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
    }),
    login: build.mutation<LoginOutputType | GenVerifyOutputType, LoginInputType>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    forgot: build.mutation<void, GenPassResetInputType>({
      query: (body) => ({ url: '/auth/forgot', method: 'POST', body }),
    }),
    reset: build.mutation<void, EvalPassResetInputType>({
      query: (body) => ({ url: '/auth/resetPasswordToken', method: 'POST', body }),
    }),

    getAccount: build.query<AccountOutputType, void>({
      query: () => '/api/user/account',
      providesTags: ['Account'],
    }),
    logout: build.mutation<void, void>({ query: () => ({ url: '/api/user/logout', method: 'DELETE' }) }),
    forcelogout: build.mutation<void, void>({ query: () => ({ url: '/api/user/forcelogout', method: 'DELETE' }) }),
    deposit: build.mutation<LedgerEntryType, DepositWithdrawType>({
      query: (body) => ({ url: '/api/user/deposit', method: 'POST', body }),
      invalidatesTags: ['Account', 'Ledger'],
    }),
    withdraw: build.mutation<LedgerEntryType, DepositWithdrawType>({
      query: (body) => ({ url: '/api/user/withdraw', method: 'POST', body }),
      invalidatesTags: ['Account', 'Ledger'],
    }),
    getUserLedger: build.query<LedgerEntryJoinedKindType[], number>({
      query: (pagenum) => `/api/user/ledger/${pagenum}`,
      providesTags: ['Ledger'],
    }),
  }),
});

export const {
  useGetAccountQuery,
  useLoginMutation,
  useLogoutMutation,
  useForcelogoutMutation,
  useSignupMutation,
  useForgotMutation,
  useResetMutation,
  useDepositMutation,
  useWithdrawMutation,
  useGetUserLedgerQuery,
} = UserAPI;

export default UserAPI;
