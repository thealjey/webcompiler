'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.parseHTML = parseHTML;
exports.toJSXKey = toJSXKey;
exports.transformStyle = transformStyle;
exports.rename = rename;
exports.transformElement = transformElement;
exports.transformElements = transformElements;
exports.flatten = flatten;
exports.arrayToJSX = arrayToJSX;
exports.htmlToArray = htmlToArray;
exports.htmlToJSX = htmlToJSX;

var _cheerio = require('cheerio');

var _react = require('react');

var _reject = require('lodash/reject');

var _reject2 = _interopRequireDefault(_reject);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _transform = require('lodash/transform');

var _transform2 = _interopRequireDefault(_transform);

var _has = require('lodash/has');

var _has2 = _interopRequireDefault(_has);

var _flattenDeep = require('lodash/flattenDeep');

var _flattenDeep2 = _interopRequireDefault(_flattenDeep);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _trim = require('lodash/trim');

var _trim2 = _interopRequireDefault(_trim);

var _replace = require('lodash/replace');

var _replace2 = _interopRequireDefault(_replace);

var _toUpper = require('lodash/toUpper');

var _toUpper2 = _interopRequireDefault(_toUpper);

var _toLower = require('lodash/toLower');

var _toLower2 = _interopRequireDefault(_toLower);

var _split = require('lodash/split');

var _split2 = _interopRequireDefault(_split);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Useful utilities for working with JSX.
 *
 * @module jsx
 */

/**
 * Parses an HTML string.
 *
 * @memberof module:jsx
 * @private
 * @method parseHTML
 * @param {string} html - an arbitrary HTML string
 * @return {Object} an object containing a CheerioDOM object and a CheerioCollection of the `pre.CodeMirror-line`
 *                  elements
 */
function parseHTML(html) {
  const dom = (0, _cheerio.load)(html),
        { children } = dom.root().toArray()[0];

  return { dom, children };
}

/**
 * Convert the CSS style key to a JSX style key.
 *
 * @memberof module:jsx
 * @private
 * @method toJSXKey
 * @param {string} key - CSS style key
 * @return {string} JSX style key
 */
function toJSXKey(key) {
  return (0, _replace2.default)(/^-ms-/.test(key) ? key.substr(1) : key, /-(.)/g, (match, chr) => (0, _toUpper2.default)(chr));
}

/**
 * Parse the specified inline style attribute value.
 *
 * @memberof module:jsx
 * @private
 * @method transformStyle
 * @param {Object} object - the object to perform replacements on
 */
function transformStyle(object) {
  if ((0, _has2.default)(object, 'style')) {
    object.style = (0, _transform2.default)((0, _split2.default)(object.style, ';'), (result, style) => {
      const firstColon = style.indexOf(':'),
            key = (0, _trim2.default)(style.substr(0, firstColon));

      if (key) {
        result[toJSXKey((0, _toLower2.default)(key))] = (0, _trim2.default)(style.substr(firstColon + 1));
      }
    }, {});
  }
}

/**
 * Renames specified attributes if present.
 *
 * @memberof module:jsx
 * @private
 * @method rename
 * @param {Object} object  - the object to perform replacements on
 * @param {string} fromKey - a key to look for
 * @param {string} toKey   - a key to rename to
 */
function rename(object, fromKey, toKey) {
  if ((0, _has2.default)(object, fromKey)) {
    object[toKey] = object[fromKey];
    delete object[fromKey];
  }
}

/**
 * Converts a Cheerio Element into an object that can later be used to create a React Element.
 *
 * @memberof module:jsx
 * @private
 * @method transformElement
 * @param {Object} element - a Cheerio Element
 * @return {Object} a plain object describing a React Element
 */
function transformElement({ name: type, attribs: props, children: childElements }) {
  transformStyle(props);
  rename(props, 'for', 'htmlFor');
  rename(props, 'class', 'className');
  if ('input' === type) {
    rename(props, 'checked', 'defaultChecked');
    rename(props, 'value', 'defaultValue');
  }
  let children = transformElements(childElements);

  if ('textarea' === type && children.length) {
    props.defaultValue = children[0];
    children = [];
  }

  return { type, props, children };
}

/**
 * Converts an array of Cheerio Elements to an array of plain objects describing React Elements for easy
 * serialization/unserialization.
 *
 * @memberof module:jsx
 * @private
 * @method transformElements
 * @param {Array<Object>} [elements=[]] - Cheerio Elements
 * @return {Array<string|Object>} an array of plain objects describing React Elements
 */
function transformElements(elements = []) {
  return (0, _map2.default)((0, _reject2.default)(elements, ['type', 'comment']), el => 'text' === el.type ? el.data : transformElement(el));
}

/**
 * Recursively flattens `args`, removes falsy values and combines string values.
 *
 * Can be used as a simple optimization step on the JSX children-to-be to simplify the resulting DOM structure by
 * joining adjacent text nodes together.
 *
 * @memberof module:jsx
 * @method flatten
 * @param {...*} args - the input values
 * @return {Array<*>} the flattened result
 * @example
 * import {flatten} from 'webcompiler';
 * // or - import {flatten} from 'webcompiler/lib/jsx';
 * // or - var flatten = require('webcompiler').flatten;
 * // or - var flatten = require('webcompiler/lib/jsx').flatten;
 *
 * flatten('lorem ', ['ipsum ', null, ['dolor ', ['sit ', ['amet']]]]); // ["lorem ipsum dolor sit amet"]
 */
function flatten(...args) {
  return (0, _transform2.default)((0, _flattenDeep2.default)(args), (accumulator, value) => {
    if (!value) {
      return;
    }
    const lastIndex = accumulator.length - 1;

    if ((0, _isString2.default)(value) && (0, _isString2.default)(accumulator[lastIndex])) {
      accumulator[lastIndex] += value;
    } else {
      accumulator.push(value);
    }
  }, []);
}

/**
 * Converts an array of plain objects describing React Elements to an array of React Elements.
 *
 * @memberof module:jsx
 * @method arrayToJSX
 * @param {Array<string|Object>} [arr=[]] - an array of plain objects describing React Elements
 * @return {Array<ReactElement>} an array of React Elements
 * @example
 * import {arrayToJSX} from 'webcompiler';
 * // or - import {arrayToJSX} from 'webcompiler/lib/jsx';
 * // or - var arrayToJSX = require('webcompiler').arrayToJSX;
 * // or - var arrayToJSX = require('webcompiler/lib/jsx').arrayToJSX;
 *
 * <div>{arrayToJSX([{type: 'h1', children: ['Hello world!']}])}</div>
 */
function arrayToJSX(arr = []) {
  return (0, _map2.default)(arr, (el, key) => {
    if ((0, _isString2.default)(el)) {
      return el;
    }
    const { type, props, children } = el;

    return (0, _react.createElement)(type, _extends({}, props, { key }), ...arrayToJSX(children));
  });
}

/**
 * Converts an arbitrary HTML string to an array of plain objects describing React Elements for easy
 * serialization/unserialization.
 *
 * @memberof module:jsx
 * @method htmlToArray
 * @param {string} [html=""] - an arbitrary HTML string
 * @return {Array<string|Object>} an array of plain objects describing React Elements
 * @example
 * import {htmlToArray} from 'webcompiler';
 * // or - import {htmlToArray} from 'webcompiler/lib/jsx';
 * // or - var htmlToArray = require('webcompiler').htmlToArray;
 * // or - var htmlToArray = require('webcompiler/lib/jsx').htmlToArray;
 *
 * htmlToArray('<h1>Hello world!</h1>'); // [{type: 'h1', children: ['Hello world!']}]
 */
function htmlToArray(html = '') {
  html = (0, _trim2.default)(html);

  return html ? transformElements(parseHTML(html).children) : [];
}

/**
 * Converts an arbitrary HTML string to an array of React Elements.
 *
 * @memberof module:jsx
 * @method htmlToJSX
 * @param {string} [html=""] - an arbitrary HTML string
 * @return {Array<ReactElement>} an array of React Elements
 * @example
 * import {htmlToJSX} from 'webcompiler';
 * // or - import {htmlToJSX} from 'webcompiler/lib/jsx';
 * // or - var htmlToJSX = require('webcompiler').htmlToJSX;
 * // or - var htmlToJSX = require('webcompiler/lib/jsx').htmlToJSX;
 *
 * <div>{htmlToJSX('<h1>Hello world!</h1>')}</div>
 */
function htmlToJSX(html = '') {
  return arrayToJSX(htmlToArray(html));
}