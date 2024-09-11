const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.config.common');

module.exports = {
  ...common,
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
  },
  devtool: 'source-map',
};
