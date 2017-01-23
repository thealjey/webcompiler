/* @flow */

import {Compiler} from './Compiler';
import {join, extname} from 'path';
import {readdir, stat, createReadStream, createWriteStream} from 'fs';
import {transformFile} from 'babel-core';
import forEach from 'lodash/forEach';
import noop from 'lodash/noop';
import {getCompiler, babelBEOptions} from './webpack';
import {logError, log, consoleStyles} from './logger';

/* eslint-disable no-sync */

const {yellow, red} = consoleStyles;

/**
 * A JavaScript compiler
 *
 * @class JSCompiler
 * @extends Compiler
 * @param {boolean} [compress=true] - if true `Compiler#save` will gzip compress the data in production mode
 * @example
 * import {JSCompiler} from 'webcompiler';
 * // or - import {JSCompiler} from 'webcompiler/lib/JSCompiler';
 * // or - var JSCompiler = require('webcompiler').JSCompiler;
 * // or - var JSCompiler = require('webcompiler/lib/JSCompiler').JSCompiler;
 *
 * const compiler = new JSCompiler();
 */
export class JSCompiler extends Compiler {

  /**
   * The number of files being compiled at the moment
   *
   * @member {number} processing
   * @memberOf JSCompiler
   * @private
   * @instance
   */
  processing: number = 0;

  /**
   * Compiles a directory of files for the back end
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method beDir
   * @param {string}   inPath   - the input path
   * @param {string}   outPath  - the output path
   * @param {Function} callback - a callback function
   * @example
   * compiler.beDir('/path/to/an/input/directory', '/path/to/the/output/directory', callback);
   */
  beDir(inPath: string, outPath: string, callback: () => void) {
    readdir(inPath, (readdirErr, files) => {
      if (readdirErr) {
        return logError(readdirErr);
      }
      forEach(files, file => {
        this.beTraverse(join(inPath, file), join(outPath, file), callback);
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
   * @param {string}   inPath   - the input path
   * @param {string}   outPath  - the output path
   * @param {Function} callback - a callback function
   * @example
   * compiler.beFile('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
   */
  beFile(inPath: string, outPath: string, callback: () => void) {
    ++this.processing;
    transformFile(inPath, babelBEOptions, (transformFileErr, result) => {
      if (transformFileErr) {
        return logError(transformFileErr);
      }
      Compiler.fsWrite(outPath, result, callback);
    });
  }

  /**
   * Copies a file
   *
   * @memberOf JSCompiler
   * @instance
   * @private
   * @method copyFile
   * @param {string}   inPath   - the input path
   * @param {string}   outPath  - the output path
   * @param {Function} callback - a callback function
   * @example
   * compiler.copyFile('/path/to/an/input/file', '/path/to/the/output/file', callback);
   */
  copyFile(inPath: string, outPath: string, callback: () => void) {
    ++this.processing;
    Compiler.mkdir(outPath, () => {
      createReadStream(inPath).pipe(createWriteStream(outPath));
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
   * @param {string}   inPath   - the input path
   * @param {string}   outPath  - the output path
   * @param {Function} callback - a callback function
   * @example
   * compiler.beTraverse('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
   */
  beTraverse(inPath: string, outPath: string, callback: () => void) {
    stat(inPath, (statErr, stats) => {
      if (statErr) {
        return logError(statErr);
      }
      if (stats.isDirectory()) {
        this.beDir(inPath, outPath, callback);
      } else if ('.js' === extname(inPath)) {
        this.beFile(inPath, outPath, callback);
      } else {
        this.copyFile(inPath, outPath, callback);
      }
    });
  }

  /**
   * Compiles a JavaScript file or a directory for the back end. Non-JavaScript files are simply copied over.
   *
   * @memberOf JSCompiler
   * @instance
   * @method be
   * @param {string}   inPath                    - the input path
   * @param {string}   outPath                   - the output path
   * @param {Function} [callback=function () {}] - a callback function
   * @return {void}
   * @example
   * compiler.be('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
   */
  be(inPath: string, outPath: string, callback: () => void = noop) {
    if (this.processing) {
      return logError(new Error('Still working'));
    }
    this.beTraverse(inPath, outPath, () => {
      --this.processing;
      if (!this.processing) {
        Compiler.done(inPath, callback);
      }
    });
  }

  /**
   * Compiles, bundles (in production mode also minifies and g-zips) a JavaScript file for the front end.
   *
   * @memberOf JSCompiler
   * @instance
   * @method fe
   * @param {string}   inPath                    - the input path
   * @param {string}   outPath                   - the output path
   * @param {Function} [callback=function () {}] - a callback function
   * @example
   * compiler.fe('/path/to/an/input/file.js', '/path/to/the/output/file.js', callback);
   */
  fe(inPath: string, outPath: string, callback: () => void = noop) {
    const compiler = getCompiler(inPath, outPath);

    compiler.run((err, stats) => {
      if (err) {
        return logError(err);
      }
      const {warnings, errors} = stats.toJson();

      forEach(warnings, warning => {
        log(yellow(warning));
      });
      if (errors.length) {
        forEach(errors, error => {
          log(red(error));
        });

        return;
      }
      this.save(inPath, outPath, {
        code: compiler.outputFileSystem.readFileSync(outPath, 'utf8'),
        map: compiler.outputFileSystem.readFileSync(`${outPath}.map`, 'utf8')
      }, callback);
    });
  }

}
