const { merge } = require("webpack-merge");
const path = require("path");
const base = require("./base");

module.exports = merge(base, {
  mode: "production",
  output: {
    filename: "bundle.min.js"
  },
  devtool: false,
  performance: {
    maxEntrypointSize: 1200000,
    maxAssetSize: 1200000
  },
});