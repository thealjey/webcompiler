/* @flow */

/**
 * Processed application code with source maps
 *
 * @typedef {Object} ProgramData
 * @property {string} code - program code
 * @property {string} map  - source map json string
 */
export type ProgramData = {code: string, map: string};

/**
 * The JavaScript linting error object
 *
 * @typedef {Object} JSLintError
 * @property {string} message  - the error message
 * @property {string} [ruleId] - the relative linting rule
 * @property {string} filePath - the path to a file
 * @property {number} line     - the offending line number
 * @property {number} column   - the offending column number
 */
export type JSLintError = {message: string, ruleId?: string, filePath: string, line: number, column: number};

/**
 * A dumbed down representation of a DOM Node
 *
 * @typedef {Object} CheerioNode
 * @property {string} type - either "comment", "text" or "tag"
 */
export type CheerioNode = {type: string};

/**
 * A dumbed down representation of a DOM Element
 *
 * @typedef {Object} CheerioElement
 * @property {string}             type       - "tag"
 * @property {string}             name       - the tag name (e.g. "div")
 * @property {Object}             attribs    - the tag attributes (e.g. {style: 'min-width:50px'})
 * @property {Array<CheerioNode>} [children] - an array of child nodes
 * @property {CheerioNode}        [next]     - the next sibling node
 * @property {CheerioNode}        [prev]     - the previous sibling node
 * @property {CheerioElement}     [parent]   - the parent element
 */
export type CheerioElement = {type: string, name: string, attribs: Object, children?: Array<CheerioNode>,
  next: ?CheerioNode, prev: ?CheerioNode, parent: ?CheerioElement};

/**
 * A dumbed down representation of a DOM Text or a Comment Nodes
 *
 * @typedef {Object} CheerioText
 * @property {string}         type     - either "text" or "comment"
 * @property {string}         data     - the textual content of the node
 * @property {CheerioNode}    [next]   - the next sibling node
 * @property {CheerioNode}    [prev]   - the previous sibling node
 * @property {CheerioElement} [parent] - the parent element
 */
export type CheerioText = {type: string, data: string, next: ?CheerioNode, prev: ?CheerioNode, parent: ?CheerioElement};

/**
 * Documentation generator configuration object
 *
 * @typedef {Object} DocumentationConfig
 * @property {string} [inputDir="src"]     - the input application code directory
 * @property {string} [outputDir="docs"]   - the output directory for the generated documentation
 * @property {string} [readMe="README.md"] - the documentation "homepage" (README.md file)
 * @property {string} [template="node_modules/ink-docstrap/template"]      - a full system path to a valid JSDoc3
 *                                                                           template directory
 * @property {string} [jsdocConfig="<webcompiler root>/config/jsdoc.json"] - a full system path to a JSDoc3
 *                                                                           configuration file
 */

/**
 * @callback ProgramDataCallback
 * @param {ProgramData} data - the program data
 */
export type ProgramDataCallback = (data: ProgramData) => void;

/**
 * @callback FileCallback
 * @param {string} file - a full system path to a file
 */
export type FileCallback = (file: string) => void;

/**
 * @callback NullableFileCallback
 * @param {string} [file] - a full system path to a file
 */
export type NullableFileCallback = (file: ?string) => void;

/**
 * @callback JSLintCallback
 * @param {Array<JSLintError>} [errors] - a collection of error objects
 */
export type JSLintCallback = (errors: ?Array<JSLintError>) => void;

/**
 * @callback NativeProcessCallback
 * @param {string} [stderr] - an error message
 * @param {string} stdout   - the process output
 */
export type NativeProcessCallback = (stderr: ?string, stdout: string) => void;

/**
 * @callback ObjectOrErrorCallback
 * @param {string} [error] - an error message
 * @param {Object} result  - the resulting object
 */
export type ObjectOrErrorCallback = (error: ?string, result: Object) => void;
