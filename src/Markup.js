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

/* eslint-disable no-arrow-condition */

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
   * @param {string} html - an arbitrary HTML string
   * @return {Array<ReactElement>} an array of React Elements
   * @example
   * const children = mark.htmlToJSX('Hello <span>world!</span>');
   *
   * return <div>{children}</div>;
   */
  htmlToJSX(html: string): Array<any> {
    return Markup.childrenToJSX(load(this.transform(html)).root().toArray()[0].children);
  }

  /**
   * Converts an arbitrary Markdown string to an HTML string
   *
   * @memberof Markup
   * @instance
   * @method markdownToHTML
   * @param {string} markdown - an arbitrary Markdown string
   * @return {string} an HTML string
   * @example
   * mark.markdownToHTML('# Hello world!'); // <h1>Hello world!</h1>
   */
  markdownToHTML(markdown: string): string {
    return this.transform(marked(markdown));
  }

  /**
   * Converts an arbitrary Markdown string to an array of React Elements
   *
   * @memberof Markup
   * @instance
   * @method markdownToJSX
   * @param {string} markdown - an arbitrary Markdown string
   * @return {Array<ReactElement>} an array of React Elements
   * @example
   * const header = mark.markdownToJSX('# Hello world!');
   *
   * return <div>{header}</div>;
   */
  markdownToJSX(markdown: string): Array<any> {
    return this.htmlToJSX(marked(markdown));
  }

}
