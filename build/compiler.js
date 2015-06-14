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
  rules: {
    quotes: [2, 'single', 'avoid-escape'],
    strict: false,
    yoda: ['always']
  }
}),
    consoleError = console.error.bind(console),
    scsslint = new _NativeProcess2['default']('scss-lint'),
    webpackCache = {},
    i = 0;

var flow = new _NativeProcess2['default']('flow');

exports.flow = flow;
_Object$assign(eslint.options.baseConfig, {
  parser: 'babel-eslint',
  ecmaFeatures: { jsx: true },
  plugins: ['react']
});

function lintJS(lintPaths, callback) {
  var report = eslint.executeOnFiles(lintPaths);
  if (!report.errorCount && !report.warningCount) {
    return callback();
  }
  report.results.forEach(function (f) {
    f.messages.forEach(function (e) {
      console.log('\u001b[41mESLint error\u001b[0m "\u001b[33m%s%s\u001b[0m" in \u001b[36m%s\u001b[0m on \u001b[35m%s:%s\u001b[0m', e.message, e.ruleId ? ' (' + e.ruleId + ')' : '', f.filePath, e.line, e.column);
    });
  });
}

function uglifyJS(inPath, outPath, outFile, callback) {
  var map = '' + outPath + '.map',
      result = _uglifyJs2['default'].minify(outPath, {
    mangle: false,
    inSourceMap: map,
    outSourceMap: '' + outFile + '.map',

    output: { space_colon: false }
  });
  _zlib2['default'].gzip(result.code, function (e, code) {
    if (e) {
      return consoleError(e);
    }
    _fs2['default'].writeFile(outPath, code, function (scriptErr) {
      if (scriptErr) {
        return consoleError(scriptErr);
      }
      _fs2['default'].writeFile(map, result.map, function (mapErr) {
        if (mapErr) {
          return consoleError(mapErr);
        }
        console.log('\u001b[32m%s: Compiled %s\u001b[0m', ++i, inPath);
        callback();
      });
    });
  });
}

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
  }, function (e, stats) {
    if (e) {
      return consoleError(e);
    }
    var jsonStats = stats.toJson();
    if (0 < jsonStats.errors.length) {
      return jsonStats.errors.forEach(consoleError);
    }
    if (0 < jsonStats.warnings.length) {
      return jsonStats.warnings.forEach(consoleError);
    }
    uglifyJS(inPath, outPath, outFile, callback);
  });
}

function packageJS(inPath, outPath) {
  var callback = arguments[2] === undefined ? Function.prototype : arguments[2];

  (0, _babel.transformFile)(inPath, { loose: 'all', optional: ['runtime'], comments: false }, function (e, result) {
    if (e) {
      return consoleError(e);
    }
    _fs2['default'].writeFile(outPath, result.code, function (saveErr) {
      if (saveErr) {
        return consoleError(saveErr);
      }
      console.log('\u001b[32m%s: Compiled %s\u001b[0m', ++i, inPath);
      callback();
    });
  });
}

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
  }, function (e, result) {
    if (e) {
      return console.log('\u001b[41mSASS error\u001b[0m "\u001b[33m%s\u001b[0m" in \u001b[36m%s\u001b[0m on \u001b[35m%s:%s\u001b[0m', e.message, e.file, e.line, e.column);
    }
    callback(result);
  });
}

function autoprefixSASS(outPath, callback, result) {
  (0, _postcss2['default'])([_autoprefixerCore2['default']]).process(result.css, {
    from: outPath,
    to: outPath,
    map: { prev: result.map.toString() }
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

function minifyCSS(inPath, outPath, callback, result) {
  var sourceMappingURL = result.css.match(/\n.+$/)[0];
  result = new _cleanCss2['default']({
    keepSpecialComments: 0,
    roundingPrecision: -1,
    sourceMap: JSON.stringify(result.map),
    sourceMapInlineSources: true
  }).minify(result.css);
  _zlib2['default'].gzip(result.styles + sourceMappingURL, function (e, code) {
    if (e) {
      return consoleError(e);
    }
    _fs2['default'].writeFile(outPath, code, function (styleErr) {
      if (styleErr) {
        return consoleError(styleErr);
      }
      _fs2['default'].writeFile(outPath + '.map', result.sourceMap, function (mapErr) {
        if (mapErr) {
          return consoleError(mapErr);
        }
        console.log('\u001b[32m%s: Compiled %s\u001b[0m', ++i, inPath);
        callback();
      });
    });
  });
}

function getPathParams(inPath, outPath, callback) {
  var lintPaths = arguments[3] === undefined ? [] : arguments[3];

  var out = [];
  inPath = _fs2['default'].realpathSync(inPath);
  lintPaths = lintPaths.map(function (path) {
    return _fs2['default'].realpathSync(path);
  });
  lintPaths.push(inPath);
  try {
    outPath = _fs2['default'].realpathSync(outPath);
    out = outPath.match(/^(.*?)\/?([^\/]+)$/);
    callback(inPath, outPath, lintPaths, out[1], out[2]);
  } catch (e) {
    out = outPath.match(/^(.*?)\/?([^\/]+)$/);
    (0, _mkdirp2['default'])(out[1], function () {
      callback(inPath, outPath, lintPaths, out[1], out[2]);
    });
  }
}

function buildJS(fn, inPath, outPath) {
  var onCompile = arguments[3] === undefined ? Function.prototype : arguments[3];
  var callback = arguments[4] === undefined ? Function.prototype : arguments[4];
  var lintPaths = arguments[5] === undefined ? [] : arguments[5];

  getPathParams(inPath, outPath, function (a, b, c, outDir, outFile) {
    var func = lintJS.bind(null, c, flow.run.bind(flow, fn.bind(null, a, b, onCompile, outDir, outFile)));
    func();
    callback(func);
  }, lintPaths);
}

function webJS(inPath, outPath) {
  for (var _len = arguments.length, lintPaths = Array(_len > 4 ? _len - 4 : 0), _key = 4; _key < _len; _key++) {
    lintPaths[_key - 4] = arguments[_key];
  }

  var onCompile = arguments[2] === undefined ? Function.prototype : arguments[2];
  var callback = arguments[3] === undefined ? Function.prototype : arguments[3];

  buildJS(compileJS, inPath, outPath, onCompile, callback, lintPaths);
}

function nodeJS(inPath, outPath) {
  for (var _len2 = arguments.length, lintPaths = Array(_len2 > 4 ? _len2 - 4 : 0), _key2 = 4; _key2 < _len2; _key2++) {
    lintPaths[_key2 - 4] = arguments[_key2];
  }

  var onCompile = arguments[2] === undefined ? Function.prototype : arguments[2];
  var callback = arguments[3] === undefined ? Function.prototype : arguments[3];

  buildJS(packageJS, inPath, outPath, onCompile, callback, lintPaths);
}

function webSASS(inPath, outPath) {
  for (var _len3 = arguments.length, lintPaths = Array(_len3 > 4 ? _len3 - 4 : 0), _key3 = 4; _key3 < _len3; _key3++) {
    lintPaths[_key3 - 4] = arguments[_key3];
  }

  var onCompile = arguments[2] === undefined ? Function.prototype : arguments[2];
  var callback = arguments[3] === undefined ? Function.prototype : arguments[3];

  getPathParams(inPath, outPath, function (a, b, c) {
    var func = scsslint.run.bind(scsslint, compileSASS.bind(null, a, b, autoprefixSASS.bind(null, b, minifyCSS.bind(null, a, b, onCompile))), c);
    func();
    callback(func);
  }, lintPaths);
}