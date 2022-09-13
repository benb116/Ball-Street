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
export interface DepositWithdrawType {
  amount: number,
}
