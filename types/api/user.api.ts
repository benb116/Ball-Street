export const inputLogin = {
  email: 'email@email.com',
  password: 'password'
}
export type LoginInputType = typeof inputLogin;

export interface LoginOutputType {
  needsVerification: false, 
  id: number, 
  email: string, 
  name: string,
  cash: number,
}

export interface GenVerifyOutputType {
  needsVerification: true,
  id: number
}

export const inputSignup = {
  name: 'name',
  email: 'email@email.com',
  password: 'password',
  skipVerification: false as const,
}
export type SignupInputType = typeof inputSignup;

export const inputGenPassReset = {
  email: 'email@email.com'
}
export type GenPassResetInputType = typeof inputGenPassReset;

export const inputEvalPassReset = {
  token: 'tlbgbwreqlppzxdyrhrvahyitvditdtmkichbjznchpjmmbanhpozrdvoyxldjzxohtbyvgisfnrtpairqcwqwtljxeuaxgouwcyetiqwctwupidmmmfzkssfganqswi',
  password: 'password',
  confirmPassword: 'password',
}
export type EvalPassResetInputType = typeof inputEvalPassReset;
