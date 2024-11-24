const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const srcDir = path.join(__dirname, "..", "src");
const appDir = path.join(srcDir, "app");
const contentScriptDir = path.join(appDir, "content-scripts");

module.exports = {
  entry: {
    popup: path.join(appDir, "popup.tsx"),
    background: path.join(appDir, "background.ts"),
    profile: path.join(appDir, "pages/profile.tsx"),
    youtube: path.join(contentScriptDir, "youtube_content_script.tsx"),
    amazon: path.join(contentScriptDir, "amazon_content_script.tsx"),
    quiz: path.join(contentScriptDir, "quiz_content_script.tsx"),
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
    fallback: {
      path: require.resolve("path-browserify"),
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: "../", context: "public" }],
      options: {},
    }),
    new Dotenv(),
  ],
};
