module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: ["src/**/*.js"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  forceExit: true,
  testTimeout: 30000,
};
