/* @flow */

import SASSLint from './SASSLint';
import SASSCompile from './SASSCompile';
import cssAutoprefix from './cssAutoprefix';
import cssMin from './cssMin';
import {gzip} from 'zlib';
import {writeFile} from 'fs';
import {dirname} from 'path';
import mkdirp from 'mkdirp';

var i = 0;

/**
 * A SASS compiler
 *
 * @class
 * @param {Array<string>} [excludeLinter]     - names of linters to exclude
 * @param {Object}        [importOnceOptions] - an object that lets you override default importOnce resolver
 *                                              configuration
 * @param {Array<string>} [includePaths]      - an array of additional include paths
 * @example
 * import {SASS} from 'webcompiler';
 *
 * var sass = new SASS();
 */
export default class SASS {

  linter: SASSLint;

  compiler: SASSCompile;

  constructor(excludeLinter: Array<string> = [], importOnceOptions: Object = {}, includePaths: Array<string> = []) {

    /**
     * SCSS linter
     *
     * @memberof SASS
     * @private
     * @instance
     * @type {SASSLint}
     */
    this.linter = new SASSLint(...excludeLinter);

    /**
     * SCSS compiler
     *
     * @memberof SASS
     * @private
     * @instance
     * @type {SASSCompile}
     */
    this.compiler = new SASSCompile(importOnceOptions, includePaths);
  }

  /**
   * Performs linting
   *
   * @memberof SASS
   * @instance
   * @method validate
   * @param {string}        inPath    - a full system path to the input file/directory
   * @param {Array<string>} lintPaths - an array of paths to lint
   * @param {Function}      callback  - a callback function, invoked only when successfully validated
   * @example
   * sass.validate('/path/to/the/input/file.scss', ['/lint/this/directory/too'], function () {
   *   // successfully validated
   * });
   */
  validate(inPath: string, lintPaths: Array<string>, callback: Function) {
    this.linter.run(lintPaths.concat([inPath]), function (linterErr) {
      if (linterErr) {
        return console.error(linterErr);
      }
      callback();
    });
  }

  /**
   * Lints and compiles an SCSS file for the browser.
   *
   * @memberof SASS
   * @private
   * @instance
   * @method webCompile
   * @param {string}    inPath    - a full system path to the input file
   * @param {string}    outPath   - a full system path to the output file
   * @param {Function}  callback  - a callback function, executed after the successful compilation
   * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
   * @example
   * sass.webCompile('/path/to/the/input/file.scss', '/path/to/the/output/file.css', function (result) {
   *   // result -> {code: string, map: string}
   * }, '/lint/this/directory/too');
   */
  webCompile(inPath: string, outPath: string, callback: any, ...lintPaths: Array<string>) {
    this.validate(inPath, lintPaths, () => {
      this.compiler.run(inPath, outPath, function (compileErr, result) {
        if (compileErr) {
          return console.log(
            '\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
            compileErr.message, compileErr.file, compileErr.line, compileErr.column);
        }
        callback(result);
      });
    });
  }

  /**
   * Writes files to disk.
   *
   * @memberof SASS
   * @private
   * @instance
   * @method fsWrite
   * @param {string}                      inPath    - a full system path to the input file
   * @param {string}                      outPath   - a full system path to the output file
   * @param {{code: string, map: string}} data      - an object with a code and a map strings
   * @param {Function}                    callback  - a callback function, executed after the write operation
   * @example
   * sass.fsWrite('/path/to/the/input/file.scss', '/path/to/the/output/file.css', data, function () {
   *   // file system write was successful
   * });
   */
  fsWrite(inPath: string, outPath: string, data: Object, callback: Function) {
    mkdirp(dirname(outPath), function (mkdirpErr) {
      if (mkdirpErr) {
        return console.error(mkdirpErr);
      }
      writeFile(outPath, data.code, function (styleErr) {
        if (styleErr) {
          return console.error(styleErr);
        }
        writeFile(`${outPath}.map`, data.map, function (mapErr) {
          if (mapErr) {
            return console.error(mapErr);
          }
          console.log('\x1b[32m%s. Compiled %s\x1b[0m', ++i, inPath);
          callback();
        });
      });
    });
  }

  /**
   * Lints and compiles an SCSS file for the browser (development mode - faster recompilation).
   *
   * @memberof SASS
   * @instance
   * @method feDev
   * @param {string}    inPath    - a full system path to the input file
   * @param {string}    outPath   - a full system path to the output file
   * @param {Function}  callback  - a callback function, executed after the successful compilation
   * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
   * @example
   * sass.feDev('/path/to/the/input/file.scss', '/path/to/the/output/file.css', function () {
   *   // compiled successfully
   * }, '/lint/this/directory/too');
   */
  feDev(inPath: string, outPath: string, callback: any, ...lintPaths: Array<string>) {
    this.webCompile(inPath, outPath, result => {
      this.fsWrite(inPath, outPath, result, callback);
    }, ...lintPaths);
  }

  /**
   * Lints, compiles, adds browser vendor prefixes, minifies and GZIPs an SCSS file for the browser (production mode).
   *
   * @memberof SASS
   * @instance
   * @method feProd
   * @param {string}    inPath    - a full system path to the input file
   * @param {string}    outPath   - a full system path to the output file
   * @param {Function}  callback  - a callback function, executed after the successful compilation
   * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
   * @example
   * sass.feProd('/path/to/the/input/file.scss', '/path/to/the/output/file.css', function () {
   *   // compiled successfully
   * }, '/lint/this/directory/too');
   */
  feProd(inPath: string, outPath: string, callback: any, ...lintPaths: Array<string>) {
    this.webCompile(inPath, outPath, result => {
      cssAutoprefix(result, outPath, (prefixErr, prefixed) => {

        /* @noflow */
        var minified;

        if (prefixErr) {
          return prefixErr.forEach(function (err) {
            console.error(err);
          });
        }
        minified = cssMin(prefixed);
        gzip(minified.code, (gzipErr, code) => {
          if (gzipErr) {
            return console.error(gzipErr);
          }
          this.fsWrite(inPath, outPath, {code, map: minified.map}, callback);
        });
      });
    }, ...lintPaths);
  }

}
