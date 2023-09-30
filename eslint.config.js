module.exports = require('eslint-config-sukka').sukka({
  node: {
    enable: true,
    files: ['webpack.config.js']
  },
  react: true,
  ts: {
    tsconfigPath: ['./tsconfig.json', './functions/tsconfig.json']
  }
});
