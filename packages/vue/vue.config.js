const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  configureWebpack:
    process.env.NODE_ENV === 'production'
      ? (config) => {
          config.optimization.minimizer[0] = new TerserPlugin(terserOptions);
        }
      : {
          devtool: 'source-map',
        },
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  pwa: {
    name: 'Skuilder',
  },
};

const terserOptions = {
  terserOptions: {
    keep_classnames: true,
  },
  test: [],
  extractComments: false,
  sourceMap: true,
  cache: true,
  parallel: true,
};
