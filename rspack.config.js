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
  // rspack doesn't support ProvidePlugin, https://github.com/web-infra-dev/rspack/issues/2464
  // plugins: [
  //   new ProvidePlugin({
  //     // Polyfill for Node global "Buffer" variable
  //     Buffer: [require.resolve('buffer'), 'Buffer']
  //   })
  // ],
  optimization: {
    runtimeChunk: {
      name: 'rspack'
    },
    // One thing I don't like about rspack is that it doesn't use swc for minification. The only available minifiers are terser/esbuild.
    // minimizer: [
    //   new TerserPlugin({
    //     minify: TerserPlugin.swcMinify,
    //     parallel: cpuCount,
    //     terserOptions: {
    //       compress: {
    //         ecma: 5,
    //         // The following two options are known to break valid JavaScript code
    //         comparisons: false,
    //         inline: 2 // https://github.com/vercel/next.js/issues/7178#issuecomment-493048965
    //       },
    //       mangle: { safari10: true },
    //       format: {
    //         // use ecma 2015 to enable minify like shorthand objec
    //         ecma: 2015,
    //         safari10: true,
    //         comments: false,
    //         // Fixes usage of Emoji and certain Regex
    //         ascii_only: true
    //       }
    //     }
    //   }),
    //   new CssMinimizerPlugin({
    //     minify: CssMinimizerPlugin.lightningCssMinify
    //   })
    // ],
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
    // This replaces webpack's CopyWebpackPlugin
    copy: {
      patterns: [
        { from: 'public', to: '' }
      ]
    },
    // This replaces webpack's HtmlWebpackPlugin
    html: [{
      template: './src/index.html',
      minify: !isDevelopment
    }],
    // This replaces webpack's DefinePlugin
    define: {
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
    },
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
  },
  experiments: {
    incrementalRebuild: true,
    lazyCompilation: isDevelopment
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
