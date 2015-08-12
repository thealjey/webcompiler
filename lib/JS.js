/* @flow */

import NativeProcess from './NativeProcess';
import JSLint from './JSLint';
import jsWebCompile from './jsWebCompile';
import jsNodeCompileFile from './jsNodeCompileFile';
import jsNodeCompileDir from './jsNodeCompileDir';
import jsMin from './jsMin';
import {gzip} from 'zlib';
import {writeFile} from 'fs';
import {dirname} from 'path';
import mkdirp from 'mkdirp';

var i = 0;

/**
 * A JavaScript compiler
 *
 * @class
 * @param {Object} [rules] - an object that lets you override default linting rules
 * @example
 * import {JS} from 'webcompiler';
 *
 * var js = new JS();
 */
export default class JS {

  flow: NativeProcess;

  linter: JSLint;

  constructor(lintRules: Object = {}) {

    /**
     * flow static analyzer
     *
     * @memberof JS
     * @private
     * @instance
     * @type {NativeProcess}
     */
    this.flow = new NativeProcess('flow');

    /**
     * JavaScript linter
     *
     * @memberof JS
     * @private
     * @instance
     * @type {JSLint}
     */
    this.linter = new JSLint(lintRules);
  }

  /**
   * Performs static analysis and linting
   *
   * @memberof JS
   * @instance
   * @method validate
   * @param {string}        inPath    - a full system path to the input file/directory
   * @param {Array<string>} lintPaths - an array of paths to lint
   * @param {Function}      callback  - a callback function, invoked only when successfully validated
   * @example
   * js.validate('/path/to/the/input/file.js', ['/lint/this/directory/too'], function () {
   *   // successfully validated
   * });
   */
  validate(inPath: string, lintPaths: Array<string>, callback: Function) {
    this.flow.run((flowErr, stdout) => {
      if (flowErr) {
        return console.error(flowErr);
      }
      if (!/No errors/.test(stdout)) {
        return console.error(stdout);
      }
      this.linter.run(lintPaths.concat([inPath]), function (linterErr) {
        if (!linterErr) {
          return callback();
        }
        linterErr.forEach(function (e) {
          console.log(
            '\x1b[41mESLint error\x1b[0m "\x1b[33m%s%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
            e.message, e.ruleId ? ` (${e.ruleId})` : '', e.filePath, e.line, e.column);
        });
        console.log('JavaScript linting errors: %s', linterErr.length);
      });
    });
  }

  /**
   * Compiles a JavaScript file for the browser (development mode - faster recompilation).
   *
   * @memberof JS
   * @private
   * @instance
   * @method webCompile
   * @param {string}   inPath   - a full system path to the input file
   * @param {string}   outPath  - a full system path to the output file
   * @param {Function} callback - a callback function, executed after the successful compilation
   * @param {boolean}  devMode  - if true provides faster source map rebuilds, good for rapid development
   * @example
   * js.webCompile('/path/to/the/input/file.js', '/path/to/the/output/file.js', function () {
   *   // compiled successfully
   * }, true);
   */
  webCompile(inPath: string, outPath: string, callback: any, devMode: boolean) {
    jsWebCompile(inPath, outPath, function (compileErr) {
      if (compileErr) {
        compileErr.forEach(function (err) {
          console.error(err);
        });
        return console.log('JavaScript compilation errors: %s', compileErr.length);
      }
      console.log('\x1b[32m%s. Compiled %s\x1b[0m', ++i, inPath);
      callback();
    }, devMode);
  }

  /**
   * Compiles a JavaScript file for the browser (development mode - faster recompilation).
   *
   * @memberof JS
   * @instance
   * @method feDev
   * @param {string}   inPath   - a full system path to the input file
   * @param {string}   outPath  - a full system path to the output file
   * @param {Function} callback - a callback function, executed after the successful compilation
   * @example
   * js.feDev('/path/to/the/input/file.js', '/path/to/the/output/file.js', function () {
   *   // compiled successfully
   * });
   */
  feDev(inPath: string, outPath: string, callback: any) {
    this.webCompile(inPath, outPath, callback, true);
  }

  /**
   * Typechecks, lints, compiles, minifies and GZIPs a JavaScript file for the browser (production mode).
   *
   * @memberof JS
   * @instance
   * @method feProd
   * @param {string}    inPath    - a full system path to the input file
   * @param {string}    outPath   - a full system path to the output file
   * @param {Function}  callback  - a callback function, executed after the successful compilation
   * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
   * @example
   * js.feProd('/path/to/the/input/file.js', '/path/to/the/output/file.js', function () {
   *   // compiled successfully
   * }, '/lint/this/directory/too');
   */
  feProd(inPath: string, outPath: string, callback: any, ...lintPaths: Array<string>) {
    this.validate(inPath, lintPaths, () => {
      this.webCompile(inPath, outPath, function () {
        var minified = jsMin(outPath);

        gzip(minified.code, function (gzipErr, code) {
          if (gzipErr) {
            return console.error(gzipErr);
          }
          writeFile(outPath, code, function (scriptErr) {
            if (scriptErr) {
              return console.error(scriptErr);
            }
            writeFile(`${outPath}.map`, minified.map, function (mapErr) {
              if (mapErr) {
                return console.error(mapErr);
              }
              console.log('\x1b[32m%s. Optimized for production %s\x1b[0m', ++i, inPath);
              callback();
            });
          });
        });
      }, false);
    });
  }

  /**
   * Typechecks, lints and compiles a JavaScript file for the NodeJS.
   *
   * @memberof JS
   * @instance
   * @method beFile
   * @param {string}    inPath    - a full system path to the input file
   * @param {string}    outPath   - a full system path to the output file
   * @param {Function}  callback  - a callback function, executed after the successful compilation
   * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
   * @example
   * js.beFile('/path/to/the/input/file.js', '/path/to/the/output/file.js', function () {
   *   // compiled successfully
   * }, '/lint/this/directory/too');
   */
  beFile(inPath: string, outPath: string, callback: any, ...lintPaths: Array<string>) {
    this.validate(inPath, lintPaths, function () {
      jsNodeCompileFile(inPath, function (compileErr, code) {
        if (compileErr) {
          return console.error(compileErr);
        }
        mkdirp(dirname(outPath), function (mkdirpErr) {
          if (mkdirpErr) {
            return console.error(mkdirpErr);
          }
          writeFile(outPath, code, function (scriptErr) {
            if (scriptErr) {
              return console.error(scriptErr);
            }
            console.log('\x1b[32m%s. Compiled %s\x1b[0m', ++i, inPath);
            callback();
          });
        });
      });
    });
  }

  /**
   * Typechecks, lints and compiles all JavaScript files inside the inPath for the NodeJS.
   *
   * @memberof JS
   * @instance
   * @method beDir
   * @param {string}    inPath    - a full system path to the input directory
   * @param {string}    outPath   - a full system path to the output directory
   * @param {Function}  callback  - a callback function, executed after the successful compilation
   * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
   * @example
   * js.beDir('/path/to/the/input/directory', '/path/to/the/output/directory', function () {
   *   // compiled successfully
   * }, '/lint/this/directory/too');
   */
  beDir(inPath: string, outPath: string, callback: any, ...lintPaths: Array<string>) {
    this.validate(inPath, lintPaths, function () {
      jsNodeCompileDir(inPath, outPath, function (compileErr) {
        if (compileErr) {
          return console.error(compileErr);
        }
        console.log('\x1b[32m%s. Compiled %s\x1b[0m', ++i, inPath);
        callback();
      });
    });
  }

}
