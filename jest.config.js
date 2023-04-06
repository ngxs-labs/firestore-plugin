const path = require('path');
const { pathsToModuleNameMapper: resolver } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');
const moduleNameMapper = resolver(compilerOptions.paths, { prefix: '<rootDir>/' });

module.exports = {
  verbose: true,
  watch: false,
  cache: false,
  preset: 'jest-preset-angular',
  rootDir: path.resolve('.'),
  testMatch: ['<rootDir>/**/*.spec.ts'],
  collectCoverageFrom: ['<rootDir>/**/*.ts'],
  setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
  coverageReporters: ['json', 'lcovonly', 'lcov', 'text', 'html'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  globalSetup: 'jest-preset-angular/global-setup',
  bail: true,
  moduleNameMapper,
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  modulePaths: ['<rootDir>']
};
