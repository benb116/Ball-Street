/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  globalSetup: './jest/jestGlobalSetup.ts',
  globalTeardown: './jest/jestGlobalTeardown.ts',
  setupFilesAfterEnv: [
    './jest/afterAll.ts',
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
