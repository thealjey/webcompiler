/* @flow */

import type {CheerioNode, CheerioElement, Transformer} from './typedef';
import {load} from 'cheerio';
import {createElement} from 'react';
import marked from 'marked';
import reject from 'lodash/reject';
import map from 'lodash/map';
import transform from 'lodash/transform';
import has from 'lodash/has';
import reduce from 'lodash/reduce';
import flattenDeep from 'lodash/flattenDeep';
import isString from 'lodash/isString';
import trim from 'lodash/trim';
import {jsdom} from 'jsdom';
import noop from 'lodash/noop';
import constant from 'lodash/constant';

/* eslint-disable no-arrow-condition */
/* eslint-disable lodash/prefer-lodash-method */

// when not in the browser, polyfill specific DOM requirements of CodeMirror
if ('undefined' === typeof navigator) {
  global.window = jsdom().defaultView;
  global.navigator = window.navigator;
  window.document.createRange = () => ({setEnd: noop, setStart: noop, getBoundingClientRect: constant({})});
  global.document = window.document;
}

// we have to use normal requires because of the import hoisting
const cm = require('codemirror');

require('codemirror/mode/jsx/jsx');

/**
 * Allows to easily and efficiently convert text from Markdown to HTML and from HTML to a collection of React Elements
 * that can be used directly in a JSX expression.
 *
 * Whenever an HTML string is involved, runs it through an array of Transformer functions.
 *
 * @class Markup
 * @param {...Transformer} transformers - transformers to initialize with
 * @example
 * import {Markup} from 'webcompiler';
 *
 * const mark = new Markup();
 */
export class Markup {
  /**
   * an array of Transformer functions
   *
   * @member {Array<Transformer>} transformers
   * @memberof Markup
   * @private
   * @instance
   */
  transformers: Array<Transformer>;

  /** @constructs */
  constructor(...transformers: Array<Transformer>) {
    this.transformers = transformers;
  }

  /**
   * Convert the CSS style key to a JSX style key
   *
   * @memberof Markup
   * @static
   * @private
   * @method toJSXKey
   * @param {string} key - CSS style key
   * @return {string} JSX style key
   * @example
   * Markup.toJSXKey('min-width'); // minWidth
   */
  static toJSXKey(key: string): string {
    return (/^-ms-/.test(key) ? key.substr(1) : key).replace(/-(.)/g, (match, chr) => chr.toUpperCase());
  }

  /**
   * Parse the specified inline style attribute value
   *
   * @memberof Markup
   * @static
   * @private
   * @method transformStyle
   * @param {Object} object - the object to perform replacements on
   */
  static transformStyle(object: Object) {
    if (has(object, 'style')) {
      object.style = transform(object.style.split(';'), (result, style) => {
        const firstColon = style.indexOf(':'),
          key = style.substr(0, firstColon).trim();

        if (key) {
          result[Markup.toJSXKey(key.toLowerCase())] = style.substr(firstColon + 1).trim();
        }
      }, {});
    }
  }

  /**
   * Renames specified attributes if present
   *
   * @memberof Markup
   * @static
   * @private
   * @method rename
   * @param {Object} object  - the object to perform replacements on
   * @param {string} fromKey - a key to look for
   * @param {string} toKey   - a key to rename to
   */
  static rename(object: Object, fromKey: string, toKey: string) {
    if (has(object, fromKey)) {
      object[toKey] = object[fromKey];
      delete object[fromKey];
    }
  }

  /**
   * Converts a DOM Element to a React Element
   *
   * @memberof Markup
   * @static
   * @private
   * @method childToJSX
   * @param {CheerioElement} child - the DOM Element to convert to a React Element
   * @param {number}         i     - positional index of the element
   * @return {ReactElement} React Element
   */
  static childToJSX(child: CheerioElement, i: number): any {
    const {name, attribs, children} = child;

    attribs.key = i;
    Markup.transformStyle(attribs);
    Markup.rename(attribs, 'for', 'htmlFor');
    Markup.rename(attribs, 'class', 'className');
    if ('input' === name) {
      Markup.rename(attribs, 'checked', 'defaultChecked');
      Markup.rename(attribs, 'value', 'defaultValue');
    }

    let childComponents = Markup.childrenToJSX(children);

    if ('textarea' === name && childComponents.length) {
      attribs.defaultValue = childComponents[0];
      childComponents = [];
    }

    return createElement(name, attribs, ...childComponents);
  }

  /**
   * Converts an array of DOM Elements to an array of React Elements
   *
   * @memberof Markup
   * @static
   * @private
   * @method childrenToJSX
   * @param {Array<CheerioNode>} children - the DOM Element to convert to a React element
   * @return {Array<ReactElement>} an array of React Elements
   */
  static childrenToJSX(children: Array<CheerioNode> = []): Array<any> {
    return map(reject(children, ['type', 'comment']), (c, i) => 'text' === c.type ? c.data : Markup.childToJSX(c, i));
  }

  /**
   * If a simple single line string is passed to the Markdown parser it thinks that it's a paragraph (it sort of
   * technically is) and unnecessarily wraps it into `<p></p>`, which most often is not the desired behavior.
   *
   * This function converts Markdown to HTML and then removes the wrapping paragraph if it is the only top level tag
   * unwrapping its contents.
   *
   * @memberof Markup
   * @static
   * @private
   * @method markdownToUnwrappedHTML
   * @param {string} markdown - an arbitrary Markdown string
   * @return {string} an HTML string
   */
  static markdownToUnwrappedHTML(markdown: string): string {
    const html = trim(marked(markdown)),
      dom = load(html),
      {children} = dom.root().toArray()[0];

    return 1 === children.length && 'tag' === children[0].type && 'p' === children[0].name ? dom('p').html() : html;
  }

  /**
   * Recursively flattens `args`, removes falsy values and combines string values.
   *
   * Can be used as a simple optimization step on the JSX children-to-be to simplify the resulting DOM structure by
   * joining adjacent text nodes together.
   *
   * @memberof Markup
   * @static
   * @method flatten
   * @param {...*} args - the input array
   * @return {Array<*>} the flattened result
   * @example
   * Markup.flatten('lorem ', ['ipsum ', ['dolor ', ['sit ', ['amet']]]]); // ["lorem ipsum dolor sit amet"]
   */
  static flatten(...args: Array<any>): Array<any> {
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
   * Using the CodeMirror editor highlights a string of text representing JavaScript program code.
   *
   * DOM independent and works equally well in the browser and on Node.js (4.0.0+).
   *
   * @memberof Markup
   * @static
   * @private
   * @method highlight
   * @param {string} value - any valid ES2015, TypeScript, JSX, Flow code
   * @return {Object} an object containing a CheerioDOM object and a CheerioCollection of the `pre.CodeMirror-line`
   *                  elements
   */
  static highlight(value: string): {dom: any, lines: any} {
    const el = document.createElement('div');

    cm(el, {value, mode: {name: 'jsx', typescript: true}, scrollbarStyle: 'null', inputStyle: 'contenteditable'});

    const dom = load(el.innerHTML),
      lines = dom('.CodeMirror-line');

    lines.find('> span').removeAttr('style');

    return {dom, lines};
  }

  /**
   * Using the CodeMirror editor highlights a string of text representing JavaScript program code and returns an HTML
   * string.
   *
   * DOM independent and works equally well in the browser and on Node.js (4.0.0+).
   *
   * @memberof Markup
   * @static
   * @method highlightHTML
   * @param {string} [code=""] - any valid ES2015, TypeScript, JSX, Flow code
   * @return {string} an HTML string of the `pre.CodeMirror-line` elements
   * @example
   * Markup.highlightHTML('function myScript(){return 100;}'); // <pre class="CodeMirror-line">...</pre>
   */
  static highlightHTML(code: string = ''): string {
    if (!code) {
      return '';
    }
    const {dom, lines} = Markup.highlight(code);

    return dom.html(lines);
  }

  /**
   * Using the CodeMirror editor highlights a string of text representing JavaScript program code and returns an array
   * of React elements.
   *
   * DOM independent and works equally well in the browser and on Node.js (4.0.0+).
   *
   * @memberof Markup
   * @static
   * @method highlightJSX
   * @param {string} [code=""] - any valid ES2015, TypeScript, JSX, Flow code
   * @return {Array<ReactElement>} React elements of the `pre.CodeMirror-line` elements
   * @example
   * <div className="CodeMirror cm-s-monokai">{Markup.highlightJSX('function myScript(){return 100;}')}</div>
   */
  static highlightJSX(code: string = ''): Array<any> {
    if (!code) {
      return [];
    }
    const {lines} = Markup.highlight(code);

    return Markup.childrenToJSX(lines.toArray());
  }

  /**
   * Runs the html string through an array of Transformer functions
   *
   * @memberof Markup
   * @instance
   * @private
   * @method transform
   * @param {string} html - an arbitrary HTML string
   * @return {string} a transformed string
   */
  transform(html: string): string {
    return reduce(this.transformers, (result, transformer) => transformer(result), html);
  }

  /**
   * Converts an arbitrary HTML string to an array of React Elements
   *
   * @memberof Markup
   * @instance
   * @method htmlToJSX
   * @param {string} [html=""] - an arbitrary HTML string
   * @return {Array<ReactElement>} an array of React Elements
   * @example
   * <div>{mark.htmlToJSX('Hello <span>world!</span>')}</div>
   */
  htmlToJSX(html: string = ''): Array<any> {
    html = trim(html);
    return html ? Markup.childrenToJSX(load(this.transform(html)).root().toArray()[0].children) : [];
  }

  /**
   * Converts an arbitrary Markdown string to an HTML string
   *
   * @memberof Markup
   * @instance
   * @method markdownToHTML
   * @param {string} [markdown=""] - an arbitrary Markdown string
   * @return {string} an HTML string
   * @example
   * mark.markdownToHTML('# Hello world!'); // <h1>Hello world!</h1>
   */
  markdownToHTML(markdown: string = ''): string {
    markdown = trim(markdown);
    return markdown ? trim(this.transform(Markup.markdownToUnwrappedHTML(markdown))) : '';
  }

  /**
   * Converts an arbitrary Markdown string to an array of React Elements
   *
   * @memberof Markup
   * @instance
   * @method markdownToJSX
   * @param {string} [markdown=""] - an arbitrary Markdown string
   * @return {Array<ReactElement>} an array of React Elements
   * @example
   * <div>{mark.markdownToJSX('# Hello world!')}</div>
   */
  markdownToJSX(markdown: string = ''): Array<any> {
    markdown = trim(markdown);
    return markdown ? this.htmlToJSX(Markup.markdownToUnwrappedHTML(markdown)) : [];
  }

}
