module.exports = require('eslint-config-sukka').sukka({
  ignores: {
    customGlobs: [
      './src/sdk/**/*'
    ]
  },
  node: {
    enable: true,
    files: ['webpack.config.js']
  },
  react: true,
  ts: {
    tsconfigPath: ['./tsconfig.json', './functions/tsconfig.json']
  }
});
