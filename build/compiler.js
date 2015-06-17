/* @flow */
/** @module compiler */

'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;
exports.lintJS = lintJS;
exports.packageJS = packageJS;
exports.webJS = webJS;
exports.nodeJS = nodeJS;
exports.webSASS = webSASS;

var _eslint = require('eslint');

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _uglifyJs = require('uglify-js');

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

var _babel = require('babel');

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _nodeSassImportOnce = require('node-sass-import-once');

var _nodeSassImportOnce2 = _interopRequireDefault(_nodeSassImportOnce);

var _autoprefixerCore = require('autoprefixer-core');

var _autoprefixerCore2 = _interopRequireDefault(_autoprefixerCore);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _cleanCss = require('clean-css');

var _cleanCss2 = _interopRequireDefault(_cleanCss);

var _NativeProcess = require('./NativeProcess');

var _NativeProcess2 = _interopRequireDefault(_NativeProcess);

var eslint = new _eslint.CLIEngine({
  envs: ['node', 'browser'],
  rules: require(_path2['default'].resolve(__dirname, '..', 'conf', 'eslint.json'))
}),
    consoleError = console.error.bind(console),

/**
 * @memberOf module:compiler
 * @type {NativeProcess}
 */
flow = new _NativeProcess2['default']('flow'),
    scsslint = new _NativeProcess2['default']('scss-lint'),
    webpackCache = {},
    i = 0;

exports.flow = flow;

_Object$assign(eslint.options.baseConfig, {
  parser: 'babel-eslint',
  ecmaFeatures: { jsx: true },
  plugins: ['react']
});

/**
 * Lints JavaScript at specified paths
 *
 * @memberOf module:compiler
 * @param {Array<string>} lintPaths - an array of paths to files as well as directories for the linter to check
 * @param {Function} callback  - a callback function
 */

function lintJS(lintPaths, callback) {
  var report = eslint.executeOnFiles(lintPaths);

  if (!report.errorCount && !report.warningCount) {
    callback();
  } else {
    report.results.forEach(function loopThroughResults(f) {
      f.messages.forEach(function logEslintWarnings(e) {
        console.log('\u001b[41mESLint error\u001b[0m "\u001b[33m%s%s\u001b[0m" in \u001b[36m%s\u001b[0m on \u001b[35m%s:%s\u001b[0m', e.message, e.ruleId ? ' (' + e.ruleId + ')' : '', f.filePath, e.line, e.column);
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
function uglifyJS(inPath, outPath, outFile, callback) {
  var map = '' + outPath + '.map',
      result = _uglifyJs2['default'].minify(outPath, {
    mangle: false,
    inSourceMap: map,
    outSourceMap: '' + outFile + '.map',

    /*eslint-disable camelcase*/
    output: { space_colon: false }

    /*eslint-enable camelcase*/
  });

  _zlib2['default'].gzip(result.code, function jsGzipMinifiedHandler(e, code) {
    if (e) {
      return consoleError(e);
    }
    _fs2['default'].writeFile(outPath, code, function jsWriteCompressedScriptHandler(scriptErr) {
      if (scriptErr) {
        return consoleError(scriptErr);
      }
      _fs2['default'].writeFile(map, result.map, function jsWriteMapHandler(mapErr) {
        if (mapErr) {
          return consoleError(mapErr);
        }
        console.log('\u001b[32m%s: Compiled %s\u001b[0m', ++i, inPath);
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
function compileJS(inPath, outPath, callback, outDir, outFile) {
  (0, _webpack2['default'])({
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

function packageJS(inPath, outPath) {
  var callback = arguments[2] === undefined ? Function.prototype : arguments[2];

  (0, _babel.transformFile)(inPath, { loose: 'all', optional: ['runtime'] }, function processCompiledJS(e, result) {
    if (e) {
      return consoleError(e);
    }
    _fs2['default'].writeFile(outPath, result.code, function jsWriteScriptHandler(saveErr) {
      if (saveErr) {
        return consoleError(saveErr);
      }
      console.log('\u001b[32m%s: Compiled %s\u001b[0m', ++i, inPath);
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
function compileSASS(inPath, outPath, callback) {
  _nodeSass2['default'].render({
    file: inPath,
    importer: _nodeSassImportOnce2['default'],
    importOnce: {
      index: true,
      css: false,
      bower: false
    },
    includePaths: ['node_modules/bootstrap-sass/assets/stylesheets', 'node_modules'],
    outFile: outPath,
    precision: 8,
    sourceMap: true,
    sourceMapContents: true
  }, function processCompiledSASS(e, result) {
    if (e) {
      return console.log('\u001b[41mSASS error\u001b[0m "\u001b[33m%s\u001b[0m" in \u001b[36m%s\u001b[0m on \u001b[35m%s:%s\u001b[0m', e.message, e.file, e.line, e.column);
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
function autoprefixSASS(outPath, callback, result) {
  (0, _postcss2['default'])([_autoprefixerCore2['default']]).process(result.css, {
    from: outPath,
    to: outPath,
    map: { prev: result.map.toString() }
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
function minifyCSS(inPath, outPath, callback, result) {
  var sourceMappingURL = result.css.match(/\n.+$/)[0];

  result = new _cleanCss2['default']({
    keepSpecialComments: 0,
    roundingPrecision: -1,
    sourceMap: JSON.stringify(result.map),
    sourceMapInlineSources: true
  }).minify(result.css);
  _zlib2['default'].gzip(result.styles + sourceMappingURL, function jsGzipHandler(e, code) {
    if (e) {
      return consoleError(e);
    }
    _fs2['default'].writeFile(outPath, code, function jsWriteCompressedScriptHandler(styleErr) {
      if (styleErr) {
        return consoleError(styleErr);
      }
      _fs2['default'].writeFile(outPath + '.map', result.sourceMap, function cssWriteMapHandler(mapErr) {
        if (mapErr) {
          return consoleError(mapErr);
        }
        console.log('\u001b[32m%s: Compiled %s\u001b[0m', ++i, inPath);
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
function getPathParams(inPath, outPath, callback) {
  var lintPaths = arguments[3] === undefined ? [] : arguments[3];

  var out = [];

  inPath = _fs2['default'].realpathSync(inPath);
  lintPaths = lintPaths.map(function (p) {
    return _fs2['default'].realpathSync(p);
  });
  lintPaths.push(inPath);
  try {
    outPath = _fs2['default'].realpathSync(outPath);
    out = outPath.match(/^(.*?)\/?([^\/]+)$/);
    callback(inPath, outPath, lintPaths, out[1], out[2]);
  } catch (e) {
    out = outPath.match(/^(.*?)\/?([^\/]+)$/);
    (0, _mkdirp2['default'])(out[1], function outDirCreateHandler() {
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
function buildJS(fn, inPath, outPath) {
  var onCompile = arguments[3] === undefined ? Function.prototype : arguments[3];
  var callback = arguments[4] === undefined ? Function.prototype : arguments[4];
  var lintPaths = arguments[5] === undefined ? [] : arguments[5];

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

function webJS(inPath, outPath) {
  for (var _len = arguments.length, lintPaths = Array(_len > 4 ? _len - 4 : 0), _key = 4; _key < _len; _key++) {
    lintPaths[_key - 4] = arguments[_key];
  }

  var onCompile = arguments[2] === undefined ? Function.prototype : arguments[2];
  var callback = arguments[3] === undefined ? Function.prototype : arguments[3];

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

function nodeJS(inPath, outPath) {
  for (var _len2 = arguments.length, lintPaths = Array(_len2 > 4 ? _len2 - 4 : 0), _key2 = 4; _key2 < _len2; _key2++) {
    lintPaths[_key2 - 4] = arguments[_key2];
  }

  var onCompile = arguments[2] === undefined ? Function.prototype : arguments[2];
  var callback = arguments[3] === undefined ? Function.prototype : arguments[3];

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

function webSASS(inPath, outPath) {
  for (var _len3 = arguments.length, lintPaths = Array(_len3 > 4 ? _len3 - 4 : 0), _key3 = 4; _key3 < _len3; _key3++) {
    lintPaths[_key3 - 4] = arguments[_key3];
  }

  var onCompile = arguments[2] === undefined ? Function.prototype : arguments[2];
  var callback = arguments[3] === undefined ? Function.prototype : arguments[3];

  getPathParams(inPath, outPath, function sassParamHandler(a, b, c) {
    var func = scsslint.run.bind(scsslint, compileSASS.bind(null, a, b, autoprefixSASS.bind(null, b, minifyCSS.bind(null, a, b, onCompile))), c);

    func();
    callback(func);
  }, lintPaths);
}