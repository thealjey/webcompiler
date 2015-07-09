/* @flow */

import SASSLint from './SASSLint';
import SASSCompile from './SASSCompile';
import cssAutoprefix from './cssAutoprefix';
import cssMin from './cssMin';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
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
   * Lints, compiles, adds browser vendor prefixes, minifies and GZIPs an SCSS file for the browser.
   *
   * @memberof SASS
   * @instance
   * @method fe
   * @param {string}    inPath    - a full system path to the input file
   * @param {string}    outPath   - a full system path to the output file
   * @param {Function}  callback  - a callback function, executed after the successful compilation
   * @param {...string} lintPaths - paths to files/directories to lint (the input file is included automatically)
   * @example
   * sass.fe('/path/to/the/input/file.scss', '/path/to/the/output/file.css', function () {
   *   // compiled successfully
   * }, '/lint/this/directory/too');
   */
  fe(inPath: string, outPath: string, callback: any, ...lintPaths: Array<string>) {
    this.validate(inPath, lintPaths, () => {
      this.compiler.run(inPath, outPath, function (compileErr, result) {
        if (compileErr) {
          return console.log(
            '\x1b[41mSASS error\x1b[0m "\x1b[33m%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
            compileErr.message, compileErr.file, compileErr.line, compileErr.column);
        }
        cssAutoprefix(result, outPath, function (prefixErr, prefixed) {

          /* @noflow */
          var minified;

          if (prefixErr) {
            return prefixErr.forEach(function (err) {
              console.error(err);
            });
          }
          minified = cssMin(prefixed);
          zlib.gzip(minified.code, function (gzipErr, code) {
            if (gzipErr) {
              return console.error(gzipErr);
            }
            mkdirp(path.dirname(outPath), function (mkdirpErr) {
              if (mkdirpErr) {
                return console.error(mkdirpErr);
              }
              fs.writeFile(outPath, code, function (styleErr) {
                if (styleErr) {
                  return console.error(styleErr);
                }
                fs.writeFile(`${outPath}.map`, minified.map, function (mapErr) {
                  if (mapErr) {
                    return console.error(mapErr);
                  }
                  console.log('\x1b[32m%s. Compiled %s\x1b[0m', ++i, inPath);
                  callback();
                });
              });
            });
          });
        });
      });
    });
  }

}
