import sequelize from '../../db';
import { ServiceType, UError } from './util';

// Functions used in Jest testing
// Ensures that a service call returns an object with specific properties
export const ObjectTest = function ObjectTest(service: ServiceType, req: any, contains: any, resetQuery = '') {
  return async () => service(req).then(async (resp: any) => {
    expect(resp).toMatchObject(contains);
    if (resetQuery) await sequelize.query(resetQuery);
  });
};

// Ensures that a service call returns an array with specific elements
export const ArrayTest = function ArrayTest(service: ServiceType, req: any, items: any[]) {
  return async () => service(req).then((resp: any) => {
    if (typeof items[0] === 'object') {
      expect(resp).toMatchObject(items);
    } else {
      expect(resp).toEqual(expect.arrayContaining(items));
    }
  });
};

// Ensures that a service call throws an error with specific status number and message
export const ErrorTest = function ErrorTest(
  service: ServiceType, req: any, statusNumber: number, message: string,
) {
  return async function errortest() {
    try {
      const o = await service(req);
      // eslint-disable-next-line no-console
      console.log(o);
      throw new Error('Unexpected pass');
    } catch (err: any) {
      // eslint-disable-next-line no-console
      if (!err.status) { console.log(err); }
      const uerr: UError = err;
      expect(uerr.message).toEqual(message);
      expect(uerr.status).toEqual(statusNumber);
    }
  };
};
