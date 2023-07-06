const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

var rpcUrlAlchemy =
  "https://polygon-mumbai.g.alchemy.com/v2/qsTcAHsFE1ZaO10FZfkCsXYdxL5cVax4";
var blockExplorer = "https://mumbai.polygonscan.com/";
var chainName = "Mumbai (Polygon) Testnet";
var networkId = "80001";

module.exports = {
  devtool: "eval-source-map",
  mode: "development",
  entry: "./src/index.js",
  devServer: {
    static: "./dist",
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Interacting with smart contract",
      template: "index.html",
    }),
  ],
  output: {
    filename: "[name].bundle.js",
    clean: true,
  },
};