'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Markup = undefined;

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
      return (0, _reduce2.default)(this.transformers, function (result, replacer) {
        return replacer(result);
      }, html);
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

  }, {
    key: 'htmlToJSX',
    value: function htmlToJSX(html) {
      return Markup.childrenToJSX((0, _cheerio.load)(this.transform(html)).root().toArray()[0].children);
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

  }, {
    key: 'markdownToHTML',
    value: function markdownToHTML(markdown) {
      return this.transform((0, _marked2.default)(markdown));
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

  }, {
    key: 'markdownToJSX',
    value: function markdownToJSX(markdown) {
      return this.htmlToJSX((0, _marked2.default)(markdown));
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
  }]);
  return Markup;
}();