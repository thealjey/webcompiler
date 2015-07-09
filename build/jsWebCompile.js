/* @flow */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = jsWebCompile;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var config = {
  cache: {},
  debug: true,
  devtool: 'source-map',
  entry: '',
  output: { path: '', filename: '' },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: { optional: 'runtime', loose: 'all', cacheDirectory: true }
    }]
  }
};

/**
 * Compiles JavaScript for the browser
 *
 * @param {string}   inPath   - a full system path to the input file
 * @param {string}   outPath  - a full system path to the output file
 * @param {Function} callback - a callback function which accepts 1 argument: an array of error strings or null
 * @example
 * import {jsWebCompile} from 'webcompiler';
 *
 * jsWebCompile('/path/to/the/input/file.js', '/path/to/the/output/file.js', function (e) {
 *   if (e) {
 *     return e.forEach(function (err) {
 *       console.error(err);
 *     });
 *   }
 *   // successfully compiled
 * });
 */

function jsWebCompile(inPath, outPath, callback) {
  var parsed = _path2['default'].parse(outPath);

  config.entry = inPath;
  config.output.path = parsed.dir;
  config.output.filename = parsed.base;
  (0, _webpack2['default'])(config, function (e, stats) {
    var jsonStats, errors;

    if (e) {
      return callback([e]);
    }
    jsonStats = stats.toJson();
    errors = jsonStats.errors.concat(jsonStats.warnings);
    callback(errors.length ? errors : null);
  });
}

module.exports = exports['default'];