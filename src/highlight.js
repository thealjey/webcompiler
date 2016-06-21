/* @flow */

import {jsdom} from 'jsdom';
import noop from 'lodash/noop';
import constant from 'lodash/constant';
import {load} from 'cheerio';
import {transformElements, arrayToJSX} from './jsx';

/**
 * CodeMirror syntax highlighting that works in the browser and on Node.js
 *
 * @module highlight
 */

// when not in the browser, polyfill specific DOM requirements of CodeMirror
if ('undefined' === typeof navigator) {
  global.window = jsdom().defaultView;
  global.navigator = window.navigator;
  window.document.createRange = constant({setEnd: noop, setStart: noop, getBoundingClientRect: constant({})});
  global.document = window.document;
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
export function highlight(value: string): {dom: any; lines: any} {
  const el = document.createElement('div');

  cm(el, {value, mode: {name: 'jsx', typescript: true}, scrollbarStyle: 'null', inputStyle: 'contenteditable'});

  const dom = load(el.innerHTML),
    lines = dom('.CodeMirror-line');

  /* eslint-disable lodash/prefer-lodash-method */
  lines.find('> span').removeAttr('style');

  /* eslint-enable lodash/prefer-lodash-method */

  return {dom, lines};
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
export function highlightHTML(code: string = ''): string {
  if (!code) {
    return '';
  }
  const {dom, lines} = highlight(code);

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
export function highlightArray(code: string = ''): Array<string|Object> {
  if (!code) {
    return [];
  }
  const {lines} = highlight(code);

  return transformElements(lines.toArray());
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
export function highlightJSX(code: string = ''): Array<any> {
  return arrayToJSX(highlightArray(code));
}
