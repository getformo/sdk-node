/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", { sourceMaps: "inline" }],
  },
  moduleNameMapper: {
    "^sdk-server-side$":
      "<rootDir>/sdks/sdk-server-side-typescript/src/index.ts",
    "^sdk-server-side/(.*)$":
      "<rootDir>/sdks/sdk-server-side-typescript/src/$1",
  },
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  modulePathIgnorePatterns: [
    "<rootDir>/sdks/sdk-server-side-typescript/ecosystem-tests/",
    "<rootDir>/sdks/sdk-server-side-typescript/dist/",
  ],
};

module.exports = config;
