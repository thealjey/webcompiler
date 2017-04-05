/* @flow */

import type {LintError, ConsoleStyleConfig, PostCSSWarning, NodeSassError} from './typedef';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import transform from 'lodash/transform';
import ErrorStackParser from 'error-stack-parser';
import cleanStack from 'clean-stack';
import {isNode} from './util';
import {relative} from 'path';

/* eslint-disable no-console */

let i = 0;

/**
 * Dead-simple, composable, isomorphic, cross-browser wrapper for `console.log`.
 *
 * <style>
 *   .console {
 *     box-shadow: 0 6px 10px 0 rgba(0,0,0,0.14), 0 1px 18px 0 rgba(0,0,0,0.12), 0 3px 5px -1px rgba(0,0,0,0.3);
 *     font-family: Consolas, Monaco, 'Andale Mono', monospace;
 *     font-size: 18px;
 *   }
 *   .console, .console .line { padding: 5px; }
 *   .console .line .in { color: #909090; }
 *   .console .line .out { color: #b3b3b3; }
 *   .console .line .string { color: #c6211d; }
 *   .console .line .bold { font-weight: bold; }
 *   .console .line .underline { text-decoration: underline; }
 *   .console .line .red { color: red; }
 *   .console .line .green { color: green; }
 *   .console .line .blue { color: blue; }
 * </style>
 * <div class="console"><div class="line"><span class="in">></span> log(<span
 * class="string">'Colorful '</span>, bold(red(<span class="string">'R'</span>), green(<span
 * class="string">'G'</span>), blue(<span class="string">'B'</span>)), <span
 * class="string">' logs are '</span>, underline(<span class="string">'very'</span>), <span
 * class="string">' easy!'</span>);</div><div class="line"><span class="out"><</span> Colorful <span class="bold"><span
 * class="red">R</span><span class="green">G</span><span class="blue">B</span></span> logs are <span
 * class="underline">very</span> easy!</div></div>
 *
 * @module logger
 */

/**
 * Provides the means for isomorphic styled output to the console.
 *
 * @class Message
 * @memberof module:logger
 * @protected
 * @param {ConsoleStyleConfig} style - a style config
 */
export class Message {

  /**
   * a style config
   *
   * @member {ConsoleStyleConfig} style
   * @memberof module:logger.Message
   * @private
   * @instance
   */
  style: ConsoleStyleConfig;

  /**
   * a message string
   *
   * @member {string} message
   * @memberof module:logger.Message
   * @instance
   */
  message: string = '';

  /**
   * css style strings
   *
   * @member {Array<string>} styles
   * @memberof module:logger.Message
   * @instance
   */
  styles: string[] = [];

  // eslint-disable-next-line require-jsdoc
  constructor(style: ConsoleStyleConfig) {
    this.style = style;
  }

  /**
   * Adds a message to be printed to the console on Node.js
   *
   * @memberof module:logger.Message
   * @instance
   * @private
   * @method addBEMessage
   * @param {string | number | module:logger.Message} msg - a message, either plain text or the response if one of the
   *                                                        style functions
   */
  addBEMessage(msg: string | number | Message) {
    const message = msg instanceof Message ? msg.message : msg,
      [start, end] = this.style.ansi;

    this.message += `${start}${message}${end}`;
  }

  /**
   * Adds a Message instance to be printed to a browser console
   *
   * @memberof module:logger.Message
   * @instance
   * @private
   * @method addFEMessageInstance
   * @param {module:logger.Message} msg - a message object
   */
  addFEMessageInstance(msg: Message) {
    const {css} = this.style;

    this.message += msg.message;
    this.styles.push(...map(msg.styles, style => `${style}${css}`));
  }

  /**
   * Adds a plain text message to be printed to a browser console
   *
   * @memberof module:logger.Message
   * @instance
   * @private
   * @method addFEMessageString
   * @param {string | number} msg - a plain text message
   */
  addFEMessageString(msg: string | number) {
    this.message += `%c${msg}`;
    this.styles.push(this.style.css);
  }

  /**
   * Adds a message
   *
   * @memberof module:logger.Message
   * @instance
   * @method addMessage
   * @param {string | number | module:logger.Message} msg - a message
   */
  addMessage(msg: string | number | Message) {
    if (isNode) {
      this.addBEMessage(msg);
    } else if (msg instanceof Message) {
      this.addFEMessageInstance(msg);
    } else {
      this.addFEMessageString(msg);
    }
  }

  /**
   * Adds messages
   *
   * @memberof module:logger.Message
   * @instance
   * @method addMessages
   * @param {Array<string | number | module:logger.Message>} messages - a collection of messages
   * @return {module:logger.Message} returns self
   */
  addMessages(messages: Array<string | number | Message>): Message {
    forEach(messages, message => this.addMessage(message));

    return this;
  }

}

/**
 * @callback ConsoleStyle
 * @memberof module:logger
 * @param {...(string | number | module:logger.Message)} messages - messages to log
 * @return {module:logger.Message} a styled message
 */

/**
 * Console style helpers.
 *
 * @memberof module:logger
 * @member {Object} consoleStyles
 * @property {module:logger.ConsoleStyle} bold          - bold text
 * @property {module:logger.ConsoleStyle} dim           - text dimmed by 20%
 * @property {module:logger.ConsoleStyle} italic        - italic text
 * @property {module:logger.ConsoleStyle} underline     - underlined text
 * @property {module:logger.ConsoleStyle} inverse       - inverted colors
 * @property {module:logger.ConsoleStyle} hidden        - invisible
 * @property {module:logger.ConsoleStyle} strikethrough - strikethrough
 * @property {module:logger.ConsoleStyle} black         - black text color
 * @property {module:logger.ConsoleStyle} red           - red text color
 * @property {module:logger.ConsoleStyle} green         - green text color
 * @property {module:logger.ConsoleStyle} yellow        - yellow text color
 * @property {module:logger.ConsoleStyle} blue          - blue text color
 * @property {module:logger.ConsoleStyle} magenta       - magenta text color
 * @property {module:logger.ConsoleStyle} cyan          - cyan text color
 * @property {module:logger.ConsoleStyle} white         - white text color
 * @property {module:logger.ConsoleStyle} gray          - gray text color
 * @property {module:logger.ConsoleStyle} grey          - gray text color
 * @property {module:logger.ConsoleStyle} bgBlack       - black background color
 * @property {module:logger.ConsoleStyle} bgRed         - red background color
 * @property {module:logger.ConsoleStyle} bgGreen       - green background color
 * @property {module:logger.ConsoleStyle} bgYellow      - yellow background color
 * @property {module:logger.ConsoleStyle} bgBlue        - blue background color
 * @property {module:logger.ConsoleStyle} bgMagenta     - magenta background color
 * @property {module:logger.ConsoleStyle} bgCyan        - cyan background color
 * @property {module:logger.ConsoleStyle} bgWhite       - white background color
 */
export const consoleStyles = transform({
  bold: {ansi: ['\u001b[1m', '\u001b[22m'], css: 'font-weight: bold;'},
  dim: {ansi: ['\u001b[2m', '\u001b[22m'], css: 'opacity: .8;'},
  italic: {ansi: ['\u001b[3m', '\u001b[23m'], css: 'font-style: italic;'},
  underline: {ansi: ['\u001b[4m', '\u001b[24m'], css: 'text-decoration: underline;'},
  inverse: {ansi: ['\u001b[7m', '\u001b[27m'],
    css: '-moz-filter: invert(100%); -webkit-filter: invert(100%); filter: invert(100%);'},
  hidden: {ansi: ['\u001b[8m', '\u001b[28m'], css: 'visibility: hidden;'},
  strikethrough: {ansi: ['\u001b[9m', '\u001b[29m'], css: 'text-decoration: line-through;'},
  black: {ansi: ['\u001b[30m', '\u001b[39m'], css: 'color: black;'},
  red: {ansi: ['\u001b[31m', '\u001b[39m'], css: 'color: red;'},
  green: {ansi: ['\u001b[32m', '\u001b[39m'], css: 'color: green;'},
  yellow: {ansi: ['\u001b[33m', '\u001b[39m'], css: 'color: yellow;'},
  blue: {ansi: ['\u001b[34m', '\u001b[39m'], css: 'color: blue;'},
  magenta: {ansi: ['\u001b[35m', '\u001b[39m'], css: 'color: magenta;'},
  cyan: {ansi: ['\u001b[36m', '\u001b[39m'], css: 'color: cyan;'},
  white: {ansi: ['\u001b[37m', '\u001b[39m'], css: 'color: white;'},
  gray: {ansi: ['\u001b[90m', '\u001b[39m'], css: 'color: gray;'},
  grey: {ansi: ['\u001b[90m', '\u001b[39m'], css: 'color: gray;'},
  bgBlack: {ansi: ['\u001b[40m', '\u001b[49m'], css: 'background-color: black;'},
  bgRed: {ansi: ['\u001b[41m', '\u001b[49m'], css: 'background-color: red;'},
  bgGreen: {ansi: ['\u001b[42m', '\u001b[49m'], css: 'background-color: green;'},
  bgYellow: {ansi: ['\u001b[43m', '\u001b[49m'], css: 'background-color: yellow;'},
  bgBlue: {ansi: ['\u001b[44m', '\u001b[49m'], css: 'background-color: blue;'},
  bgMagenta: {ansi: ['\u001b[45m', '\u001b[49m'], css: 'background-color: magenta;'},
  bgCyan: {ansi: ['\u001b[46m', '\u001b[49m'], css: 'background-color: cyan;'},
  bgWhite: {ansi: ['\u001b[47m', '\u001b[49m'], css: 'background-color: white;'}
}, (result, value, key) => {
  result[key] = (...messages) => new Message(value).addMessages(messages);
}, {});

/**
 * Formats an error line with colors.
 *
 * @memberof module:logger
 * @private
 * @function formatLine
 * @param {string}          message - error message
 * @param {string}          file    - offending file
 * @param {number | string} line    - offending line
 * @param {number | string} column  - offending column
 * @return {Array<string | module:logger.Message>} styled messages
 */
export function formatLine(message: string, file: string, line: number | string,
                           column: number | string): Array<string | Message> {
  const {yellow, cyan, magenta} = consoleStyles;

  return ['"', yellow(message), '" in ', cyan(relative('', file)), ' on ', magenta(line), ':', magenta(column)];
}

/**
 * Returns a string "Error" styled as a bold white text on a red background, ready to be printed to the console.
 *
 * @memberof module:logger
 * @private
 * @function formatErrorMarker
 * @param {string} [message="Error"] - a message to apply styles to
 * @return {module:logger.Message} a styled message
 */
export function formatErrorMarker(message: string = 'Error') {
  const {bold, bgRed, white} = consoleStyles;

  return bgRed(bold(white(message)));
}

/**
 * Log colorful messages out to the console on Node.js as well as in a browser in the simplest and most composable way.
 *
 * @memberof module:logger
 * @function log
 * @param {...(string | number | module:logger.Message)} messages - messages to log
 * @example
 * import {log, consoleStyles} from 'webcompiler';
 * // or - import {log, consoleStyles} from 'webcompiler/lib/logger';
 * // or - var webcompiler = require('webcompiler');
 * //      var log = webcompiler.log;
 * //      var consoleStyles = webcompiler.consoleStyles;
 * // or - var logger = require('webcompiler/lib/logger');
 * //      var log = logger.log;
 * //      var consoleStyles = logger.consoleStyles;
 *
 * const {red, green, blue, bold, underline} = consoleStyles;
 *
 * log('Colorful ', bold(red('R'), green('G'), blue('B')), ' logs are ', underline('very'), ' easy!');
 */
export function log(...messages: Array<string | number | Message>) {
  const {message, styles} = new Message({ansi: ['', ''], css: ''}).addMessages(messages);

  console.log(message, ...styles);
}

/**
 * Prints an Error object out to the console.
 *
 * Removes irrelevant entries from its stack trace that point to Node.js system files that you would never debug anyway
 * and hence are irrelevant.
 *
 * @memberof module:logger
 * @function logError
 * @param {Error} error - an error object
 * @example
 * import {logError} from 'webcompiler';
 * // or - import {logError} from 'webcompiler/lib/logger';
 * // or - var logError = require('webcompiler').logError;
 * // or - var logError = require('webcompiler/lib/logger').logError;
 *
 * logError(new Error('Some error message'));
 */
export function logError(error: Error) {
  const {name, message, stack} = error;

  log(formatErrorMarker(name), ': ', message);

  error.stack = cleanStack(stack);

  forEach(ErrorStackParser.parse(error), ({functionName = 'unknown', fileName, lineNumber, columnNumber}) => {
    log('  • ', ...formatLine(functionName, fileName, lineNumber, columnNumber));
  });
}

/**
 * Prints PostCSS Warning objects out to the console.
 *
 * @memberof module:logger
 * @function logPostCSSWarnings
 * @param {Array<PostCSSWarning>} warnings - warning objects
 * @example
 * import {logPostCSSWarnings} from 'webcompiler';
 * // or - import {logPostCSSWarnings} from 'webcompiler/lib/logger';
 * // or - var logPostCSSWarnings = require('webcompiler').logPostCSSWarnings;
 * // or - var logPostCSSWarnings = require('webcompiler/lib/logger').logPostCSSWarnings;
 * import postcss from 'postcss';
 *
 * postcss(...).process(...).then(result => {
 *   const warnings = result.warnings();
 *
 *   if (warnings.length) {
 *     return logPostCSSWarnings(warnings);
 *   }
 *   ...
 * });
 */
export function logPostCSSWarnings(warnings: PostCSSWarning[]) {
  forEach(warnings, ({text, plugin, node, line, column}) => {
    log(formatErrorMarker('Warning'), ': ', ...formatLine(`${text}(${plugin})`, node.source.input.file, line, column));
  });
  log('PostCSS warnings: ', warnings.length);
}

/**
 * Prints a Node SASS error object out to the console.
 *
 * @memberof module:logger
 * @function logSASSError
 * @param {NodeSassError} error - error object
 * @example
 * import {logSASSError} from 'webcompiler';
 * // or - import {logSASSError} from 'webcompiler/lib/logger';
 * // or - var logSASSError = require('webcompiler').logSASSError;
 * // or - var logSASSError = require('webcompiler/lib/logger').logSASSError;
 * import {render} from 'node-sass';
 *
 * render(..., (error, result) => {
 *   if (error) {
 *     return logSASSError(error);
 *   }
 *   ...
 * });
 */
export function logSASSError({message, file, line, column}: NodeSassError) {
  log(formatErrorMarker('SASS error'), ': ', ...formatLine(message, file, line, column));
}

/**
 * Prints linting errors out to the console.
 *
 * @memberof module:logger
 * @function logLintingErrors
 * @param {Array<LintError>} errors        - error objects
 * @param {string}           [prefix=null] - will be printed on the last line along with the total number of messages
 * @example
 * import {logLintingErrors} from 'webcompiler';
 * // or - import {logLintingErrors} from 'webcompiler/lib/logger';
 * // or - var logLintingErrors = require('webcompiler').logLintingErrors;
 * // or - var logLintingErrors = require('webcompiler/lib/logger').logLintingErrors;
 */
export function logLintingErrors(errors: LintError[], prefix: ?string = null) {
  forEach(errors, ({message, rule, file, line, column}) => {
    log(formatErrorMarker(), ': ', ...formatLine(`${message}${rule ? ` (${rule})` : ''}`, file, line, column));
  });
  log(prefix ? `${prefix} l` : 'L', 'inting errors: ', errors.length);
}

/**
 * Within the current process logs green colored messages out to the console prepending a sequential number starting
 * with "1." to the message, to make it easier to distinguish messages containing the same text.
 *
 * @memberof module:logger
 * @function logSequentialSuccessMessage
 * @param {string} message - a message to log
 * @example
 * import {logSequentialSuccessMessage} from 'webcompiler';
 * // or - import {logSequentialSuccessMessage} from 'webcompiler/lib/logger';
 * // or - var logSequentialSuccessMessage = require('webcompiler').logSequentialSuccessMessage;
 * // or - var logSequentialSuccessMessage = require('webcompiler/lib/logger').logSequentialSuccessMessage;
 */
export function logSequentialSuccessMessage(message: string) {
  const {green} = consoleStyles;

  log(green(++i, '. ', message));
}
