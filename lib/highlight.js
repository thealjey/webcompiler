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

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * CodeMirror syntax highlighting that works in the browser and on Node.js
 *
 * @module highlight
 */

// on Node.js, polyfill specific DOM requirements of CodeMirror
if (_util.isNode) {
  global.window = (0, _jsdom.jsdom)().defaultView;
  global.navigator = window.navigator;
  global.document = window.document;

  /* ignore */
  document.createRange = (0, _constant2.default)({
    setEnd: _noop2.default,
    setStart: _noop2.default,
    getBoundingClientRect: (0, _constant2.default)({}),
    getClientRects: (0, _constant2.default)([])
  });
}

// we have to use normal requires because of the import hoisting
const cm = require('codemirror');

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
  const el = document.createElement('div');

  cm(el, { value, mode: { name: 'jsx', typescript: true }, scrollbarStyle: 'null', inputStyle: 'contenteditable' });

  const dom = (0, _cheerio.load)(el.innerHTML),
        lines = dom('.CodeMirror-line');

  // eslint-disable-next-line lodash/prefer-lodash-method
  lines.find('> span').removeAttr('style');

  return { dom, lines };
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
function highlightHTML(code = '') {
  if (!code) {
    return '';
  }
  const { dom, lines } = highlight(code);

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
function highlightArray(code = '') {
  if (!code) {
    return [];
  }
  const { lines } = highlight(code);

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
function highlightJSX(code = '') {
  return (0, _jsx.arrayToJSX)(highlightArray(code));
}