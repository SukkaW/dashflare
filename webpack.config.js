const crypto = require('crypto');
// const path = require('path');

const { DefinePlugin, ProvidePlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const topLevelFrameworkPaths = ['react', 'react-dom', 'scheduler'];
const isDevelopment = process.env.NODE_ENV !== 'production';
// const isProduction = process.env.NODE_ENV === 'production';
const isAnalyze = !!process.env.ANALYZE;
const cpuCount = require('os').cpus().length;
const context = __dirname;

/** @type {import('webpack').Configuration} */
const config = {
  mode: isDevelopment ? 'development' : 'production',
  output: {
    library: '_SKK',
    publicPath: '/', // Make it easy to configure CDN's cache-control
    filename: isDevelopment ? '_sukka/static/[name].js' : '_sukka/static/[contenthash].js',
    crossOriginLoading: 'anonymous',
    hashFunction: 'xxhash64',
    hashDigestLength: 16,
    clean: true
  },
  context,
  name: 'dashflare',
  experiments: { asyncWebAssembly: true, topLevelAwait: true, css: true },
  resolve: {
    extensions: ['.mjs', '.js', '.cjs', '.tsx', '.mts', '.ts', '.cts', '.jsx', '.json'],
    fallback: {
      https: false,
      http: false
      // crypto: require.resolve('crypto-browserify'),
      // stream: require.resolve('stream-browserify'),
    },
    plugins: [new TsconfigPathsPlugin()]
  },
  devtool: isDevelopment ? 'eval-source-map' : false,
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    compress: false,
    // static: {
    //   directory: path.join(__dirname, 'public')
    // },
    proxy: {
      '/api': {
        target: 'https://api.cloudflare.com',
        pathRewrite: { '^/api': '' },
        secure: false,
        changeOrigin: true
      }
    }
  },
  module: {
    rules: [
      {
        test: /assets\//,
        type: 'asset/resource',
        generator: {
          filename: isDevelopment ? '_sukka/static/[name][ext][query]' : '_sukka/static/[hash][ext][query]'
        }
      },
      {
        test: /\.[cm]?[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true
              },
              externalHelpers: true,
              loose: false,
              target: 'es2018',
              transform: {
                react: {
                  runtime: 'automatic',
                  refresh: isDevelopment,
                  development: isDevelopment
                },
                optimizer: {
                  simplify: true
                }
              },
              baseUrl: './',
              paths: {
                '@/*': ['src/*']
              }
            },
            env: {
              // swc-loader don't read browserslist config file, manually specify targets
              targets: 'defaults, chrome > 70, edge >= 79, firefox esr, safari >= 11, not dead, not ie > 0, not ie_mob > 0, not OperaMini all',
              mode: 'usage',
              loose: false,
              coreJs: '3.29',
              shippedProposals: false
            }
          }
        }
      }
    ]
  },
  optimization: {
    splitChunks: isDevelopment
      ? false
      : {
        cacheGroups: {
          framework: {
            chunks: 'all',
            name: 'framework',
            test(module) {
              const resource = module.nameForCondition?.();
              /* A list of packages that are used in the top level of the application. */

              return resource
                ? topLevelFrameworkPaths.some((pkgPath) => resource.startsWith(pkgPath))
                : false;
            },
            priority: 40,
            // Don't let webpack eliminate this chunk (prevents this chunk from
            // becoming a part of the commons chunk)
            enforce: true
          },
          lib: {
            test(module) {
              return (
                module.size() > 160000
                && /node_modules[/\\]/.test(module.nameForCondition() || '')
              );
            },
            name(module) {
              const hash = crypto.createHash('sha1');
              if (isModuleCSS(module)) {
                module.updateHash(hash);
              } else {
                if (!module.libIdent) {
                  throw new Error(
                    `Encountered unknown module type: ${module.type}. Please open an issue.`
                  );
                }
                hash.update(module.libIdent({ context }));
              }

              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true
          }
        },
        maxInitialRequests: 25,
        minSize: 20000
      },
    runtimeChunk: {
      name: 'webpack'
    },
    minimize: !isDevelopment,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        parallel: cpuCount,
        terserOptions: {
          compress: {
            ecma: 5,
            // The following two options are known to break valid JavaScript code
            comparisons: false,
            inline: 2 // https://github.com/vercel/next.js/issues/7178#issuecomment-493048965
          },
          mangle: { safari10: true },
          format: {
            // use ecma 2015 to enable minify like shorthand objec
            ecma: 2015,
            safari10: true,
            comments: false,
            // Fixes usage of Emoji and certain Regex
            ascii_only: true
          }
        }
      }),
      new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.lightningCssMinify
      })
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '' }
      ]
    }),
    new ProvidePlugin({
      // Polyfill for Node global "Buffer" variable
      Buffer: [require.resolve('buffer'), 'Buffer']
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new DefinePlugin({
      'process.env.NODE_DEBUG': 'undefined',
      'process.env.engine': `((ua) => (ua.includes('Chrome') || ua.includes('Chromium')
        ? 'chromium'
        : ua.includes('Firefox')
          ? 'firefox'
          : 'safari'))(navigator.userAgent)`,
      'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
      'process.browser': JSON.stringify(true),
      'global.GENTLY': JSON.stringify(false)
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
    isAnalyze && new BundleAnalyzerPlugin({
      analyzerMode: 'static'
    })
  ].filter(Boolean),
  performance: false
};

module.exports = config;

/** Utility */
function isModuleCSS(module) {
  return (
    // mini-css-extract-plugin
    module.type === 'css/mini-extract'
    // extract-css-chunks-webpack-plugin (old)
    || module.type === 'css/extract-chunks'
    // extract-css-chunks-webpack-plugin (new)
    || module.type === 'css/extract-css-chunks'
  );
}