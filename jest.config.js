/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    'node_modules/@secretkeylabs/xverse-core/.+\\.[jt]sx?$': 'babel-jest',
    'src/.+\\.[jt]sx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(@secretkeylabs))'],
};
