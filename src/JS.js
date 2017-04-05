/* @flow */

import type {JSCompilerConfig} from './typedef';
import {JSCompiler} from './JSCompiler';
import type {NativeProcess} from './NativeProcess';
import {JSLint} from './JSLint';
import noop from 'lodash/noop';
import {logError, logLintingErrors} from './logger';
import {findBinary} from './findBinary';

/**
 * JavaScript compilation tools.
 *
 * Wraps {@link JSCompiler} to add static analysis and linting. If you don't want that, use {@link JSCompiler} directly.
 *
 * @class JS
 * @param {JSCompilerConfig} [options={}]                              - configuration object
 * @param {string}           [configFile="webcompiler/.eslintrc.yaml"] - path to the ESLint configuration file
 * @example
 * import {JS} from 'webcompiler';
 * // or - import {JS} from 'webcompiler/lib/JS';
 * // or - var JS = require('webcompiler').JS;
 * // or - var JS = require('webcompiler/lib/JS').JS;
 * import {join} from 'path';
 *
 * const srcDir = join(__dirname, 'src'),
 *   libDir = join(__dirname, 'lib');
 *
 * const js = new JS();
 *
 * // compile for the browser
 * js.fe(join(srcDir, 'script.js'), join(libDir, 'script.js'));
 *
 * // compile for Node.js
 * js.be(join(srcDir, 'script.js'), join(libDir, 'script.js'));
 *
 * // compile entire directories for Node.js (non-JavaScript files are simply copied over)
 * js.be(srcDir, libDir);
 */
export class JS {

  /**
   * JavaScript compiler
   *
   * @member {JSCompiler} compiler
   * @memberof JS
   * @private
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

  // eslint-disable-next-line require-jsdoc
  constructor(options?: JSCompilerConfig, configFile?: string) {
    this.compiler = new JSCompiler(options);
    this.linter = new JSLint(configFile);
  }

  /**
   * Performs static analysis
   *
   * @memberof JS
   * @static
   * @method typecheck
   * @param {Function} callback - a callback function, invoked only when successfully typechecked
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
   */
  lint(paths: string[], callback: () => void) {
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
   */
  validate(inPath: string, lintPaths: string[], callback: () => void) {
    JS.typecheck(() => {
      this.lint(lintPaths.concat([inPath]), callback);
    });
  }

  /**
   * Wraps {@link JSCompiler#be} to add static analysis and linting.
   *
   * If `inPath` is a directory, `outPath` has to be also.
   *
   * @memberOf JS
   * @instance
   * @method be
   * @param {string}        inPath                    - the input file/directory path
   * @param {string}        outPath                   - the output file/directory path
   * @param {Array<string>} [lintPaths=[]]            - an array of paths to files/directories to lint
   * @param {Function}      [callback=function () {}] - a callback function
   */
  be(inPath: string, outPath: string, lintPaths: string[] = [], callback: () => void = noop) {
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
   * @param {string}        inPath                    - the input file path
   * @param {string}        outPath                   - the output file path
   * @param {Array<string>} [lintPaths=[]]            - an array of paths to files/directories to lint
   * @param {Function}      [callback=function () {}] - a callback function
   */
  fe(inPath: string, outPath: string, lintPaths: string[] = [], callback: () => void = noop) {
    this.validate(inPath, lintPaths, () => {
      this.compiler.fe(inPath, outPath, callback);
    });
  }

}
