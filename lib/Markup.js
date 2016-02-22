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

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _reject = require('lodash/reject');

var _reject2 = _interopRequireDefault(_reject);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _transform = require('lodash/transform');

var _transform2 = _interopRequireDefault(_transform);

var _has = require('lodash/has');

var _has2 = _interopRequireDefault(_has);

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _flattenDeep = require('lodash/flattenDeep');

var _flattenDeep2 = _interopRequireDefault(_flattenDeep);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _trim = require('lodash/trim');

var _trim2 = _interopRequireDefault(_trim);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var Markup = exports.Markup = function () {

  /** @constructs */

  function Markup() {
    (0, _classCallCheck3.default)(this, Markup);

    for (var _len = arguments.length, transformers = Array(_len), _key = 0; _key < _len; _key++) {
      transformers[_key] = arguments[_key];
    }

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

  /**
   * an array of Transformer functions
   *
   * @member {Array<Transformer>} transformers
   * @memberof Markup
   * @private
   * @instance
   */


  (0, _createClass3.default)(Markup, [{
    key: 'transform',


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
    value: function transform(html) {
      return (0, _reduce2.default)(this.transformers, function (result, transformer) {
        return transformer(result);
      }, html);
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

  }, {
    key: 'htmlToJSX',
    value: function htmlToJSX() {
      var html = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      html = (0, _trim2.default)(html);
      return html ? Markup.childrenToJSX((0, _cheerio.load)(this.transform(html)).root().toArray()[0].children) : [];
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
      return markdown ? (0, _trim2.default)(this.transform(Markup.markdownToUnwrappedHTML(markdown))) : '';
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
      var html = (0, _trim2.default)((0, _marked2.default)(markdown));
      var dom = (0, _cheerio.load)(html);
      var children = dom.root().toArray()[0].children;


      return 1 === children.length && 'tag' === children[0].type && 'p' === children[0].name ? dom('p').html() : html;
    }

    /**
     * Recursively flattens `args`, removes falsy value and combines string values.
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
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
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
  }]);
  return Markup;
}();