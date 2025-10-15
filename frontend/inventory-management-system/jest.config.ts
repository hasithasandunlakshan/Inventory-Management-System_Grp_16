import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/?(*.)+(spec|test).(ts|tsx)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/playwrighttests/', // Exclude Playwright tests from Jest
    '/.next/',
  ],
};

export default createJestConfig(customJestConfig);
