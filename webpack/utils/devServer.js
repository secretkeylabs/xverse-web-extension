// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.ASSET_PATH = '/';

var WebpackDevServer = require('webpack-dev-server'),
  webpack = require('webpack'),
  config = require('../webpack.config'),
  env = require('../utils/env'),
  path = require('path');

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const excludeEntriesFromHotModuleReload = ['content-script', 'inpage', 'background'];

Object.keys(config.entry).forEach(entryName => {
  if (!excludeEntriesFromHotModuleReload.includes(entryName) && config.entry) {
    config.entry[entryName] = [
      `webpack-dev-server/client?hot=true&live-reload=true&hostname=localhost&port=${env.PORT}`,
      'webpack/hot/dev-server',
    ].concat(config.entry[entryName]);
  }
});

config.plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new ReactRefreshWebpackPlugin({ overlay: false }),
].concat(config.plugins || []);

var compiler = webpack(config);

var server = new WebpackDevServer(
  {
    https: false,
    webSocketServer: 'ws',
    hot: false,
    client: false,
    host: 'localhost',
    port: env.PORT,
    static: {
      directory: path.join(__dirname, '../build'),
    },
    devMiddleware: {
      publicPath: `http://localhost:${env.PORT}/`,
      writeToDisk: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    allowedHosts: 'all',
  },
  compiler
);

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
}

(async () => {
  await server.start();
})();
