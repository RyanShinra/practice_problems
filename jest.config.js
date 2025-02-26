module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src/', '<rootDir>/tests/'],
    testMatch: ['**/*.test.ts'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    coverageDirectory: '.coverage',
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
  };