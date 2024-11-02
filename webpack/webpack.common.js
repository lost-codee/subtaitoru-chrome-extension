const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: {
    popup: path.join(srcDir, "popup.tsx"),
    background: path.join(srcDir, "background.ts"),
    profile: path.join(srcDir, "pages/profile.tsx"),
    youtube: path.join(srcDir, "content/youtube_content_script.tsx"),
    amazon: path.join(srcDir, "content/amazon_content_script.tsx"),
    manual: path.join(srcDir, "content/manual_content_script.tsx"),
    quiz: path.join(srcDir, "content/quiz_content_script.tsx"),
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js",
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks(chunk) {
        return chunk.name !== "background";
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        include: /generated-shadow-styles\.css$/,
        use: [
          {
            loader: "raw-loader",
          },
        ],
      },
      {
        test: /\.css$/i,
        exclude: /generated-shadow-styles\.css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                ident: "postcss",
                plugins: ["tailwindcss", "autoprefixer"],
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: "../", context: "public" }],
      options: {},
    }),
    new Dotenv(),
  ],
};
