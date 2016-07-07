/* @flow */

import {load} from 'cheerio';
import {createElement} from 'react';
import reject from 'lodash/reject';
import map from 'lodash/map';
import transform from 'lodash/transform';
import has from 'lodash/has';
import flattenDeep from 'lodash/flattenDeep';
import isString from 'lodash/isString';
import trim from 'lodash/trim';

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
export function parseHTML(html: string): Object {
  const dom = load(html),
    {children} = dom.root().toArray()[0];

  return {dom, children};
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
export function toJSXKey(key: string): string {
  return (/^-ms-/.test(key) ? key.substr(1) : key).replace(/-(.)/g, (match, chr) => chr.toUpperCase());
}

/**
 * Parse the specified inline style attribute value.
 *
 * @memberof module:jsx
 * @private
 * @method transformStyle
 * @param {Object} object - the object to perform replacements on
 */
export function transformStyle(object: Object) {
  if (has(object, 'style')) {
    object.style = transform(object.style.split(';'), (result, style) => {
      const firstColon = style.indexOf(':'),
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
export function rename(object: Object, fromKey: string, toKey: string) {
  if (has(object, fromKey)) {
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
export function transformElement(element: Object): Object {
  const {name, attribs, children} = element;

  transformStyle(attribs);
  rename(attribs, 'for', 'htmlFor');
  rename(attribs, 'class', 'className');
  if ('input' === name) {
    rename(attribs, 'checked', 'defaultChecked');
    rename(attribs, 'value', 'defaultValue');
  }
  let childElements = transformElements(children);

  if ('textarea' === name && childElements.length) {
    attribs.defaultValue = childElements[0];
    childElements = [];
  }

  return {type: name, props: attribs, children: childElements};
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
export function transformElements(elements: Array<Object> = []): Array<string|Object> {
  return map(reject(elements, ['type', 'comment']), el => 'text' === el.type ? el.data : transformElement(el));
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
export function flatten(...args: Array<any>): Array<any> {
  return transform(flattenDeep(args), (accumulator, value) => {
    if (!value) {
      return;
    }
    const lastIndex = accumulator.length - 1;

    if (isString(value) && isString(accumulator[lastIndex])) {
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
export function arrayToJSX(arr: Array<string|Object> = []): Array<any> {
  return map(arr, (el, key: number) => {
    if (isString(el)) {
      return el;
    }
    const {type, props, children} = el;

    return createElement(type, {...props, key}, ...arrayToJSX(children));
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
export function htmlToArray(html: string = ''): Array<string|Object> {
  html = trim(html);

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
export function htmlToJSX(html: string = ''): Array<any> {
  return arrayToJSX(htmlToArray(html));
}
