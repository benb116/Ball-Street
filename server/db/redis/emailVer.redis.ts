import { client } from '.';

const emailVerHash = (rand: string) => `emailVer:${rand}`;

async function set(rand: string, email: string, verTimeoutSec: number) {
  return client.SET(emailVerHash(rand), email, { EX: verTimeoutSec });
}

async function get(token: string) {
  return client.GET(emailVerHash(token));
}

async function del(token: string) {
  return client.DEL(emailVerHash(token));
}

const emailVer = { get, set, del };
export default emailVer;
