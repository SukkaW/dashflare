const isDevelopment = process.env.NODE_ENV !== 'production';
const path = require('path');

const context = __dirname;

const chunkName = isDevelopment ? '_sukka/static/[name][ext]' : '_sukka/static/[contenthash][ext]';

/** @type {import('@rspack/cli').Configuration} */
const config = {
  mode: isDevelopment ? 'development' : 'production',
  output: {
    library: '_SKK',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    // Make it easy to configure CDN's cache-control
    filename: chunkName,
    chunkFilename: chunkName,
    assetModuleFilename: isDevelopment ? '_sukka/static/[name][ext][query]' : '_sukka/static/[hash][ext][query]'

    /** Those webpack options are not support by rspack */
    // crossOriginLoading: 'anonymous',
    // hashFunction: 'xxhash64',
    // hashDigestLength: 16,
    // clean: true
  },
  context,
  name: 'dashflare',
  devtool: isDevelopment ? 'eval-source-map' : false,
  /** Those webpack options are not support by rspack */
  // performance: false
  devServer: {
    port: 3000,
    historyApiFallback: true,
    compress: false,
    proxy: {
      '/_sukka/api': {
        target: 'https://api.cloudflare.com',
        pathRewrite: { '^/api': '' },
        secure: false,
        changeOrigin: true
      }
    }
  },
  resolve: {
    extensions: ['.mjs', '.js', '.cjs', '.tsx', '.mts', '.ts', '.cts', '.jsx', '.json'],
    fallback: {
      https: false,
      http: false
      // crypto: require.resolve('crypto-browserify'),
      // stream: require.resolve('stream-browserify'),
    },
    // plugins: [new TsconfigPathsPlugin()]
    // Replace webpack's TsconfigPathsPlugin with rspack's built-in option
    // This path only accept absolute path: https://github.com/web-infra-dev/rspack/issues/2312
    tsConfigPath: path.resolve(__dirname, 'tsconfig.json')
  },
  module: {
    rules: [
      {
        test: /assets\//,
        type: 'asset'
        // Replaced by rspack's output.assetModuleFilename
        // generator: {
        //   filename: isDevelopment ? '_sukka/static/[name][ext][query]' : '_sukka/static/[hash][ext][query]'
        // }
      },
      {
        test: /\.[cm]?tsx?$/,
        type: 'tsx'
      },
      {
        test: /\.[cm]?jsx?$/,
        type: 'jsx'
      }
    ]
  },
  builtins: {
    react: {
      runtime: 'automatic' // use React 17 new JSX transform
    },
    presetEnv: {
      // Rspack will try to use browserslist config on context directory when value is undefined.
      // targets: ['defaults, chrome > 70, edge >= 79, firefox esr, safari >= 11, not dead, not ie > 0, not ie_mob > 0, not OperaMini all'],
      mode: 'usage',
      // Must specify full core-js version, check swc
      coreJs: '3.29'
      // rspack doesn't support loose and shippedProposals
      // loose: false,
      // shippedProposals: false
    }
  }
};

module.exports = config;
