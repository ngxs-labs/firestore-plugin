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
  collectCoverageFrom: ['<rootDir>/integrations/**/*.ts', '<rootDir>/packages/**/*.ts'],
  setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/.angular/'],  
  globalSetup: 'jest-preset-angular/global-setup',
  bail: true,
  moduleNameMapper,
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/', '<rootDir>/.angular/'],
  modulePaths: ['<rootDir>']
};
