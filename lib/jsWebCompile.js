/* @flow */

import webpack from 'webpack';
import {parse} from 'path';

var config = {
      cache: {},
      debug: true,
      devtool: 'source-map',
      entry: '',
      output: {path: '', filename: ''},
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {optional: 'runtime', loose: 'all', cacheDirectory: true}
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
export default function jsWebCompile(inPath: string, outPath: string, callback: Function) {
  var parsed = parse(outPath);

  config.entry = inPath;
  config.output.path = parsed.dir;
  config.output.filename = parsed.base;
  webpack(config, function (e, stats) {
    var jsonStats, errors;

    if (e) {
      return callback([e]);
    }
    jsonStats = stats.toJson();
    errors = jsonStats.errors.concat(jsonStats.warnings);
    callback(errors.length ? errors : null);
  });
}
