'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Markup = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _cheerio = require('cheerio');

var _react = require('react');

var _remarkable = require('remarkable');

var _remarkable2 = _interopRequireDefault(_remarkable);

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

var _jsdom = require('jsdom');

var _noop = require('lodash/noop');

var _noop2 = _interopRequireDefault(_noop);

var _constant = require('lodash/constant');

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable lodash/prefer-lodash-method */

var md = new _remarkable2.default('full', { html: true, linkify: true, typographer: true });

// when not in the browser, polyfill specific DOM requirements of CodeMirror
if ('undefined' === typeof navigator) {
  global.window = (0, _jsdom.jsdom)().defaultView;
  global.navigator = window.navigator;
  window.document.createRange = function () {
    return { setEnd: _noop2.default, setStart: _noop2.default, getBoundingClientRect: (0, _constant2.default)({}) };
  };
  global.document = window.document;
}

// we have to use normal requires because of the import hoisting
var cm = require('codemirror');

require('codemirror/mode/jsx/jsx');

/**
 * Allows to easily and efficiently convert text from Markdown to HTML and from HTML to a collection of React Elements
 * that can be used directly in a JSX expression.
 *
 * @class Markup
 * @example
 * import {Markup} from 'webcompiler';
 *
 * const mark = new Markup();
 */

var Markup = exports.Markup = function () {
  function Markup() {
    (0, _classCallCheck3.default)(this, Markup);
  }

  (0, _createClass3.default)(Markup, [{
    key: 'htmlToJSX',


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
    value: function htmlToJSX() {
      var html = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      html = (0, _trim2.default)(html);

      return html ? Markup.childrenToJSX((0, _cheerio.load)(html).root().toArray()[0].children) : [];
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

  }, {
    key: 'markdownToHTML',
    value: function markdownToHTML() {
      var markdown = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      markdown = (0, _trim2.default)(markdown);

      return markdown ? Markup.markdownToUnwrappedHTML(markdown) : '';
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

  }, {
    key: 'markdownToJSX',
    value: function markdownToJSX() {
      var markdown = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      markdown = (0, _trim2.default)(markdown);

      return markdown ? this.htmlToJSX(Markup.markdownToUnwrappedHTML(markdown)) : [];
    }
  }], [{
    key: 'toJSXKey',

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
    value: function toJSXKey(key) {
      return (/^-ms-/.test(key) ? key.substr(1) : key).replace(/-(.)/g, function (match, chr) {
        return chr.toUpperCase();
      });
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

  }, {
    key: 'transformStyle',
    value: function transformStyle(object) {
      if ((0, _has2.default)(object, 'style')) {
        object.style = (0, _transform2.default)(object.style.split(';'), function (result, style) {
          var firstColon = style.indexOf(':'),
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

  }, {
    key: 'rename',
    value: function rename(object, fromKey, toKey) {
      if ((0, _has2.default)(object, fromKey)) {
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

  }, {
    key: 'childToJSX',
    value: function childToJSX(child, i) {
      var name = child.name;
      var attribs = child.attribs;
      var children = child.children;


      attribs.key = i;
      Markup.transformStyle(attribs);
      Markup.rename(attribs, 'for', 'htmlFor');
      Markup.rename(attribs, 'class', 'className');
      if ('input' === name) {
        Markup.rename(attribs, 'checked', 'defaultChecked');
        Markup.rename(attribs, 'value', 'defaultValue');
      }

      var childComponents = Markup.childrenToJSX(children);

      if ('textarea' === name && childComponents.length) {
        attribs.defaultValue = childComponents[0];
        childComponents = [];
      }

      return _react.createElement.apply(undefined, [name, attribs].concat((0, _toConsumableArray3.default)(childComponents)));
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

  }, {
    key: 'childrenToJSX',
    value: function childrenToJSX() {
      var children = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      return (0, _map2.default)((0, _reject2.default)(children, ['type', 'comment']), function (c, i) {
        return 'text' === c.type ? c.data : Markup.childToJSX(c, i);
      });
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

  }, {
    key: 'markdownToUnwrappedHTML',
    value: function markdownToUnwrappedHTML(markdown) {
      var html = (0, _trim2.default)(md.render(markdown));
      var dom = (0, _cheerio.load)(html);
      var children = dom.root().toArray()[0].children;


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

  }, {
    key: 'flatten',
    value: function flatten() {
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

  }, {
    key: 'highlight',
    value: function highlight(value) {
      var el = document.createElement('div');

      cm(el, { value: value, mode: { name: 'jsx', typescript: true }, scrollbarStyle: 'null', inputStyle: 'contenteditable' });

      var dom = (0, _cheerio.load)(el.innerHTML),
          lines = dom('.CodeMirror-line');

      lines.find('> span').removeAttr('style');

      return { dom: dom, lines: lines };
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

  }, {
    key: 'highlightHTML',
    value: function highlightHTML() {
      var code = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      if (!code) {
        return '';
      }

      var _Markup$highlight = Markup.highlight(code);

      var dom = _Markup$highlight.dom;
      var lines = _Markup$highlight.lines;


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

  }, {
    key: 'highlightJSX',
    value: function highlightJSX() {
      var code = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      if (!code) {
        return [];
      }

      var _Markup$highlight2 = Markup.highlight(code);

      var lines = _Markup$highlight2.lines;


      return Markup.childrenToJSX(lines.toArray());
    }
  }]);
  return Markup;
}();