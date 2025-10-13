export default {
  jsc: {
    target: "es2022",
    parser: { syntax: "typescript", tsx: false },
    transform: {
      optimizer: {
        globals: {
          vars: {
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
          }
        }
      }
    }
  },
  module: { type: "es6" },
  sourceMaps: true,
  minify: false
};
