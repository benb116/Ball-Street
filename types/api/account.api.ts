export interface AccountOutputType {
  email: string,
  id: number,
  name: string,
  cash: number,
}
export interface LedgerEntryType {
  id: string,
  UserId: number,
  ContestId: number | null,
  value: number,
  LedgerKindId: number,
  createdAt: Date,
}
export interface LedgerEntryJoinedKindType extends LedgerEntryType {
  LedgerKind: {
    id: number,
    isCredit: boolean,
    name: string,
  }
}
export const DepositWithdrawInput = {
  amount: 1
}
export type DepositWithdrawType = typeof DepositWithdrawInput