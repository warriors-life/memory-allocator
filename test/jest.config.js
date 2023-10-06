export default {
	clearMocks: true,

	collectCoverage: true,
	collectCoverageFrom: ["../src/**"],
	coverageDirectory: "coverage",
	coverageProvider: "babel",

	errorOnDeprecated: true,

	testMatch: ["**/*.test.js"],

	reporters: [['github-actions', { silent: false }], 'summary']
};
