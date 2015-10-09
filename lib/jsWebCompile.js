/* @flow */

import webpack from 'webpack';
import {parse} from 'path';

const config = {
      cache: {},
      debug: true,
      devtool: '',
      entry: '',
      output: {path: '', filename: ''},
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {optional: [], loose: 'all', cacheDirectory: true}
        }]
      }
    },
    productionTransformers = ['runtime', 'minification.deadCodeElimination', 'minification.constantFolding',
      'minification.memberExpressionLiterals', 'minification.propertyLiterals', 'optimisation.react.inlineElements',
      'optimisation.react.constantElements'];

/**
 * Compiles JavaScript for the browser
 *
 * @param {string}   inPath          - a full system path to the input file
 * @param {string}   outPath         - a full system path to the output file
 * @param {Function} callback        - a callback function which accepts 1 argument: an array of error strings or null
 * @param {boolean}  [devMode=false] - if true the compilation time is greatly reduced, good for rapid development
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
export default function jsWebCompile(inPath: string, outPath: string, callback: Function, devMode: boolean = false) {
  const parsed = parse(outPath);

  config.entry = inPath;
  config.output.path = parsed.dir;
  config.output.filename = parsed.base;
  config.devtool = `${devMode ? 'eval-' : ''}source-map`;
  config.module.loaders[0].query.optional = devMode ? [] : productionTransformers;
  webpack(config, function (e, stats) {
    let jsonStats, errors;

    if (e) {
      return callback([e]);
    }
    jsonStats = stats.toJson();
    errors = jsonStats.errors.concat(jsonStats.warnings);
    callback(errors.length ? errors : null);
  });
}
