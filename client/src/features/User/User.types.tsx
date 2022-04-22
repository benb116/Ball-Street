export interface AccountType {
  email: string,
  id: number,
  name: string,
  cash: number,
}
export interface LedgerEntryJoinedType {
  id: string,
  UserId: number,
  ContestId: number | null,
  value: number,
  LedgerKindId: number,
  LedgerKind: {
    id: number,
    isCredit: boolean,
    name: string,
  },
  createdAt: string,
}
export interface NewLedgerEntryType extends LedgerEntryJoinedType {
  User: {
    cash: number
  }
}
export interface SignupType {
  needsVerification: boolean
  id: number,
  email?: string,
  name?: string,
}
export interface ForgotType {
  email: string
}

export interface DepositWithdrawType {
  amount: number,
}

export interface LoginInputType {
  email: string,
  password: string,
}

export interface SignupInputType {
  name: string,
  email: string,
  password: string,
  skipVerification: boolean,
}

export interface ResetInputType {
  token: string,
  password: string,
  confirmPassword: string,
}
