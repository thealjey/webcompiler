'use strict';

exports.__esModule = true;
exports.markdownToUnwrappedHTML = markdownToUnwrappedHTML;
exports.markdownToArray = markdownToArray;
exports.markdownToJSX = markdownToJSX;
exports.markdownToHTML = markdownToHTML;

var _trim = require('lodash/trim');

var _trim2 = _interopRequireDefault(_trim);

var _remarkable = require('remarkable');

var _remarkable2 = _interopRequireDefault(_remarkable);

var _jsx = require('./jsx');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const md = new _remarkable2.default('full', { html: true, linkify: true, typographer: true });

/**
 * Useful utilities for working with Markdown.
 *
 * @module markdown
 */

/**
 * If a simple single line string is passed to the Markdown parser it thinks that it's a paragraph (it sort of
 * technically is) and unnecessarily wraps it into `<p></p>`, which most often is not the desired behavior.
 *
 * This function converts Markdown to HTML and then removes the wrapping paragraph if it is the only top level tag
 * unwrapping its contents.
 *
 * @memberof module:markdown
 * @private
 * @method markdownToUnwrappedHTML
 * @param {string} markdown - an arbitrary Markdown string
 * @return {string} an HTML string
 */


function markdownToUnwrappedHTML(markdown) {
  const html = (0, _trim2.default)(md.render(markdown)),
        { dom, children } = (0, _jsx.parseHTML)(html);

  if (1 !== children.length) {
    return html;
  }
  const [child] = children,
        { type, name } = child;

  return 'tag' === type && 'p' === name ? dom(child).html() : html;
}

/**
 * Converts an arbitrary Markdown string to an array of plain objects describing React Elements for easy
 * serialization/unserialization.
 *
 * @memberof module:markdown
 * @method markdownToArray
 * @param {string} [markdown=""] - an arbitrary Markdown string
 * @return {Array<string|Object>} an array of plain objects describing React Elements
 * @example
 * import {markdownToArray} from 'webcompiler';
 * // or - import {markdownToArray} from 'webcompiler/lib/markdown';
 * // or - var markdownToArray = require('webcompiler').markdownToArray;
 * // or - var markdownToArray = require('webcompiler/lib/markdown').markdownToArray;
 *
 * markdownToArray('# Hello world!'); // [{type: 'h1', children: ['Hello world!']}]
 */
function markdownToArray(markdown = '') {
  markdown = (0, _trim2.default)(markdown);

  return markdown ? (0, _jsx.htmlToArray)(markdownToUnwrappedHTML(markdown)) : [];
}

/**
 * Converts an arbitrary Markdown string to an array of React Elements
 *
 * @memberof module:markdown
 * @method markdownToJSX
 * @param {string} [markdown=""] - an arbitrary Markdown string
 * @return {Array<ReactElement>} an array of React Elements
 * @example
 * import {markdownToJSX} from 'webcompiler';
 * // or - import {markdownToJSX} from 'webcompiler/lib/markdown';
 * // or - var markdownToJSX = require('webcompiler').markdownToJSX;
 * // or - var markdownToJSX = require('webcompiler/lib/markdown').markdownToJSX;
 *
 * <div>{markdownToJSX('# Hello world!')}</div>
 */
function markdownToJSX(markdown = '') {
  markdown = (0, _trim2.default)(markdown);

  return markdown ? (0, _jsx.htmlToJSX)(markdownToUnwrappedHTML(markdown)) : [];
}

/**
 * Converts an arbitrary Markdown string to an HTML string
 *
 * @memberof module:markdown
 * @method markdownToHTML
 * @param {string} [markdown=""] - an arbitrary Markdown string
 * @return {string} an HTML string
 * @example
 * import {markdownToHTML} from 'webcompiler';
 * // or - import {markdownToHTML} from 'webcompiler/lib/markdown';
 * // or - var markdownToHTML = require('webcompiler').markdownToHTML;
 * // or - var markdownToHTML = require('webcompiler/lib/markdown').markdownToHTML;
 *
 * markdownToHTML('# Hello world!'); // <h1>Hello world!</h1>
 */
function markdownToHTML(markdown = '') {
  markdown = (0, _trim2.default)(markdown);

  return markdown ? markdownToUnwrappedHTML(markdown) : '';
}