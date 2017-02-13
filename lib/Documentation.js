'use strict';

exports.__esModule = true;
exports.Documentation = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = require('path');

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _logger = require('./logger');

var _livereload = require('./livereload');

var _findBinary = require('./findBinary');

var _watch = require('./watch');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cwd = process.cwd(),
      defaultOptions = {
  inputDir: (0, _path.join)(cwd, 'src'),
  outputDir: (0, _path.join)(cwd, 'docs'),
  readMe: (0, _path.join)(cwd, 'README.md'),
  template: (0, _path.join)(cwd, 'node_modules', 'docdash'),
  jsdocConfig: (0, _path.join)(__dirname, '..', 'jsdoc.json')
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
 *
 * docs.run();
 */
class Documentation {

  /* eslint-disable require-jsdoc */
  constructor(options = {}) {
    /* eslint-enable require-jsdoc */
    this.options = _extends({}, defaultOptions, options);
  }

  /**
   * Generate the documentation
   *
   * @memberof Documentation
   * @instance
   * @method run
   * @param {Function} [callback=function () {}] - a callback function
   */


  /**
   * documentation generator configuration object
   *
   * @member {DocumentationConfig} options
   * @memberof Documentation
   * @private
   * @instance
   */
  run(callback = _noop2.default) {
    (0, _findBinary.findBinary)('jsdoc', (error, jsdoc) => {
      if (error) {
        return (0, _logger.logError)(error);
      }
      const { inputDir, outputDir, readMe, template, jsdocConfig } = this.options;

      jsdoc.run(stderr => {
        if (stderr) {
          return (0, _logger.logError)(stderr);
        }
        (0, _logger.logSequentialSuccessMessage)(`Generated API documentation for ${inputDir}`);
        callback();
      }, [inputDir, '-d', outputDir, '-R', readMe, '-c', jsdocConfig, '-t', template]);
    });
  }

  /**
   * Watch for changes and automatically re-build the documentation.
   *
   * Please install, enable and, optionally, allow access to file urls (if you want to be able to browse the generated
   * documentation without the need for a server) to the LiveReload browser extension.
   *
   * @memberof Documentation
   * @instance
   * @method watch
   * @param {Function} [callback=function () {}] - a callback function
   */
  watch(callback = _noop2.default) {
    const lr = (0, _livereload.livereload)();

    (0, _watch.watch)(this.options.inputDir, 'js', () => {
      this.run(() => {
        callback();
        lr();
      });
    });
    this.run(callback);
  }

}
exports.Documentation = Documentation;