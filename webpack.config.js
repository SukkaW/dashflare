'use strict';

const crypto = require('node:crypto');
const path = require('node:path');

const browserslist = require('browserslist');

const { DefinePlugin, ProvidePlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';
// const isProduction = process.env.NODE_ENV === 'production';

const topLevelFrameworkPaths = isDevelopment ? [] : getTopLevelFrameworkPaths(__dirname);
const isAnalyze = !!process.env.ANALYZE;
const cpuCount = require('node:os').cpus().length;

const context = __dirname;

const targets = browserslist.loadConfig({ path: context });

/** @type {import('webpack').Configuration} */
const config = {
  mode: isDevelopment ? 'development' : 'production',
  output: {
    library: '_SKK',
    publicPath: '/', // Make it easy to configure CDN's cache-control
    filename: isDevelopment ? '_sukka/static/[name].js' : '_sukka/static/[name]-[contenthash].js',
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
    importsFields: ['import', 'module', 'browser', 'default', 'require'],
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
    historyApiFallback: {
      disableDotRule: true
    },
    compress: false,
    static: {
      directory: path.join(__dirname, 'public')
    },
    proxy: [
      {
        context: ['/_sukka/api'],
        target: 'https://api.cloudflare.com',
        pathRewrite: { '^/_sukka/api': '' },
        secure: false,
        changeOrigin: true
      }
    ]
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
              target: undefined,
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
              baseUrl: __dirname,
              paths: {
                '@/*': ['src/*']
              }
            },
            env: {
              // swc-loader don't read browserslist config file, manually specify targets
              targets,
              mode: 'usage',
              loose: false,
              coreJs: '3.30',
              shippedProposals: false,
              exclude: ['es.error.cause']
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

              return hash.digest('hex').slice(0, 8);
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
      'global.GENTLY': JSON.stringify(false),
      'process.env.CLOUDFLARE_API_ENDPOINT': JSON.stringify(process.env.CLOUDFLARE_API_ENDPOINT || null)
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
/**
 * @param {string} module
 * @returns {boolean}
 */
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

/**
 * Packages which will be split into the 'framework' chunk.
 * Only top-level packages are included, e.g. nested copies like
 * 'node_modules/meow/node_modules/object-assign' are not included
 *
 * @param {string} dir
 * @returns {string[]}
 */
function getTopLevelFrameworkPaths(dir) {
  /** @type {Set<string>} */
  const visitedFrameworkPackages = new Set();
  const topLevelFrameworkPaths = [];

  /**
   * Adds package-paths of dependencies recursively
   *
   * @param {string} packageName
   * @param {string} relativeToPath
   * @returns {void}
   */

  // Adds package-paths of dependencies recursively
  const addPackagePath = (packageName, relativeToPath) => {
    try {
      if (visitedFrameworkPackages.has(packageName)) return;
      visitedFrameworkPackages.add(packageName);

      const packageJsonPath = require.resolve(`${packageName}/package.json`, {
        paths: [relativeToPath]
      });

      // Include a trailing slash so that a `.startsWith(packagePath)` check avoids false positives
      // when one package name starts with the full name of a different package.
      // For example:
      //   "node_modules/react-slider".startsWith("node_modules/react")  // true
      //   "node_modules/react-slider".startsWith("node_modules/react/") // false
      const directory = path.join(packageJsonPath, '../');

      // Returning from the function in case the directory has already been added and traversed
      if (topLevelFrameworkPaths.includes(directory)) return;
      topLevelFrameworkPaths.push(directory);

      const dependencies = require(packageJsonPath).dependencies || {};
      for (const name of Object.keys(dependencies)) {
        addPackagePath(name, directory);
      }
    } catch {
      // don't error on failing to resolve framework packages
    }
  };

  for (const packageName of ['react', 'react-dom']) {
    addPackagePath(packageName, dir);
  }

  return topLevelFrameworkPaths;
}
