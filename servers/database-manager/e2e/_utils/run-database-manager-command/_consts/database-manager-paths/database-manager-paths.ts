import path from "node:path";

export const PACKAGE_DIR = path.resolve(__dirname, "../../../../..");

export const TYPEORM_CLI = require.resolve("typeorm/cli.js", { paths: [PACKAGE_DIR] });
