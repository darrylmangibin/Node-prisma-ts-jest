/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
	verbose: true,
	detectOpenHandles: true,
	forceExit: true,
	setupFilesAfterEnv: ['./src/setupTest.ts'],
	moduleNameMapper: {
		'@resources/(.*)': '<rootDir>/src/resources/$1',
		'@lib/(.*)': '<rootDir>/src/lib/$1',
		'@middlewares/(.*)': '<rootDir>/src/middlewares/$1',
		'@main/(.*)': '<rootDir>/src/main/$1',
	},
};
