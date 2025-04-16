import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import RefreshPlugin from '@rspack/plugin-react-refresh';
import Dotenv from 'dotenv-webpack';
import { createRequire } from 'node:module';
import path from 'node:path';
import { TsCheckerRspackPlugin } from 'ts-checker-rspack-plugin';
const require = createRequire(import.meta.url);

const isDev = process.env.NODE_ENV === 'development';

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ['last 2 Chrome versions'];

const extensions = {
  assets: ['.eot', '.gif', '.jpeg', '.jpg', '.otf', '.png', '.svg', '.ttf', '.woff', '.woff2'],
  code: ['.js', '.jsx', '.ts', '.tsx', '.json'],
};

const outputDir = path.resolve(import.meta.dirname, 'build');

export default defineConfig({
  devServer: {
    // Pointing to a non-existent dir avoids the dev server performing a full
    // page reload when a static asset changes. rspack issues new versions of
    // static assets (e.g. `manifest.json`) through the CopyRspackPlugin even if
    // they haven't changed whenever any other file changes, which triggers
    // unwanted full page reloads. It is currently not possible to disable the
    // plugin's behavior.
    static: outputDir + '/non-existent-dir',

    devMiddleware: {
      writeToDisk: true,
    },
    host: '0.0.0.0',
    port: 3000,
    client: {
      overlay: false,
      logging: 'none',
      webSocketURL: {
        hostname: '127.0.0.1',
        port: 3000,
        pathname: '/ws',
      },
      reconnect: false,
    },
  },
  entry: {
    background: './src/background/background.ts',
    inpage: './src/inpage/index.ts',
    'content-script': './src/content-scripts/content-script.ts',
    options: './src/pages/Options/index.tsx',
    popup: './src/pages/Popup/index.tsx',
  },
  output: {
    filename: '[name].js',
    path: outputDir,
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: [...extensions.code, ...extensions.assets],

    // Necessary to support Typescript's `path` aliases.
    tsConfig: {
      configFile: path.resolve(import.meta.dirname, './tsconfig.json'),
    },

    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      fs: false,
    },
  },
  module: {
    noParse: /\.wasm$/,
    rules: [
      {
        test: new RegExp('.(' + extensions.assets.join('|') + ')$'),
        type: 'asset/resource',
        exclude: /node_modules/,
      },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: { targets },
            },
          },
        ],
      },
      {
        test: /\.wasm$/,
        // Load wasm as base64-encoded binary file.
        loader: 'base64-loader',
        // Disables WebPack's opinion where WebAssembly should be,
        // makes it think that it's not WebAssembly
        //
        // Error: WebAssembly module is included in initial chunk.
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new TsCheckerRspackPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new rspack.EnvironmentPlugin(['NODE_ENV']),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: outputDir,
          force: true,
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              }),
            );
          },
        },
      ],
    }),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: 'src/assets/img/xverse_icon.png',
          to: outputDir,
        },
      ],
    }),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
        },
      ],
    }),
    new Dotenv({ safe: true, systemvars: true }),
    new rspack.HtmlRspackPlugin({
      template: './src/pages/Options/index.html',
      filename: 'options.html',
      chunks: ['options'],
    }),
    new rspack.HtmlRspackPlugin({
      template: './src/pages/Popup/index.html',
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new rspack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new rspack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
    }),
    isDev ? new RefreshPlugin({ overlay: false }) : null,
  ].filter(Boolean),
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
  experiments: {
    css: true,
  },
});
