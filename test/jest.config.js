export default {
	rootDir: "..",

	transform: {},

	clearMocks: true,

	collectCoverage: true,
	collectCoverageFrom: ["<rootDir>/src/**/*.js"],
	coverageDirectory: "<rootDir>/test/coverage",
	coverageProvider: "babel",

	errorOnDeprecated: true,

	testMatch: ["<rootDir>/**/*.test.js"],

	reporters: [['github-actions', { silent: false }], 'summary']
};
