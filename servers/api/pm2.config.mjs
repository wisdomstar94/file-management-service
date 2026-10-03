export const apps = [
  {
    name: "@fms/api",
    script: "./dist/app.js",
    node_args: "--env-file-if-exists=../../.env.production",
    instances: Number(process.env.API_INSTANCES ?? 1),
    exec_mode: "cluster",
  },
];
