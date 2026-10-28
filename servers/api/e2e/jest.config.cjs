/** @type {import('jest').Config} */
module.exports = {
  rootDir: ".",
  testMatch: ["<rootDir>/**/*-e2e.spec.ts"],
  testEnvironment: "node",
  testTimeout: 120000,
  transform: {
    "^.+\\.ts$": [
      "@swc/jest",
      { jsc: { parser: { syntax: "typescript" }, target: "es2022" }, module: { type: "commonjs" } },
    ],
  },
};
