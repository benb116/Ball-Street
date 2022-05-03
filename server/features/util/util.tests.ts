/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model } from 'sequelize';
import sequelize from '../../db';
import { isUError } from './util';
import { ServiceType } from './util.service';

type ObjectType = Record<string, unknown>;

function dv(inp: Model | Model[] | any) {
  if (inp.length) return inp.map(dv);
  if (inp instanceof Model) return inp.toJSON();
  return inp;
}

// Functions used in Jest testing
// Ensures that a service call returns an object with specific properties
export const ObjectTest = function ObjectTest(
  service: ServiceType, req: unknown, contains: ObjectType, resetQuery = '',
) {
  return async () => service(req).then(async (resp: unknown) => {
    expect(dv(resp)).toStrictEqual(contains);
    if (resetQuery) await sequelize.query(resetQuery);
  });
};

// Ensures that a service call returns an array with specific elements
export const ArrayTest = function ArrayTest(service: ServiceType, req: unknown, items: unknown[]) {
  return async () => service(req).then((resp: unknown) => {
    if (typeof items[0] === 'object') {
      expect(dv(resp)).toStrictEqual(items);
    } else {
      expect(dv(resp)).toStrictEqual(expect.arrayContaining(items));
    }
  });
};

// Ensures that a service call throws an error with specific status number and message
export const ErrorTest = function ErrorTest(
  service: ServiceType, req: unknown, statusNumber: number, message: string,
) {
  return async function errortest() {
    try {
      const o = await service(req);
      // eslint-disable-next-line no-console
      console.log(o);
      throw new Error('Unexpected pass');
    } catch (err) {
      // eslint-disable-next-line no-console
      if (!isUError(err)) { console.log(err); return; }
      // eslint-disable-next-line no-console
      if (!err.status) { console.log(err); }
      expect(err.message).toEqual(message);
      expect(err.status).toEqual(statusNumber);
    }
  };
};

// Creates a series of test-objects for each label passed
// Each object has a promise that can be resolved or rejected
// and marked as "done"
// When the promise is res/rej, a test can be triggered
// test('Test Name', () => pMap.labelName.prom.then((data) => {});
export const TestPromiseMap = function TestPromiseMap(labelArray: string[]) {
  interface PromiseMap {
    [key: string]: {
      prom: Promise<any>
      res: (value: any) => void,
      rej: (value: any) => void,
      done: boolean
    }
  }
  return labelArray.reduce((acc, cur) => {
    let pRes: (value: any) => void = () => {};
    let pRej: (value: any) => void = () => {};
    acc[cur] = {
      prom: new Promise((res, rej) => { pRes = res; pRej = rej; }),
      res: pRes,
      rej: pRej,
      done: false,
    };
    return acc;
  }, {} as PromiseMap);
};
