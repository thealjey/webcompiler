/* @flow */

import {JSCompiler} from './JSCompiler';
import type {NativeProcess} from './NativeProcess';
import {JSLint} from './JSLint';
import noop from 'lodash/noop';
import {logError, logLintingErrors} from './logger';
import {findBinary} from './findBinary';

/**
 * JavaScript compilation tools
 *
 * @class JS
 * @param {boolean} [compress=true] - if true `Compiler#save` will gzip compress the data in production mode
 * @param {Object}  [lintRules={}]  - allows to override the default linting rules
 * @example
 * import {JS} from 'webcompiler';
 * // or - import {JS} from 'webcompiler/lib/JS';
 * // or - var JS = require('webcompiler').JS;
 * // or - var JS = require('webcompiler/lib/JS').JS;
 *
 * const js = new JS();
 */
export class JS {

  /**
   * JavaScript compiler
   *
   * @member {JSCompiler} compiler
   * @memberof JS
   * @instance
   */
  compiler: JSCompiler;

  /**
   * JavaScript linter
   *
   * @member {JSLint} linter
   * @memberof JS
   * @private
   * @instance
   */
  linter: JSLint;

  /* eslint-disable require-jsdoc */
  constructor(compress: boolean = true, lintRules: Object = {}) {
    /* eslint-enable require-jsdoc */
    this.compiler = new JSCompiler(compress);
    this.linter = new JSLint(lintRules);
  }

  /**
   * Performs static analysis
   *
   * @memberof JS
   * @static
   * @method typecheck
   * @param {Function} callback - a callback function, invoked only when successfully typechecked
   * @example
   * JS.typecheck(() => {
   *   // successfully typechecked
   * });
   */
  static typecheck(callback: () => void) {
    findBinary('flow', (error, flow: NativeProcess) => {
      if (error) {
        return logError(error);
      }
      flow.run((flowErr, stdout) => {
        if (flowErr) {
          return logError(flowErr);
        }
        if (!JSON.parse(stdout).passed) {
          return flow.run(noop, [], {stdio: 'inherit'});
        }
        callback();
      }, ['--json']);
    });
  }

  /**
   * Performs linting
   *
   * @memberof JS
   * @instance
   * @method lint
   * @param {Array<string>} paths    - an array of paths to files/directories to lint
   * @param {Function}      callback - a callback function, invoked only when successfully linted
   * @example
   * js.lint(['/path/to/the/input/file.js', '/lint/this/directory/too'], () => {
   *   // successfully linted
   * });
   */
  lint(paths: Array<string>, callback: () => void) {
    this.linter.run(paths, linterErr => {
      if (linterErr) {
        return logLintingErrors(linterErr, 'JavaScript');
      }
      callback();
    });
  }

  /**
   * Performs static analysis and linting
   *
   * @memberof JS
   * @instance
   * @private
   * @method validate
   * @param {string}        inPath    - the input file (will also be linted)
   * @param {Array<string>} lintPaths - an array of paths to files/directories to lint
   * @param {Function}      callback  - a callback function, invoked only when successfully validated
   * @example
   * js.validate('/path/to/the/input/file.js', ['/lint/this/directory/too'], () => {
   *   // successfully validated
   * });
   */
  validate(inPath: string, lintPaths: Array<string>, callback: () => void) {
    JS.typecheck(() => {
      this.lint(lintPaths.concat([inPath]), callback);
    });
  }

  /**
   * Wraps {@link JSCompiler#be} to add static analysis and linting
   *
   * @memberOf JS
   * @instance
   * @method be
   * @param {string}        inPath                    - the input path
   * @param {string}        outPath                   - the output path
   * @param {Array<string>} [lintPaths=[]]            - an array of paths to files/directories to lint
   * @param {Function}      [callback=function () {}] - a callback function
   * @return {void}
   * @example
   * compiler.be('/path/to/the/input/file.js', '/path/to/the/output/file.js', ['/lint/this/directory/too'], () => {
   *   // the code has passed all the checks and has been compiled successfully
   * });
   */
  be(inPath: string, outPath: string, lintPaths: Array<string> = [], callback: () => void = noop) {
    this.validate(inPath, lintPaths, () => {
      this.compiler.be(inPath, outPath, callback);
    });
  }

  /**
   * Wraps {@link JSCompiler#fe} to add static analysis and linting
   *
   * @memberOf JS
   * @instance
   * @method fe
   * @param {string}        inPath                    - the input path
   * @param {string}        outPath                   - the output path
   * @param {Array<string>} [lintPaths=[]]            - an array of paths to files/directories to lint
   * @param {Function}      [callback=function () {}] - a callback function
   * @return {void}
   * @example
   * compiler.fe('/path/to/the/input/file.js', '/path/to/the/output/file.js', ['/lint/this/directory/too'], () => {
   *   // the code has passed all the checks and has been compiled successfully
   * });
   */
  fe(inPath: string, outPath: string, lintPaths: Array<string> = [], callback: () => void = noop) {
    this.validate(inPath, lintPaths, () => {
      this.compiler.fe(inPath, outPath, callback);
    });
  }

}
