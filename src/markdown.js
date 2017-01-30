/* @flow */

import trim from 'lodash/trim';
import Remarkable from 'remarkable';
import {htmlToArray, parseHTML, htmlToJSX} from './jsx';

const md = new Remarkable('full', {html: true, linkify: true, typographer: true});

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
export function markdownToUnwrappedHTML(markdown: string): string {
  const html = trim(md.render(markdown)),
    {dom, children} = parseHTML(html);

  if (1 !== children.length) {
    return html;
  }
  const [child] = children,
    {type, name} = child;

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
export function markdownToArray(markdown: string = ''): Array<string | Object> {
  markdown = trim(markdown);

  return markdown ? htmlToArray(markdownToUnwrappedHTML(markdown)) : [];
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
export function markdownToJSX(markdown: string = ''): any[] {
  markdown = trim(markdown);

  return markdown ? htmlToJSX(markdownToUnwrappedHTML(markdown)) : [];
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
export function markdownToHTML(markdown: string = ''): string {
  markdown = trim(markdown);

  return markdown ? markdownToUnwrappedHTML(markdown) : '';
}
