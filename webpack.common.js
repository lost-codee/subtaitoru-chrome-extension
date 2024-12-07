const {
  CleanWebpackPlugin
} = require("clean-webpack-plugin");

const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const copyPatterns = [{ from: "public" }, { from: "manifest.json" }];

module.exports = {
  entry: {
    popup: "./src/app/popup.tsx",
    background: "./src/app/background/index.ts",
    profile: "./src/app/pages/profile.tsx",
    youtube: "./src/app/content/youtube.tsx",
    amazon: "./src/app/content/amazon.tsx",
    quiz: "./src/app/content/quiz.tsx",
    hover_translation: "./src/app/content/hover_translation.tsx",
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "babel-loader",
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
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },

  plugins: [new CopyPlugin({
    patterns: copyPatterns,
  }), new Dotenv({
    systemvars: true, // Load all system variables
    defaults: false   // Don't load .env.defaults
  }), new CleanWebpackPlugin()],
 
  devtool: "source-map"
};