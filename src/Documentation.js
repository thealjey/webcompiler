/* @flow */

import {NativeProcess} from './NativeProcess';
import {stat} from 'fs';
import {join} from 'path';
import noop from 'lodash/noop';
import {logError} from './logger';

const npm = new NativeProcess('npm'),
  cwd = process.cwd(),
  defaultOptions = {
    inputDir: join(cwd, 'src'),
    outputDir: join(cwd, 'docs'),
    readMe: join(cwd, 'README.md'),
    template: join(cwd, 'node_modules', 'docdash'),
    jsdocConfig: join(__dirname, '..', 'config', 'jsdoc.json')
  };

/**
 * Generates API documentation
 *
 * The default JSDoc plugin specified in `jsdocConfig` strips out all of the code from a file while retaining newlines
 * (unlike the built in `commentsOnly` plugin that ships with JSDoc3).
 *
 * That way:
 * 1. line numbers are preserved in the source view
 * 2. you don't need to use a pre-compiler, you will always see the same code as you wrote in the docs source view
 * 3. since JSDoc only sees comments you can use any code syntax you like - ES2015, ES7, JSX, it doesn't even have to be
 * JavaScript.
 *
 * The markdown plugin is also included by default.
 *
 * @class Documentation
 * @param {DocumentationConfig} [config={}] - a configuration object
 * @example
 * import {Documentation} from 'webcompiler';
 * // or - import {Documentation} from 'webcompiler/lib/Documentation';
 * // or - var Documentation = require('webcompiler').Documentation;
 * // or - var Documentation = require('webcompiler/lib/Documentation').Documentation;
 *
 * const docs = new Documentation();
 */
export class Documentation {
  /**
   * JSDoc3
   *
   * @member {NativeProcess} jsdoc
   * @memberof Documentation
   * @private
   * @instance
   */
  jsdoc: ?NativeProcess;

  /**
   * documentation generator configuration object
   *
   * @member {DocumentationConfig} options
   * @memberof Documentation
   * @private
   * @instance
   */
  options: Object;

  /* eslint-disable require-jsdoc */
  constructor(options: Object = {}) {
    /* eslint-enable require-jsdoc */
    this.options = {...defaultOptions, ...options};
  }

  /**
   * Finds a path to the JSDoc3 executable
   *
   * @memberof Documentation
   * @static
   * @private
   * @method findExecutable
   * @param {Function} callback - a callback function
   * @example
   * Documentation.findExecutable(file => {
   *   // the jsdoc file is found
   * });
   */
  static findExecutable(callback: Function) {
    Documentation.checkBin(localFile => {
      if (localFile) {
        return callback(localFile);
      }
      Documentation.checkBin(globalFile => {
        if (globalFile) {
          return callback(globalFile);
        }
        console.error('Failed to locate the jsdoc executable');
      }, true);
    });
  }

  /**
   * Checks the NPM bin directories to see if they contain a file named jsdoc
   *
   * @memberof Documentation
   * @static
   * @private
   * @method checkBin
   * @param {Function} callback              - a callback function
   * @param {boolean}  [globalPackage=false] - if true checks the global NPM bin directory (contains the npm executable
   *                                           itself)
   * @example
   * Documentation.checkBin(file => {
   *   if (file) {
   *     // the jsdoc file is found
   *   }
   * });
   */
  static checkBin(callback: Function, globalPackage: boolean = false) {
    const args = ['bin'];

    if (globalPackage) {
      args.push('-g');
    }
    npm.run((stderr, stdout) => {
      if (stderr) {
        console.error(stderr);

        return callback(null);
      }
      const path = join(stdout.replace(/\n$/, ''), 'jsdoc');

      stat(path, err => {
        callback(err ? null : path);
      });
    }, args);
  }

  /**
   * Generate the documentation
   *
   * @memberof Documentation
   * @instance
   * @method run
   * @param {Function} [callback=function () {}] - a callback function
   * @return {void}
   * @example
   * docs.run(() => {
   *   // generated the API documentation
   * });
   */
  run(callback: () => void = noop) {
    if (this.jsdoc) {
      return this.doRun(this.jsdoc, callback);
    }
    Documentation.findExecutable(file => {
      this.jsdoc = new NativeProcess(file);
      this.doRun(this.jsdoc, callback);
    });
  }

  /**
   * Given a JSDoc3 executable, generate the documentation
   *
   * @memberof Documentation
   * @instance
   * @private
   * @method doRun
   * @param {NativeProcess} jsdoc    - JSDoc3
   * @param {Function}      callback - a callback function
   * @example
   * docs.doRun(jsdoc, () => {
   *   // generated the API documentation
   * });
   */
  doRun(jsdoc: NativeProcess, callback: () => void) {
    const {inputDir, outputDir, readMe, template, jsdocConfig} = this.options;

    jsdoc.run(stderr => {
      if (stderr) {
        return logError(stderr);
      }
      callback();
    }, [inputDir, '-d', outputDir, '-R', readMe, '-c', jsdocConfig, '-t', template]);
  }

}
