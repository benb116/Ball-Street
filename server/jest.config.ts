/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  globalSetup: './jest/jestGlobalSetup.js',
  globalTeardown: './jest/jestGlobalTeardown.js',
  setupFilesAfterEnv: [
    './jest/afterAll.js',
  ],
  testEnvironment: 'node',
};
