'use strict';

exports.__esModule = true;
exports.JSCompiler = undefined;

var _Compiler = require('./Compiler');

var _path = require('path');

var _fs = require('fs');

var _babelCore = require('babel-core');

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _webpack = require('./webpack');

var _util = require('./util');

var _logger = require('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-sync */

const { yellow, red } = _logger.consoleStyles;

/**
 * A JavaScript compiler
 *
 * @class JSCompiler
 * @extends Compiler
 * @param {JSCompilerConfig} [options={}] - configuration object
 * @example
 * import {JSCompiler} from 'webcompiler';
 * // or - import {JSCompiler} from 'webcompiler/lib/JSCompiler';
 * // or - var JSCompiler = require('webcompiler').JSCompiler;
 * // or - var JSCompiler = require('webcompiler/lib/JSCompiler').JSCompiler;
 * import {join} from 'path';
 *
 * const srcDir = join(__dirname, 'src'),
 *   libDir = join(__dirname, 'lib');
 *
 * const compiler = new JSCompiler();
 *
 * // compile for the browser
 * compiler.fe(join(srcDir, 'script.js'), join(libDir, 'script.js'));
 *
 * // compile for Node.js
 * compiler.be(join(srcDir, 'script.js'), join(libDir, 'script.js'));
 *
 * // compile entire directories for Node.js (non-JavaScript files are simply copied over)
 * compiler.be(srcDir, libDir);
 */


class JSCompiler extends _Compiler.Compiler {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.processing = 0, _temp;
  }

  /**
   * The number of files being compiled at the moment
   *
   * @member {number} processing
   * @memberOf JSCompiler
   * @private
   * @instance
   */


  /**
   * Compiles a directory of files for the back end
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method beDir
   * @param {string}   inPath   - the input directory path
   * @param {string}   outPath  - the output directory path
   * @param {Function} callback - a callback function
   */
  beDir(inPath, outPath, callback) {
    (0, _fs.readdir)(inPath, (readdirErr, files) => {
      if (readdirErr) {
        return (0, _logger.logError)(readdirErr);
      }
      (0, _forEach2.default)(files, file => {
        this.beTraverse((0, _path.join)(inPath, file), (0, _path.join)(outPath, file), callback);
      });
    });
  }

  /**
   * Compiles a JavaScript file for the back end
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method beFile
   * @param {string}   inPath   - the input file path
   * @param {string}   outPath  - the output file path
   * @param {Function} callback - a callback function
   */
  beFile(inPath, outPath, callback) {
    ++this.processing;
    (0, _babelCore.transformFile)(inPath, _util.babelBEOptions, (transformFileErr, result) => {
      if (transformFileErr) {
        return (0, _logger.logError)(transformFileErr);
      }
      _Compiler.Compiler.fsWrite(outPath, result, callback);
    });
  }

  /**
   * Copies a file
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method copyFile
   * @param {string}   inPath   - the input file path
   * @param {string}   outPath  - the output file path
   * @param {Function} callback - a callback function
   */
  copyFile(inPath, outPath, callback) {
    ++this.processing;
    _Compiler.Compiler.mkdir(outPath, () => {
      (0, _fs.createReadStream)(inPath).pipe((0, _fs.createWriteStream)(outPath));
      callback();
    });
  }

  /**
   * Compiles a JavaScript file for the back end or recursively traverses a directory, looking for the JavaScript files
   * to compile. Non-JavaScript files are simply copied over.
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method beTraverse
   * @param {string}   inPath   - the input file/directory path
   * @param {string}   outPath  - the output file/directory path
   * @param {Function} callback - a callback function
   */
  beTraverse(inPath, outPath, callback) {
    (0, _fs.stat)(inPath, (statErr, stats) => {
      if (statErr) {
        return (0, _logger.logError)(statErr);
      }
      if (stats.isDirectory()) {
        this.beDir(inPath, outPath, callback);
      } else if ('.js' === (0, _path.extname)(inPath)) {
        this.beFile(inPath, outPath, callback);
      } else {
        this.copyFile(inPath, outPath, callback);
      }
    });
  }

  /**
   * Compiles a JavaScript file or a directory for the back end. Non-JavaScript files are simply copied over.
   *
   * If `inPath` is a directory, `outPath` has to be also.
   *
   * @memberOf JSCompiler
   * @instance
   * @method be
   * @param {string}   inPath                    - the input file/directory path
   * @param {string}   outPath                   - the output file/directory path
   * @param {Function} [callback=function () {}] - a callback function
   * @return {void}
   */
  be(inPath, outPath, callback = _noop2.default) {
    if (this.processing) {
      return (0, _logger.logError)(new Error('Still working'));
    }
    this.beTraverse(inPath, outPath, () => {
      --this.processing;
      if (!this.processing) {
        _Compiler.Compiler.done(inPath, callback);
      }
    });
  }

  /**
   * Compiles, bundles (in production mode also minifies and g-zips) a JavaScript file for the front end.
   *
   * @memberOf JSCompiler
   * @instance
   * @method fe
   * @param {string}   inPath                    - the input file path
   * @param {string}   outPath                   - the output file path
   * @param {Function} [callback=function () {}] - a callback function
   */
  fe(inPath, outPath, callback = _noop2.default) {
    const compiler = (0, _webpack.getCompiler)(inPath, outPath, this.options);

    compiler.run((err, stats) => {
      if (err) {
        return (0, _logger.logError)(err);
      }
      const { warnings, errors } = stats.toJson();

      (0, _forEach2.default)(warnings, warning => {
        (0, _logger.log)(yellow(warning));
      });
      if (errors.length) {
        (0, _forEach2.default)(errors, error => {
          (0, _logger.log)(red(error));
        });

        return;
      }
      this.save(inPath, outPath, {
        code: compiler.outputFileSystem.readFileSync(outPath, 'utf8'),
        map: _util.isProduction ? compiler.outputFileSystem.readFileSync(`${outPath}.map`, 'utf8') : ''
      }, callback);
    });
  }

}
exports.JSCompiler = JSCompiler;