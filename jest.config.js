module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'src/data/**/*.ts',
    'src/constants/**/*.ts',
    'src/types/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/components/',
    'src/screens/',
    'src/navigation/',
    'src/hooks/',
    'src/db/',
  ],
};
