import BaseAPI from '../../helpers/api';

import {
  AccountType,
  DepositWithdrawType,
  ForgotType,
  LedgerEntryJoinedType,
  LoginInputType,
  NewLedgerEntryType,
  ResetInputType,
  SignupInputType,
  SignupType,
} from './User.types';

const UserAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    getAccount: build.query<AccountType, void>({
      query: () => '/auth/account',
      providesTags: ['Account'],
    }),
    signup: build.mutation<SignupType, SignupInputType>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
    }),
    login: build.mutation<SignupType, LoginInputType>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    forgot: build.mutation<void, ForgotType>({
      query: (body) => ({ url: '/auth/forgot', method: 'POST', body }),
    }),
    reset: build.mutation<void, ResetInputType>({
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
