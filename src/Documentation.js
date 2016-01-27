/* @flow */

import {NativeProcess} from './NativeProcess';
import {stat} from 'fs';
import {join} from 'path';
import noop from 'lodash/noop';

const npm = new NativeProcess('npm'),
    defaultConfig = join(__dirname, '..', 'config', 'jsdoc.json'),
    cwd = process.cwd();

/**
 * Processed application code with source maps
 *
 * @typedef {Object} DocumentationConfig
 * @property {string} [inputDir="src"]     - the input application code directory
 * @property {string} [outputDir="docs"]   - the output directory for the generated documentation
 * @property {string} [readMe="README.md"] - the documentation "homepage" (README.md file)
 * @property {string} [template="node_modules/ink-docstrap/template"]      - a full system path to a valid JSDoc3
 *                                                                           template directory
 * @property {string} [jsdocConfig="<webcompiler root>/config/jsdoc.json"] - a full system path to a JSDoc3
 *                                                                           configuration file
 */

/**
 * Invoked on operation success or failure
 *
 * @callback FindExecutableCallback
 * @param {string} file - a full system path to a file
 */
type FindExecutableCallback = (file: string) => void;

/**
 * Invoked on operation success or failure
 *
 * @callback CheckBinCallback
 * @param {string} [file] - a full system path to a file
 */
export type CheckBinCallback = (file: ?string) => void;

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
   * the input application code directory
   *
   * @member {string} inputDir
   * @memberof Documentation
   * @private
   * @instance
   */
  inputDir: string;

  /**
   * the output directory for the generated documentation
   *
   * @member {string} outputDir
   * @memberof Documentation
   * @private
   * @instance
   */
  outputDir: string;

  /**
   * the documentation "homepage" (README.md file)
   *
   * @member {string} readMe
   * @memberof Documentation
   * @private
   * @instance
   */
  readMe: string;

  /**
   * a full system path to a valid JSDoc3 template directory
   *
   * @member {string} template
   * @memberof Documentation
   * @private
   * @instance
   */
  template: string;

  /**
   * a full system path to a JSDoc3 configuration file
   *
   * @member {string} jsdocConfig
   * @memberof Documentation
   * @private
   * @instance
   */
  jsdocConfig: string;

  constructor({inputDir, outputDir, readMe, template, jsdocConfig}: {inputDir?: string, outputDir?: string,
      readMe?: string, template?: string, jsdocConfig?: string} = {}) {
    this.inputDir = inputDir || join(cwd, 'src');
    this.outputDir = outputDir || join(cwd, 'docs');
    this.readMe = readMe || join(cwd, 'README.md');
    this.template = template || join(cwd, 'node_modules', 'ink-docstrap', 'template');
    this.jsdocConfig = jsdocConfig || defaultConfig;
  }

  /**
   * Finds a path to the JSDoc3 executable
   *
   * @memberof Documentation
   * @static
   * @private
   * @method findExecutable
   * @param {FindExecutableCallback} callback - a callback function
   * @example
   * Documentation.findExecutable(file => {
   *   // the jsdoc file is found
   * });
   */
  static findExecutable(callback: FindExecutableCallback) {
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
   * @param {CheckBinCallback} callback        - a callback function
   * @param {globalPackage}    [boolean=false] - if true checks the global NPM bin directory (contains the npm
   *                                             executable itself)
   * @example
   * Documentation.checkBin(file => {
   *   if (file) {
   *     // the jsdoc file is found
   *   }
   * });
   */
  static checkBin(callback: CheckBinCallback, globalPackage: boolean = false) {
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
    jsdoc.run(stderr => {
      if (stderr) {
        return console.error(stderr);
      }
      callback();
    }, [this.inputDir, '-d', this.outputDir, '-R', this.readMe, '-c', this.jsdocConfig, '-t', this.template]);
  }

}
