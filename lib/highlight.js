'use strict';

exports.__esModule = true;
exports.highlight = highlight;
exports.highlightHTML = highlightHTML;
exports.highlightArray = highlightArray;
exports.highlightJSX = highlightJSX;

var _jsdom = require('jsdom');

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _constant = require('lodash/constant');

var _constant2 = _interopRequireDefault(_constant);

var _cheerio = require('cheerio');

var _jsx = require('./jsx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * CodeMirror syntax highlighting that works in the browser and on Node.js
 *
 * @module highlight
 */

// when not in the browser, polyfill specific DOM requirements of CodeMirror
if ('undefined' === typeof navigator) {
  global.window = (0, _jsdom.jsdom)().defaultView;
  global.navigator = window.navigator;
  window.document.createRange = (0, _constant2.default)({ setEnd: _noop2.default, setStart: _noop2.default, getBoundingClientRect: (0, _constant2.default)({}) });
  global.document = window.document;
}

// we have to use normal requires because of the import hoisting


var cm = require('codemirror');

require('codemirror/mode/jsx/jsx');

/**
 * Using the CodeMirror editor highlights a string of text representing JavaScript program code.
 *
 * @memberof module:highlight
 * @private
 * @method highlight
 * @param {string} value - any valid ES2015, TypeScript, JSX, Flow code
 * @return {Object} an object containing a CheerioDOM object and a CheerioCollection of the `pre.CodeMirror-line`
 *                  elements
 */
function highlight(value) {
  var el = document.createElement('div');

  cm(el, { value: value, mode: { name: 'jsx', typescript: true }, scrollbarStyle: 'null', inputStyle: 'contenteditable' });

  var dom = (0, _cheerio.load)(el.innerHTML),
      lines = dom('.CodeMirror-line');

  /* eslint-disable lodash/prefer-lodash-method */
  lines.find('> span').removeAttr('style');

  /* eslint-enable lodash/prefer-lodash-method */

  return { dom: dom, lines: lines };
}

/**
 * Using the CodeMirror editor highlights a string of text representing JavaScript program code and returns an HTML
 * string.
 *
 * @memberof module:highlight
 * @method highlightHTML
 * @param {string} [code=""] - any valid ES2015, TypeScript, JSX, Flow code
 * @return {string} an HTML string of the `pre.CodeMirror-line` elements
 * @example
 * import {highlightHTML} from 'webcompiler';
 * // or - import {highlightHTML} from 'webcompiler/lib/highlight';
 * // or - var highlightHTML = require('webcompiler').highlightHTML;
 * // or - var highlightHTML = require('webcompiler/lib/highlight').highlightHTML;
 *
 * highlightHTML('function myScript(){return 100;}'); // <pre class="CodeMirror-line">...</pre>
 */
function highlightHTML() {
  var code = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  if (!code) {
    return '';
  }

  var _highlight = highlight(code);

  var dom = _highlight.dom;
  var lines = _highlight.lines;


  return dom.html(lines);
}

/**
 * Using the CodeMirror editor highlights a string of text representing JavaScript program code and returns an array of
 * plain objects describing React Elements for easy serialization/unserialization.
 *
 * @memberof module:highlight
 * @method highlightArray
 * @param {string} [code=""] - any valid ES2015, TypeScript, JSX, Flow code
 * @return {Array<string|Object>} an array of plain objects describing React Elements
 * @example
 * import {highlightArray} from 'webcompiler';
 * // or - import {highlightArray} from 'webcompiler/lib/highlight';
 * // or - var highlightArray = require('webcompiler').highlightArray;
 * // or - var highlightArray = require('webcompiler/lib/highlight').highlightArray;
 *
 * highlightArray('function myScript(){return 100;}');
 * // [{type: 'pre', props: {className: 'CodeMirror-line'}, children: [...]}]
 */
function highlightArray() {
  var code = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  if (!code) {
    return [];
  }

  var _highlight2 = highlight(code);

  var lines = _highlight2.lines;


  return (0, _jsx.transformElements)(lines.toArray());
}

/**
 * Using the CodeMirror editor highlights a string of text representing JavaScript program code and returns an array
 * of React elements.
 *
 * @memberof module:highlight
 * @method highlightJSX
 * @param {string} [code=""] - any valid ES2015, TypeScript, JSX, Flow code
 * @return {Array<ReactElement>} React elements of the `pre.CodeMirror-line` elements
 * @example
 * import {highlightJSX} from 'webcompiler';
 * // or - import {highlightJSX} from 'webcompiler/lib/highlight';
 * // or - var highlightJSX = require('webcompiler').highlightJSX;
 * // or - var highlightJSX = require('webcompiler/lib/highlight').highlightJSX;
 *
 * <div className="CodeMirror cm-s-monokai">{highlightJSX('function myScript(){return 100;}')}</div>
 */
function highlightJSX() {
  var code = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  return (0, _jsx.arrayToJSX)(highlightArray(code));
}