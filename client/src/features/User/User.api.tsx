import BaseAPI from '../../helpers/api';
import {
  AccountType,
  DepositWithdrawType,
  LedgerEntryJoinedType,
  NewLedgerEntryType,
  SignupType,
} from './User.types';

const UserAPI = BaseAPI.injectEndpoints({
  endpoints: (build) => ({
    getAccount: build.query<AccountType, void>({
      query: () => '/auth/account',
      providesTags: ['Account'],
    }),
    signup: build.mutation<SignupType, { name: string, email: string, password: string, skipVerification: boolean, }>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
    }),
    login: build.mutation<SignupType, { email: string, password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    forgot: build.mutation<void, { email: string }>({
      query: (body) => ({ url: '/auth/forgot', method: 'POST', body }),
    }),
    reset: build.mutation<void, { token: string, password: string, confirmPassword: string }>({
      query: (body) => ({ url: '/auth/resetPasswordToken', method: 'POST', body }),
    }),
    logout: build.mutation<void, void>({ query: () => ({ url: '/auth/logout', method: 'DELETE' }) }),
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
  useSignupMutation,
  useForgotMutation,
  useResetMutation,
  useDepositMutation,
  useWithdrawMutation,
  useGetUserLedgerQuery,
} = UserAPI;

export default UserAPI;
