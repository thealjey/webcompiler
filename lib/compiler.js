/* @flow */

import {CLIEngine} from 'eslint';
import webpack from 'webpack';
import fs from 'fs';
import UglifyJS from 'uglify-js';
import {transformFile} from 'babel';
import mkdirp from 'mkdirp';
import sass from 'node-sass';
import importer from 'node-sass-import-once';
import autoprefixer from 'autoprefixer-core';
import postcss from 'postcss';
import CleanCSS from 'clean-css';
import NativeProcess from './NativeProcess';

var eslint = new CLIEngine({
      envs: ['node', 'browser'],
      rules: {
        quotes: [2, 'single', 'avoid-escape'],
        strict: false,
        yoda: ['always']
      }
    }),
    consoleError = console.error.bind(console),
    scsslint = new NativeProcess('scss-lint'),
    webpackCache = {}, i = 0;

export var flow = new NativeProcess('flow');

Object.assign(eslint.options.baseConfig, {
  parser: 'babel-eslint',
  ecmaFeatures: {jsx: true},
  plugins: ['react']
});

/**
 * Lints JavaScript at specified paths
 *
 * @param  {string[]} lintPaths
 * @param  {Function}      callback
 */
export function lintJS(lintPaths: Array<string>, callback: Function) {
  var report = eslint.executeOnFiles(lintPaths);
  if (!report.errorCount && !report.warningCount) {
    return callback();
  }
  report.results.forEach(function (f) {
    f.messages.forEach(function (e) {
      console.log(
        '\x1b[41mESLint error\x1b[0m "\x1b[33m%s%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
        e.message, e.ruleId ? (' (' + e.ruleId + ')') : '', f.filePath, e.line, e.column);
    });
  });
}

/**
 * Compresses JavaScript
 *
 * @param  {string}   inPath
 * @param  {string}   outPath
 * @param  {string}   outFile
 * @param  {Function} callback
 */
function uglifyJS(inPath: string, outPath: string, outFile: string, callback: Function) {
  var map = `${outPath}.map`,
      result = UglifyJS.minify(outPath, {
        mangle: false,
        inSourceMap: map,
        outSourceMap: `${outFile}.map`,
        /*eslint-disable camelcase*/
        output: {space_colon: false}
        /*eslint-enable camelcase*/
      });
  fs.writeFile(outPath, result.code, function (e) {
    if (e) {
      return consoleError(e);
    }
    fs.writeFile(map, result.map, function (mapErr) {
      if (mapErr) {
        return consoleError(mapErr);
      }
      console.log('\x1b[32m%s: Compiled %s\x1b[0m', ++i, inPath);
      callback();
    });
  });
}

/**
 * Compiles, bundles and compresses JavaScript
 *
 * @param  {string}   inPath
 * @param  {string}   outPath
 * @param  {Function} callback
 * @param  {string}   outDir
 * @param  {string}   outFile
 */
function compileJS(inPath: string, outPath: string, callback: Function, outDir: string, outFile: string) {
  webpack({
    cache: webpackCache,
    debug: true,
    devtool: 'source-map',
    entry: inPath,
    output: {
      path: outDir,
      filename: outFile
    },
    module: {
      loaders: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          optional: 'runtime',
          loose: 'all',
          cacheDirectory: true
        }
      }]
    }
  }, function (e, stats) {
    if (e) {
      return consoleError(e);
    }
    var jsonStats = stats.toJson();
    if(0 < jsonStats.errors.length) {
      return jsonStats.errors.forEach(consoleError);
    }
    if(0 < jsonStats.warnings.length) {
      return jsonStats.warnings.forEach(consoleError);
    }
    uglifyJS(inPath, outPath, outFile, callback);
  });
}

/**
 * Compiles JavaScript
 *
 * @param  {string}   inPath
 * @param  {string}   outPath
 * @param  {Function} callback
 */
export function packageJS(inPath: string, outPath: string, callback: any = Function.prototype) {
  transformFile(inPath, {loose: 'all', optional: ['runtime'], comments: false}, function (e, result) {
    if (e) {
      return consoleError(e);
    }
    fs.writeFile(outPath, result.code, function (saveErr) {
      if (saveErr) {
        return consoleError(saveErr);
      }
      console.log('\x1b[32m%s: Compiled %s\x1b[0m', ++i, inPath);
      callback();
    });
  });
}

/**
 * Compiles SASS
 *
 * @param  {string}   inPath
 * @param  {string}   outPath
 * @param  {Function} callback
 */
function compileSASS(inPath: string, outPath: string, callback: Function) {
  sass.render({
    file: inPath,
    importer,
    importOnce: {
      index: true,
      css: false,
      bower: false
    },
    includePaths: [
      'node_modules/bootstrap-sass/assets/stylesheets',
      'node_modules'
    ],
    outFile: outPath,
    precision: 8,
    sourceMap: true,
    sourceMapContents: true
  }, function (e, result) {
    if (e) {
      return console.log('\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
                         e.message, e.file, e.line, e.column);
    }
    callback(result);
  });
}

/**
 * Adds vendor prefixes to CSS
 *
 * @param  {string}   outPath
 * @param  {Function} callback
 * @param  {Object}   result
 */
function autoprefixSASS(outPath: string, callback: Function, result: Object) {
  postcss([autoprefixer]).process(result.css, {
    from: outPath,
    to: outPath,
    map: {prev: result.map.toString()}
  }).then(function (prefixed) {
    var warnings = prefixed.warnings();
    if (warnings.length) {
      return warnings.forEach(function (warn) {
        console.warn(warn.toString());
      });
    }
    callback(prefixed);
  });
}

/**
 * Minifies CSS
 *
 * @param  {string}   inPath
 * @param  {string}   outPath
 * @param  {Function} callback
 * @param  {Object}   result
 */
function minifyCSS(inPath: string, outPath: string, callback: Function, result: Object) {
  var sourceMappingURL = result.css.match(/\n.+$/)[0];
  result = new CleanCSS({
    keepSpecialComments: 0,
    roundingPrecision: -1,
    sourceMap: JSON.stringify(result.map),
    sourceMapInlineSources: true
  }).minify(result.css);
  fs.writeFile(outPath, result.styles + sourceMappingURL, function (e) {
    if (e) {
      return consoleError(e);
    }
    fs.writeFile(outPath + '.map', result.sourceMap, function (mapErr) {
      if (mapErr) {
        return consoleError(mapErr);
      }
      console.log('\x1b[32m%s: Compiled %s\x1b[0m', ++i, inPath);
      callback();
    });
  });
}

/**
 * Returns a complete system path for the input file, the output file, all of the paths that need to be linted and the
 * output directory and a file name
 *
 * @param  {string}   inPath
 * @param  {string}   outPath
 * @param  {Function} callback
 * @param  {string[]} [lintPaths]
 */
function getPathParams(inPath: string, outPath: string, callback: Function, lintPaths: Array<string> = []) {
  var out = [];
  inPath = fs.realpathSync(inPath);
  lintPaths = lintPaths.map(function (path) { return fs.realpathSync(path); });
  lintPaths.push(inPath);
  try {
    outPath = fs.realpathSync(outPath);
    out = outPath.match(/^(.*?)\/?([^\/]+)$/);
    callback(inPath, outPath, lintPaths, out[1], out[2]);
  } catch (e) {
    out = outPath.match(/^(.*?)\/?([^\/]+)$/);
    mkdirp(out[1], function () {
      callback(inPath, outPath, lintPaths, out[1], out[2]);
    });
  }
}

/**
 * Builds a JavaScript file using the provided compiler function
 *
 * @param  {Function} fn
 * @param  {string}   inPath
 * @param  {string}   outPath
 * @param  {Function} [onCompile]
 * @param  {Function} [callback]
 * @param  {string[]} [lintPaths]
 */
function buildJS(fn: Function, inPath: string, outPath: string, onCompile: any = Function.prototype,
                 callback: any = Function.prototype, lintPaths: Array<string> = []) {
  getPathParams(inPath, outPath, function (a, b, c, outDir, outFile) {
    var func = lintJS.bind(null, c, flow.run.bind(flow, fn.bind(null, a, b, onCompile, outDir, outFile)));
    func();
    callback(func);
  }, lintPaths);
}

/* The following functions are recommended for the external library use */

/**
 * Lints, type-checks, compiles, packages and minifies JavaScript for the browser (production ready + Source Maps)
 *
 * @param  {string}   inPath
 * @param  {string}   outPath
 * @param  {Function} [onCompile]
 * @param  {Function} [callback]
 * @param  {string[]} [lintPaths]
 */
export function webJS(inPath: string, outPath: string, onCompile: any = Function.prototype,
                      callback: any = Function.prototype, lintPaths: Array<string> = []) {
  buildJS(compileJS, inPath, outPath, onCompile, callback, lintPaths);
}

/**
 * Lints, type-checks and compiles JavaScript for NodeJS
 *
 * @param  {string}   inPath
 * @param  {string}   outPath
 * @param  {Function} [onCompile]
 * @param  {Function} [callback]
 * @param  {string[]} [lintPaths]
 */
export function nodeJS(inPath: string, outPath: string, onCompile: any = Function.prototype,
                       callback: any = Function.prototype, lintPaths: Array<string> = []) {
  buildJS(packageJS, inPath, outPath, onCompile, callback, lintPaths);
}

/**
 * Lints, compiles, packages, adds vendor prefixes and minifies SASS for the browser (production ready + Source Maps)
 *
 * @param  {string}   inPath
 * @param  {string}   outPath
 * @param  {Function} [onCompile]
 * @param  {Function} [callback]
 * @param  {string[]} [lintPaths]
 */
export function webSASS(inPath: string, outPath: string, onCompile: any = Function.prototype,
                        callback: any = Function.prototype, lintPaths: Array<string> = []) {
  getPathParams(inPath, outPath, function (a, b, c) {
    var func = scsslint.run.bind(scsslint, compileSASS.bind(null, a, b, autoprefixSASS.bind(null, b,
                                 minifyCSS.bind(null, a, b, onCompile))), c);
    func();
    callback(func);
  }, lintPaths);
}
