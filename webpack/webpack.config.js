var webpack = require('webpack'),
  path = require('path'),
  env = require('./utils/env'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  TerserPlugin = require('terser-webpack-plugin');
var { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const aliases = {
  // alias stacks.js packages to their esm (default prefers /dist/polyfill)
  '@stacks/auth': '@stacks/auth/dist/esm',
  '@stacks/common': '@stacks/common/dist/esm',
  '@stacks/encryption': '@stacks/encryption/dist/esm',
  '@stacks/network': '@stacks/network/dist/esm',
  '@stacks/profile': '@stacks/profile/dist/esm',
  '@stacks/storage': '@stacks/storage/dist/esm',
  '@stacks/transactions': '@stacks/transactions/dist/esm',
  '@stacks/keychain': '@stacks/keychain/dist/esm',
  '@secretkeylabs/xverse-core': '@secretkeylabs/xverse-core/dist',
};
const ASSET_PATH = process.env.ASSET_PATH || '/';
const SRC_ROOT_PATH = path.join(__dirname, '../', 'src');
const BUILD_ROOT_PATH = path.join(__dirname, '../', 'build');

var fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];
var options = {
  mode: env.NODE_ENV || 'development',

  entry: {
    background: path.join(SRC_ROOT_PATH, 'background', 'background.ts'),
    inpage: path.join(SRC_ROOT_PATH, 'inpage', 'index.ts'),
    'content-script': path.join(SRC_ROOT_PATH, 'content-scripts', 'content-script.ts'),
    options: path.join(SRC_ROOT_PATH, 'pages', 'Options', 'index.tsx'),
    popup: path.join(SRC_ROOT_PATH, 'pages', 'Popup', 'index.tsx'),
  },
  output: {
    filename: '[name].js',
    path: BUILD_ROOT_PATH,
    clean: true,
    publicPath: ASSET_PATH,
  },
  module: {
    noParse: /\.wasm$/,
    rules: [
      {
        test: /\.(css)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        type: 'asset/resource',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              getCustomTransformers: () => ({
                before: [env.NODE_ENV === 'development' && ReactRefreshTypeScript()].filter(
                  Boolean
                ),
              }),
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.wasm$/,
        // Tells WebPack that this module should be included as
        // base64-encoded binary file and not as code
        loader: 'base64-loader',
        // Disables WebPack's opinion where WebAssembly should be,
        // makes it think that it's not WebAssembly
        //
        // Error: WebAssembly module is included in initial chunk.
        type: 'javascript/auto',
      },
    ],
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin({
      configFile: path.join(__dirname, '../', 'tsconfig.json')
    })],
    extensions: fileExtensions
      .map((extension) => '.' + extension)
      .concat(['.js', '.jsx', '.ts', '.tsx', '.css']),
    alias: aliases,
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      fs: false,
    },
  },
  plugins: [
    new Dotenv(),
    new CleanWebpackPlugin({ verbose: false }),
    new webpack.ProgressPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: BUILD_ROOT_PATH,
          force: true,
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              })
            );
          },
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(SRC_ROOT_PATH, 'assets/img/xverse_icon.png'),
          to: BUILD_ROOT_PATH,
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
      }],
    }),
    new HtmlWebpackPlugin({
      template: path.join(SRC_ROOT_PATH, 'pages', 'Options', 'index.html'),
      filename: 'options.html',
      chunks: ['options'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(SRC_ROOT_PATH, 'pages', 'Popup', 'index.html'),
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false,
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("../package.json").version),
    }),
  ],

  infrastructureLogging: {
    level: 'info',
  },
};
if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-source-map';
} else {
  options.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  };
}
module.exports = options;
