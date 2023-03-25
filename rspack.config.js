const isDevelopment = process.env.NODE_ENV !== 'production';
const path = require('path');

/** @type {import('@rspack/core').Configuration} */
const config = {
  mode: isDevelopment ? 'development' : 'production',
  output: {
    library: '_SKK',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    // Make it easy to configure CDN's cache-control
    filename: isDevelopment ? '_sukka/static/[name].js' : '_sukka/static/[name].[contenthash][ext][query]'

    /** Those webpack options are not support by rspack */
    // crossOriginLoading: 'anonymous',
    // hashFunction: 'xxhash64',
    // hashDigestLength: 16,
    // clean: true
  }
};

module.exports = config;
