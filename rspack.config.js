const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';
const context = __dirname;
const chunkName = isDevelopment ? '_sukka/static/[ext]' : '_sukka/static/[contenthash][ext]';
const topLevelFrameworkPaths = isDevelopment ? [] : getTopLevelFrameworkPaths(__dirname);

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
  optimization: {
    runtimeChunk: {
      name: 'rspack'
    },
    splitChunks: isDevelopment
      ? undefined
      : {
        cacheGroups: {
          framework: {
            chunks: 'all',
            name: 'framework',
            priority: 40,
            // test(module) {
            //   const resource = module.nameForCondition?.();
            //   /* A list of packages that are used in the top level of the application. */
            //   return resource
            //     ? topLevelFrameworkPaths.some((pkgPath) => resource.startsWith(pkgPath))
            //     : false;
            // },
            test: new RegExp(`(${topLevelFrameworkPaths.join('|')})`)
          }
        },
        minSize: 20000,
        maxInitialRequests: 25
      }
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
  /** @type {string[]} */
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
    } catch (_) {
      // don't error on failing to resolve framework packages
    }
  };

  for (const packageName of ['react', 'react-dom']) {
    addPackagePath(packageName, dir);
  }

  return topLevelFrameworkPaths;
}
