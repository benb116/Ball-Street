import BaseAPI from '../../helpers/api';
import {
  AccountType,
  DepositWithdrawType,
  LedgerEntryJoinedType,
  NewLedgerEntryType,
} from './User.types';

import {
  LoginInput, LoginOutput, SignupInput, GenPassResetInput, EvalPassResetInput,
} from '../../../../types/api/user.api';

const UserAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    getAccount: build.query<AccountType, void>({
      query: () => '/auth/account',
      providesTags: ['Account'],
    }),
    signup: build.mutation<LoginOutput, SignupInput>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
    }),
    login: build.mutation<LoginOutput, LoginInput>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    forgot: build.mutation<void, GenPassResetInput>({
      query: (body) => ({ url: '/auth/forgot', method: 'POST', body }),
    }),
    reset: build.mutation<void, EvalPassResetInput>({
      query: (body) => ({ url: '/auth/resetPasswordToken', method: 'POST', body }),
    }),
    logout: build.mutation<void, void>({ query: () => ({ url: '/auth/logout', method: 'DELETE' }) }),
    forcelogout: build.mutation<void, void>({ query: () => ({ url: '/auth/forcelogout', method: 'DELETE' }) }),
    deposit: build.mutation<NewLedgerEntryType, DepositWithdrawType>({
      query: (body) => ({ url: '/auth/deposit', method: 'POST', body }),
      invalidatesTags: ['Account', 'Ledger'],
    }),
    withdraw: build.mutation<NewLedgerEntryType, DepositWithdrawType>({
      query: (body) => ({ url: '/auth/withdraw', method: 'POST', body }),
      invalidatesTags: ['Account', 'Ledger'],
    }),
    getUserLedger: build.query<LedgerEntryJoinedType[], number>({
      query: (pagenum) => `/auth/ledger/${pagenum}`,
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
