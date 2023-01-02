import BaseAPI from '../../helpers/api';

import {
  LoginInput,
  LoginOutput,
  SignupInput,
  GenPassResetInput,
  EvalPassResetInput,
  GenVerifyOutput,
} from '../../../../types/api/user.api';

import {
  AccountOutput,
  DepositWithdrawType,
  LedgerEntryJoinedType,
  NewLedgerEntryType,
} from '../../../../types/api/account.api';

const UserAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    getAccount: build.query<AccountOutput, void>({
      query: () => '/auth/account',
      providesTags: ['Account'],
    }),
    signup: build.mutation<LoginOutput | GenVerifyOutput, SignupInput>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
    }),
    login: build.mutation<LoginOutput | GenVerifyOutput, LoginInput>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    forgot: build.mutation<void, GenPassResetInput>({
      query: (body) => ({ url: '/auth/forgot', method: 'POST', body }),
    }),
    reset: build.mutation<void, EvalPassResetInput>({
      query: (body) => ({ url: '/auth/resetPasswordToken', method: 'POST', body }),
    }),

    logout: build.mutation<void, void>({ query: () => ({ url: '/api/user/logout', method: 'DELETE' }) }),
    forcelogout: build.mutation<void, void>({ query: () => ({ url: '/api/user/forcelogout', method: 'DELETE' }) }),
    deposit: build.mutation<NewLedgerEntryType, DepositWithdrawType>({
      query: (body) => ({ url: '/api/user/deposit', method: 'POST', body }),
      invalidatesTags: ['Account', 'Ledger'],
    }),
    withdraw: build.mutation<NewLedgerEntryType, DepositWithdrawType>({
      query: (body) => ({ url: '/api/user/withdraw', method: 'POST', body }),
      invalidatesTags: ['Account', 'Ledger'],
    }),
    getUserLedger: build.query<LedgerEntryJoinedType[], number>({
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
