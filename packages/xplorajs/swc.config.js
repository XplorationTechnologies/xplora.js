module.exports = {
  jsc: {
    parser: {
      syntax: "typescript",
      tsx: true,
    },
    transform: {
      react: { runtime: "automatic", refresh: true },
    },
    envs: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    },
  },
  sourceMaps: true,
  module: { type: es6 },
};
