// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

var webpack = require('webpack'),
  config = require('../webpack.config');

config.mode = 'production';

webpack(config, function (err, stats) {
  if (err) throw err;
  console.log(
    stats.toString({
      preset: 'minimal',
      colors: true,
      outputPath: true,
      env: true,
    }),
  );
});
