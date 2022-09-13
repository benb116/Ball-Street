export const inputLogin = {
  email: 'email@email.com',
  password: 'password'
}
export type LoginInput = typeof inputLogin;

export interface LoginOutput {
  needsVerification: false, 
  id: number, 
  email: string, 
  name: string,
  cash: number,
}

export interface GenVerifyOutput {
  needsVerification: true, 
  id: number
}

export const inputSignup = {
  name: 'name',
  email: 'email@email.com',
  password: 'password',
  skipVerification: false,
}
export type SignupInput = typeof inputSignup;

export const inputGenPassReset = {
  email: 'email@email.com'
}
export type GenPassResetInput = typeof inputGenPassReset;

export const inputEvalPassReset = {
  token: 'abc123',
  password: 'password',
  confirmPassword: 'password',
}
export type EvalPassResetInput = typeof inputEvalPassReset;
