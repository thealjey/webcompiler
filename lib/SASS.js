'use strict';

exports.__esModule = true;
exports.SASS = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _SASSCompiler = require('./SASSCompiler');

var _SASSLint = require('./SASSLint');

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * SASS compilation tools
 *
 * Configures the default include paths for the following popular CSS modules:
 *
 *  1. Bootstrap (e.g. you can write `@import "bootstrap";` in your ".scss" files)
 *  2. Font Awesome (`@import "font-awesome";`)
 *  3. Bootswatch (`@import "cosmo/variables"; @import "bootstrap"; @import "cosmo/bootswatch";`)
 *
 * Additionally, if an NPM module contains an `_index.scss` (or `_index.sass`, or `index.scss`, or `index.sass`) file in
 * its root directory, importing its stylesheets is as easy as: `@import "<module name>";` (same as you would `import`
 * the module in JavaScript).
 *
 * @class SASS
 * @param {boolean}       [compress=true]        - if true `Compiler#save` will gzip compress the data
 * @param {Array<string>} [includePaths=[]]      - an array of additional include paths
 * @param {Array<string>} [excludeLinter=[]]     - names of linters to exclude
 * @param {Object}        [importOnceOptions={}] - an object that lets you override default importOnce resolver
 *                                                 configuration
 * @example
 * import {SASS} from 'webcompiler';
 * // or - import {SASS} from 'webcompiler/lib/SASS';
 * // or - var SASS = require('webcompiler').SASS;
 * // or - var SASS = require('webcompiler/lib/SASS').SASS;
 *
 * const sass = new SASS();
 */
var SASS = exports.SASS = function () {

  /* eslint-disable require-jsdoc */

  /**
   * SCSS compiler
   *
   * @member {SASSCompiler} compiler
   * @memberof SASS
   * @instance
   */
  function SASS() {
    var compress = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
    var includePaths = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var excludeLinter = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
    var importOnceOptions = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
    (0, _classCallCheck3.default)(this, SASS);

    /* eslint-enable require-jsdoc */
    this.compiler = new _SASSCompiler.SASSCompiler(compress, includePaths, importOnceOptions);
    this.linter = new (Function.prototype.bind.apply(_SASSLint.SASSLint, [null].concat(excludeLinter)))();
  }

  /**
   * Wraps {@link SASSCompiler#fe} to add linting
   *
   * @memberof SASS
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


  /**
   * SCSS linter
   *
   * @member {SASSLint} linter
   * @memberof SASS
   * @private
   * @instance
   */


  SASS.prototype.fe = function fe(inPath, outPath) {
    var _this = this;

    var lintPaths = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
    var callback = arguments.length <= 3 || arguments[3] === undefined ? _noop2.default : arguments[3];

    this.linter.run(lintPaths.concat([inPath]), function () {
      _this.compiler.fe(inPath, outPath, callback);
    });
  };

  return SASS;
}();