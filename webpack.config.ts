import path from "path";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import FaviconsWebpackPlugin from "favicons-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import TsConfigPathsWebpackPlugin from "tsconfig-paths-webpack-plugin";
import { Configuration, DefinePlugin, ProvidePlugin } from "webpack";
import { ExtensionReloader } from "webpack-ext-reloader";
import MiniCssExtractWebpackPlugin from "mini-css-extract-plugin";
import sass from "sass";
import dotenv from "dotenv";

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ExtensionReloaderWebpackPlugin: typeof ExtensionReloader = require("webpack-ext-reloader");

export default (_, env: { mode: "none" | "development" | "production" }) => {
  const { mode } = env;
  const storageInitialData = JSON.stringify(process.env.EXTENSION_STORAGE_INITIAL_DATA ?? {});

  console.log("Using storage initial data:", storageInitialData);
  return {
    target: "web",
    mode,
    stats: "errors-warnings",
    devtool: "cheap-module-source-map",
    entry: {
      background: path.join(__dirname, "src", "runtime", "background.ts"),
      "content-script": path.join(__dirname, "src", "content-script", "content-script.ts"),
      settings: path.join(__dirname, "src", "renderer", "options", "index.tsx"),
      popup: path.join(__dirname, "src", "renderer", "popup", "index.tsx")
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "js/[name].js"
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      fallback: {
        crypto: false
      },
      // alias: {
      //   "webextension-polyfill-ts": path.resolve(
      //     path.join(__dirname, "node_modules", "webextension-polyfill-ts")
      //   )
      // },
      plugins: [new TsConfigPathsWebpackPlugin()]
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractWebpackPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: {
                  localIdentName: "[name]__[local]___[hash:base64:5]"
                }
              }
            },
            {
              loader: "sass-loader",
              options: {
                implementation: sass,
                sassOptions: {
                  includePaths: []
                }
              }
            },
            "postcss-loader"
          ],
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractWebpackPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: {
                  localIdentName: "[name]__[local]___[hash:base64:5]"
                }
              }
            },
            "postcss-loader"
          ],
          exclude: /node_modules/
        },
        {
          test: /\.[tj]sx?$/,
          loader: "babel-loader",
          exclude: /node_modules/
        }
      ]
    },
    plugins: [
      new DefinePlugin({
        "process.env.EXTENSION_STORAGE_INITIAL_DATA": storageInitialData
      }),
      new ProvidePlugin({
        React: "react"
      }),
      new CleanWebpackPlugin({
        verbose: true
      }),
      new MiniCssExtractWebpackPlugin({
        filename: "css/[name].css"
      }),
      new HtmlWebpackPlugin({
        filename: "settings.html",
        template: path.join(__dirname, "public", "settings.html"),
        inject: "body",
        chunks: ["settings"],
        hash: false
      }),
      new HtmlWebpackPlugin({
        filename: "popup.html",
        template: path.join(__dirname, "public", "popup.html"),
        inject: "body",
        chunks: ["popup"],
        hash: false
      }),
      new ForkTsCheckerWebpackPlugin({
        formatter: "basic"
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, "public", "manifest.json"),
            to: path.join(__dirname, "dist"),
            transform: (content: Buffer) => {
              const manifest = JSON.parse(content.toString());
              delete manifest["$schema"];
              return JSON.stringify(manifest, null, 2);
            }
          }
        ]
      }),
      new FaviconsWebpackPlugin({
        logo: path.join(__dirname, "public", "assets", "logo.png"),
        mode: "webapp",
        favicons: {
          icons: {
            android: false,
            appleIcon: false,
            appleStartup: false,
            windows: false,
            yandex: false,
            favicons: true
          }
        }
      }),
      mode === "development"
        ? new ExtensionReloaderWebpackPlugin({
            port: 9090,
            reloadPage: true,
            manifest: path.join(__dirname, "public", "manifest.json"),
            entries: {
              background: "background",
              manifest: "manifest",
              contentScript: "content-script"
            }
          })
        : false
    ],
    externals: ["React"] // TODO: is this needed?
  } satisfies Configuration;
};
