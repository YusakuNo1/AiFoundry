/** @type {import('jest').Config} */
const config = {
    setupFilesAfterEnv: ['./jest.setup.js'],
    // testEnvironment: 'node',
    // testEnvironmentOptions: {
    //     "browsers": [
    //         "chrome",
    //         "firefox",
    //         "safari"
    //     ]
    // },
    verbose: true,
    collectCoverage: true,
    transformIgnorePatterns: [
        "node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)"
    ],
};
  
module.exports = config;
