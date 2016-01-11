var autoprefixer = require('autoprefixer');
var importer = require('node-sass-import-once');

module.exports = {
  output: {libraryTarget: 'commonjs2'},
  module: {
    loaders: [{
      test: /\.scss$/,
      loaders: ['style?singleton', 'css?modules&minimize&importLoaders=1&sourceMap', 'postcss', 'sass?sourceMap']
    }]
  },
  postcss: function () {
    return [autoprefixer];
  },
  sassLoader: {
    importer: importer,
    importOnce: {index: true, css: false, bower: false},
    includePaths: ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules'],
    precision: 8
  }
};
