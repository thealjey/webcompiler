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
   * @param {string}   inPath   - the input directory path
   * @param {string}   outPath  - the output directory path
   * @param {Function} callback - a callback function
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
   * @param {string}   inPath   - the input file path
   * @param {string}   outPath  - the output file path
   * @param {Function} callback - a callback function
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
   * @param {string}   inPath   - the input file path
   * @param {string}   outPath  - the output file path
   * @param {Function} callback - a callback function
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
   * @param {string}   inPath   - the input file/directory path
   * @param {string}   outPath  - the output file/directory path
   * @param {Function} callback - a callback function
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
   * @param {string}   inPath                    - the input file path
   * @param {string}   outPath                   - the output file path
   * @param {Function} [callback=function () {}] - a callback function
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
