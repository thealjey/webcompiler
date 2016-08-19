/* @flow */

import {JSCompiler} from './JSCompiler';
import {NativeProcess} from './NativeProcess';
import {JSLint} from './JSLint';
import forEach from 'lodash/forEach';
import noop from 'lodash/noop';

/**
 * JavaScript compilation tools
 *
 * @class JS
 * @param {boolean} [compress=true]   - if true `Compiler#save` will gzip compress the data
 * @param {Object}  [babelOptions={}] - allows to override the default Babel options
 * @param {Object}  [lintRules={}]    - allows to override the default linting rules
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
   * flow static analyzer
   *
   * @member {NativeProcess} flow
   * @memberof JS
   * @private
   * @instance
   */
  flow: NativeProcess = new NativeProcess('flow');

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
  constructor(compress: boolean = true, babelOptions: Object = {}, lintRules: Object = {}) {
    /* eslint-enable require-jsdoc */
    this.compiler = new JSCompiler(compress, babelOptions);
    this.linter = new JSLint(lintRules);
  }

  /**
   * Performs static analysis
   *
   * @memberof JS
   * @instance
   * @method typecheck
   * @param {Function} callback - a callback function, invoked only when successfully typechecked
   * @example
   * js.typecheck(() => {
   *   // successfully typechecked
   * });
   */
  typecheck(callback: () => void) {
    this.flow.run((flowErr, stdout) => {
      if (flowErr) {
        return console.error(flowErr);
      }
      if (!JSON.parse(stdout).passed) {
        return this.flow.run(noop, [], {stdio: 'inherit'});
      }
      callback();
    }, ['--json']);
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
      if (!linterErr) {
        return callback();
      }
      forEach(linterErr, e => {
        console.log(
          '\x1b[41mESLint error\x1b[0m "\x1b[33m%s%s\x1b[0m" in \x1b[36m%s\x1b[0m on \x1b[35m%s:%s\x1b[0m',
          e.message, e.ruleId ? ` (${e.ruleId})` : '', e.filePath, e.line, e.column);
      });
      console.log('JavaScript linting errors: %s', linterErr.length);
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
    this.typecheck(() => {
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
   * compiler.be('/path/to/an/input/file.js', '/path/to/the/output/file.js', ['/lint/this/directory/too'], () => {
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
   * compiler.fe('/path/to/an/input/file.js', '/path/to/the/output/file.js', ['/lint/this/directory/too'], () => {
   *   // the code has passed all the checks and has been compiled successfully
   * });
   */
  fe(inPath: string, outPath: string, lintPaths: Array<string> = [], callback: () => void = noop) {
    this.validate(inPath, lintPaths, () => {
      this.compiler.fe(inPath, outPath, callback);
    });
  }

}
