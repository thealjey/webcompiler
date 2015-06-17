/* @flow */
/** @module compiler */

import {CLIEngine} from 'eslint';
import webpack from 'webpack';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
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
      rules: require(path.resolve(__dirname, '..', 'conf', 'eslint.json'))
    }),
    consoleError = console.error.bind(console),

    /**
     * @memberOf module:compiler
     * @type {NativeProcess}
     */
    flow = new NativeProcess('flow'),
    scsslint = new NativeProcess('scss-lint'),
    webpackCache = {}, i = 0;

export {flow};

Object.assign(eslint.options.baseConfig, {
  parser: 'babel-eslint',
  ecmaFeatures: {jsx: true},
  plugins: ['react']
});

/**
 * Lints JavaScript at specified paths
 *
 * @memberOf module:compiler
 * @param {Array<string>} lintPaths - an array of paths to files as well as directories for the linter to check
 * @param {Function} callback  - a callback function
 */
export function lintJS(lintPaths: Array<string>, callback: Function) {
  var report = eslint.executeOnFiles(lintPaths);

  if (!report.errorCount && !report.warningCount) {
    callback();
  } else {
    report.results.forEach(function loopThroughResults(f) {
      f.messages.forEach(function logEslintWarnings(e) {
        console.log(
          '\x1b[41mESLint error\x1b[0m "\x1b[33m%s%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
          e.message, e.ruleId ? (' (' + e.ruleId + ')') : '', f.filePath, e.line, e.column);
      });
    });
  }
}

/**
 * Compresses JavaScript
 *
 * @private
 * @param {string}   inPath   - the source file path
 * @param {string}   outPath  - the path to the compiled output file
 * @param {string}   outFile  - the base name of the outPath
 * @param {Function} callback - a callback function
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

  zlib.gzip(result.code, function jsGzipMinifiedHandler(e, code) {
    if (e) {
      return consoleError(e);
    }
    fs.writeFile(outPath, code, function jsWriteCompressedScriptHandler(scriptErr) {
      if (scriptErr) {
        return consoleError(scriptErr);
      }
      fs.writeFile(map, result.map, function jsWriteMapHandler(mapErr) {
        if (mapErr) {
          return consoleError(mapErr);
        }
        console.log('\x1b[32m%s: Compiled %s\x1b[0m', ++i, inPath);
        callback();
      });
    });
  });
}

/**
 * Compiles, bundles and compresses JavaScript
 *
 * @private
 * @param {string}   inPath   - the source file path
 * @param {string}   outPath  - the path to the compiled output file
 * @param {Function} callback - a callback function
 * @param {string}   outDir   - the path to the compiled output directory
 * @param {string}   outFile  - the base name of the outPath
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
  }, function processPackagedJS(e, stats) {
    var jsonStats;

    if (e) {
      return consoleError(e);
    }
    jsonStats = stats.toJson();
    if (0 < jsonStats.errors.length) {
      return jsonStats.errors.forEach(consoleError);
    }
    if (0 < jsonStats.warnings.length) {
      return jsonStats.warnings.forEach(consoleError);
    }
    uglifyJS(inPath, outPath, outFile, callback);
  });
}

/**
 * Compiles JavaScript
 *
 * @memberOf module:compiler
 * @param {string}   inPath   - the source file path
 * @param {string}   outPath  - the path to the compiled output file
 * @param {Function} callback - a callback function
 */
export function packageJS(inPath: string, outPath: string, callback: any = Function.prototype) {
  transformFile(inPath, {loose: 'all', optional: ['runtime']}, function processCompiledJS(e, result) {
    if (e) {
      return consoleError(e);
    }
    fs.writeFile(outPath, result.code, function jsWriteScriptHandler(saveErr) {
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
 * @private
 * @param {string}   inPath   - the source file path
 * @param {string}   outPath  - the path to the compiled output file
 * @param {Function} callback - a callback function with one argument - an object with the two properties: css and map
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
  }, function processCompiledSASS(e, result) {
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
 * @private
 * @param {string}   outPath  - the path to the compiled output file
 * @param {Function} callback - a callback function with one argument - an object with the two properties: css and map
 * @param {Object}   result   - an object with the two properties: css and map
 */
function autoprefixSASS(outPath: string, callback: Function, result: Object) {
  postcss([autoprefixer]).process(result.css, {
    from: outPath,
    to: outPath,
    map: {prev: result.map.toString()}
  }).then(function processPrefixed(prefixed) {
    var warnings = prefixed.warnings();

    if (warnings.length) {
      return warnings.forEach(function logAutoprefixerWarnings(warn) {
        console.warn(warn.toString());
      });
    }
    callback(prefixed);
  });
}

/**
 * Minifies CSS
 *
 * @private
 * @param {string}   inPath   - the source file path
 * @param {string}   outPath  - the path to the compiled output file
 * @param {Function} callback - a callback function
 * @param {Object}   result   - an object with the two properties: css and map
 */
function minifyCSS(inPath: string, outPath: string, callback: Function, result: Object) {
  var sourceMappingURL = result.css.match(/\n.+$/)[0];

  result = new CleanCSS({
    keepSpecialComments: 0,
    roundingPrecision: -1,
    sourceMap: JSON.stringify(result.map),
    sourceMapInlineSources: true
  }).minify(result.css);
  zlib.gzip(result.styles + sourceMappingURL, function jsGzipHandler(e, code) {
    if (e) {
      return consoleError(e);
    }
    fs.writeFile(outPath, code, function jsWriteCompressedScriptHandler(styleErr) {
      if (styleErr) {
        return consoleError(styleErr);
      }
      fs.writeFile(outPath + '.map', result.sourceMap, function cssWriteMapHandler(mapErr) {
        if (mapErr) {
          return consoleError(mapErr);
        }
        console.log('\x1b[32m%s: Compiled %s\x1b[0m', ++i, inPath);
        callback();
      });
    });
  });
}

/**
 * Returns a complete system path for the input file, the output file, all of the paths that need to be linted and the
 * output directory and a file name
 *
 * @private
 * @param {string}   inPath           - the source file path
 * @param {string}   outPath          - the path to the compiled output file
 * @param {Function} callback         - a callback function with the following arguments: inPath, outPath, lintPaths,
 *                                      outDir and outFile
 * @param {Array<string>} [lintPaths] - an optional array of paths to files as well as directories that you want the
 *                                      linter to check (the source file being compiled is included automatically)
 */
function getPathParams(inPath: string, outPath: string, callback: Function, lintPaths: Array<string> = []) {
  var out = [];

  inPath = fs.realpathSync(inPath);
  lintPaths = lintPaths.map(p => fs.realpathSync(p));
  lintPaths.push(inPath);
  try {
    outPath = fs.realpathSync(outPath);
    out = outPath.match(/^(.*?)\/?([^\/]+)$/);
    callback(inPath, outPath, lintPaths, out[1], out[2]);
  } catch (e) {
    out = outPath.match(/^(.*?)\/?([^\/]+)$/);
    mkdirp(out[1], function outDirCreateHandler() {
      callback(inPath, outPath, lintPaths, out[1], out[2]);
    });
  }
}

/**
 * Builds a JavaScript file using the provided compiler function
 *
 * @private
 * @param {Function} fn               - the compiler function to use
 * @param {string}   inPath           - the source file path
 * @param {string}   outPath          - the path to the compiled output file
 * @param {Function} [onCompile]      - an optional function to execute after each successful compilation
 * @param {Function} [callback]       - an optional callback function that receives one argument (regardless of the
 *                                      success of the operation), - an optimized compiler function that can be used for
 *                                      continuous compilation of the same resource (a good candidate for use with a
 *                                      [watcher](https://github.com/thealjey/simple-recursive-watch))
 * @param {Array<string>} [lintPaths] - an optional array of paths to files as well as directories that you want the
 *                                      linter to check (the source file being compiled is included automatically)
 */
function buildJS(fn: Function, inPath: string, outPath: string, onCompile: any = Function.prototype,
                 callback: any = Function.prototype, lintPaths: Array<string> = []) {
  getPathParams(inPath, outPath, function jsParamHandler(a, b, c, outDir, outFile) {
    var func = lintJS.bind(null, c, flow.run.bind(flow, fn.bind(null, a, b, onCompile, outDir, outFile)));

    func();
    callback(func);
  }, lintPaths);
}

/* The following functions are recommended for the external library use */

/**
 * Lints, type-checks, compiles, packages and minifies JavaScript for the browser (production ready + Source Maps)
 *
 * @memberOf module:compiler
 * @param {string}   inPath            - the source file path
 * @param {string}   outPath           - the path to the compiled output file
 * @param {Function} [onCompile]       - an optional function to execute after each successful compilation
 * @param {Function} [callback]        - an optional callback function that receives one argument (regardless of the
 *                                       success of the operation), - an optimized compiler function that can be used
 *                                       for continuous compilation of the same resource (a good candidate for use with
 *                                       a [watcher](https://github.com/thealjey/simple-recursive-watch))
 * @param {...Array<string>} lintPaths - the rest of the arguments, if any, are the paths to files as well as
 *                                       directories that you want the linter to check (the source file being compiled
 *                                       is included automatically)
 */
export function webJS(inPath: string, outPath: string, onCompile: any = Function.prototype,
                      callback: any = Function.prototype, ...lintPaths: Array<string>) {
  buildJS(compileJS, inPath, outPath, onCompile, callback, lintPaths);
}

/**
 * Lints, type-checks and compiles JavaScript for NodeJS
 *
 * @memberOf module:compiler
 * @param {string}   inPath            - the source file path
 * @param {string}   outPath           - the path to the compiled output file
 * @param {Function} [onCompile]       - an optional function to execute after each successful compilation
 * @param {Function} [callback]        - an optional callback function that receives one argument (regardless of the
 *                                       success of the operation), - an optimized compiler function that can be used
 *                                       for continuous compilation of the same resource (a good candidate for use with
 *                                       a [watcher](https://github.com/thealjey/simple-recursive-watch))
 * @param {...Array<string>} lintPaths - the rest of the arguments, if any, are the paths to files as well as
 *                                       directories that you want the linter to check (the source file being compiled
 *                                       is included automatically)
 */
export function nodeJS(inPath: string, outPath: string, onCompile: any = Function.prototype,
                       callback: any = Function.prototype, ...lintPaths: Array<string>) {
  buildJS(packageJS, inPath, outPath, onCompile, callback, lintPaths);
}

/**
 * Lints, compiles, packages, adds vendor prefixes and minifies SASS for the browser (production ready + Source Maps)
 *
 * @memberOf module:compiler
 * @param {string}   inPath            - the source file path
 * @param {string}   outPath           - the path to the compiled output file
 * @param {Function} [onCompile]       - an optional function to execute after each successful compilation
 * @param {Function} [callback]        - an optional callback function that receives one argument (regardless of the
 *                                       success of the operation), - an optimized compiler function that can be used
 *                                       for continuous compilation of the same resource (a good candidate for use with
 *                                       a [watcher](https://github.com/thealjey/simple-recursive-watch))
 * @param {...Array<string>} lintPaths - the rest of the arguments, if any, are the paths to files as well as
 *                                       directories that you want the linter to check (the source file being compiled
 *                                       is included automatically)
 */
export function webSASS(inPath: string, outPath: string, onCompile: any = Function.prototype,
                        callback: any = Function.prototype, ...lintPaths: Array<string>) {
  getPathParams(inPath, outPath, function sassParamHandler(a, b, c) {
    var func = scsslint.run.bind(scsslint, compileSASS.bind(null, a, b, autoprefixSASS.bind(null, b,
                                 minifyCSS.bind(null, a, b, onCompile))), c);

    func();
    callback(func);
  }, lintPaths);
}
