export interface AccountType {
  email: string,
  id: number,
  name: string,
}
export interface SignupType {
  needsVerification: boolean
  id: number,
  email?: string,
  name?: string,
}
export interface ForgotType {
  resetLinkSent: string,
}
