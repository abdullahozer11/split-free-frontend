const base = require("./jest.config");

module.exports = {
  ...base,
  testMatch: ["**/__tests__/usecase/**/*.test.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  collectCoverage: false,
};
