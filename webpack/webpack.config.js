var webpack = require('webpack'),
  path = require('path'),
  env = require('./utils/env'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  TerserPlugin = require('terser-webpack-plugin');
var { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const ASSET_PATH = process.env.ASSET_PATH || '/';
const SRC_ROOT_PATH = path.join(__dirname, '../', 'src');
const BUILD_ROOT_PATH = path.join(__dirname, '../', 'build');

var fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];
var options = {
  mode: env.NODE_ENV || 'development',

  entry: {
    background: path.join(SRC_ROOT_PATH, 'background', 'background.ts'),
    inpage: path.join(SRC_ROOT_PATH, 'inpage', 'inpage.ts'),
    'content-script': path.join(SRC_ROOT_PATH, 'content-scripts', 'content-script.ts'),
    options: path.join(SRC_ROOT_PATH, 'pages', 'Options', 'index.jsx'),
    popup: path.join(SRC_ROOT_PATH, 'pages', 'Popup', 'index.jsx'),
  },
  output: {
    filename: '[name].js',
    path: BUILD_ROOT_PATH,
    clean: true,
    publicPath: ASSET_PATH,
  },
  module: {
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
              transpileOnly: env.NODE_ENV === 'development',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: fileExtensions
      .map((extension) => '.' + extension)
      .concat(['.js', '.jsx', '.ts', '.tsx', '.css']),
  },
  plugins: [
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
          from: path.join(SRC_ROOT_PATH, 'assets'),
          to: path.join(BUILD_ROOT_PATH, 'assets'),
        },
      ],
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
