'use strict';

exports.__esModule = true;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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
  var dom = (0, _cheerio.load)(html);
  var children = dom.root().toArray()[0].children;


  return { dom: dom, children: children };
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
  return (/^-ms-/.test(key) ? key.substr(1) : key).replace(/-(.)/g, function (match, chr) {
    return chr.toUpperCase();
  });
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
    object.style = (0, _transform2.default)(object.style.split(';'), function (result, style) {
      var firstColon = style.indexOf(':'),
          key = style.substr(0, firstColon).trim();

      if (key) {
        result[toJSXKey(key.toLowerCase())] = style.substr(firstColon + 1).trim();
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
function transformElement(element) {
  var name = element.name;
  var attribs = element.attribs;
  var children = element.children;


  transformStyle(attribs);
  rename(attribs, 'for', 'htmlFor');
  rename(attribs, 'class', 'className');
  if ('input' === name) {
    rename(attribs, 'checked', 'defaultChecked');
    rename(attribs, 'value', 'defaultValue');
  }
  var childElements = transformElements(children);

  if ('textarea' === name && childElements.length) {
    attribs.defaultValue = childElements[0];
    childElements = [];
  }

  return { type: name, props: attribs, children: childElements };
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
function transformElements() {
  var elements = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return (0, _map2.default)((0, _reject2.default)(elements, ['type', 'comment']), function (el) {
    return 'text' === el.type ? el.data : transformElement(el);
  });
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
function flatten() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _transform2.default)((0, _flattenDeep2.default)(args), function (accumulator, value) {
    if (!value) {
      return;
    }
    var lastIndex = accumulator.length - 1;

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
function arrayToJSX() {
  var arr = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  return (0, _map2.default)(arr, function (el, key) {
    if ((0, _isString2.default)(el)) {
      return el;
    }
    var type = el.type;
    var props = el.props;
    var children = el.children;


    return _react.createElement.apply(undefined, [type, (0, _extends3.default)({}, props, { key: key })].concat(arrayToJSX(children)));
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
function htmlToArray() {
  var html = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

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
function htmlToJSX() {
  var html = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  return arrayToJSX(htmlToArray(html));
}