const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./client/main.js",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          "css-loader"
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      API_URL_BASE: JSON.stringify(
        process.env.API_URL_BASE || "https://davidguan.app"
      ),
      S3_BUCKET_URL: JSON.stringify(
        process.env.S3_BUCKET_URL ||
          "https://voice-notes-app.s3-ap-southeast-2.amazonaws.com"
      ),
      auth0Conifg: JSON.stringify({
        domain: "davidguan.auth0.com",
        clientId: "luC7PVwEEmjBTCC3HUenRepY5U3Zgrru",
        audience: "https://davidguan.app/voice-notes-app/api"
      })
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // all options are optional
      filename: "[name].[hash].css",
      chunkFilename: "[id].css",
      ignoreOrder: false // Enable to remove warnings about conflicting order
    }),
    new HtmlWebpackPlugin({
      template: "client/index.template.html",
      filename: "../index.html"
    })
  ]
};
