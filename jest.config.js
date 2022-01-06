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
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      allowSyntheticDefaultImports: true,
      diagnostics: true,
      stringifyContentPathRegex: '\\.html$',
      astTransformers: [
        'jest-preset-angular/build/InlineFilesTransformer',
        'jest-preset-angular/build/StripStylesTransformer'
      ]
    }
  },
  bail: true,
  moduleNameMapper,
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  modulePaths: ['<rootDir>']
};
