import { client } from '.';

const passResetHash = (rand: string) => `passReset:${rand}`;

async function set(rand: string, email: string, verTimeoutSec: number) {
  return client.SET(passResetHash(rand), email, { EX: verTimeoutSec });
}

async function get(token: string) {
  return client.GET(passResetHash(token));
}

async function del(token: string) {
  return client.DEL(passResetHash(token));
}

const passReset = { get, set, del };
export default passReset;
