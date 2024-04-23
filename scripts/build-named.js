process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

const path = require('path');
const webpack = require('webpack');
const { makeConfig } = require('../webpack/makeConfig');

if (process.argv.length < 3) {
  console.error(`Missing wallet label(s). Usage:

    # Create a single wallet labeled "my-wallet"
    npm run build-named my-wallet

    # Create several wallets
    npm run build-named w1 w2 w3`);
  process.exit(1);
}

const labels = process.argv.slice(2);

for (const label of labels) {
  process.env.WALLET_LABEL = label;
  const buildRootPath = path.join(__dirname, '../', `prebuilt-wallets/${label}`);

  const config = makeConfig({ buildRootPath });
  config.mode = 'production'; // Is this necessary?

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
}
