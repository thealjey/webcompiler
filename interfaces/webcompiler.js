/* @flow */

import type {ProgramData, ProgramDataCallback, JSLintCallback, NativeProcessCallback,
  ObjectOrErrorCallback} from '../src/typedef';

declare module 'webcompiler' {

  declare class NativeProcess {
    constructor(task: string): void;
    run(callback: ?NativeProcessCallback, args: ?Array<string>, opts: ?Object): void;
    kill(): void;
  }

  declare class Documentation {
    constructor(config: ?Object): void;
    run(callback: () => void): void;
  }

  declare function flatten(...args: Array<any>): Array<any>;
  declare function arrayToJSX(arr: ?Array<string|Object>): Array<any>;
  declare function htmlToArray(html: ?string): Array<string|Object>;
  declare function htmlToJSX(html: ?string): Array<any>;
  declare function markdownToArray(markdown: ?string): Array<string|Object>;
  declare function markdownToJSX(markdown: ?string): Array<any>;
  declare function markdownToHTML(markdown: ?string): string;
  declare function highlightHTML(code: ?string): string;
  declare function highlightArray(code: ?string): Array<string|Object>;
  declare function highlightJSX(code: ?string): string;

  declare function watch(dir: string, type: string, callback: () => void): void;
  declare function yaml(filename: string, callback: ObjectOrErrorCallback): void;

  declare class JSLint {
    constructor(rules: ?Object): void;
    run(paths: Array<string>, callback: JSLintCallback): void;
  }

  declare class JSCompiler {
    constructor(compress: ?boolean, options: ?Object): void;
    be(inPath: string, outPath: string, callback: ?() => void): void;
    fe(inPath: string, outPath: string, callback: ?() => void): void;
  }

  declare class SASSLint {
    constructor(...excludeLinter: Array<string>): void;
    run(paths: Array<string>, callback: NativeProcessCallback): void;
  }

  declare class SASSCompiler {
    constructor(compress: ?boolean, includePaths: ?Array<string>, importOnceOptions: ?Object): void;
    static autoprefix(path: string, data: ProgramData, callback: ProgramDataCallback): void;
    fe(inPath: string, outPath: string, callback: ?() => void): void;
  }

  declare class JS {
    compiler: JSCompiler;
    constructor(compress: ?boolean, babelOptions: ?Object, lintRules: ?Object): void;
    typecheck(callback: () => void): void;
    lint(paths: Array<string>, callback: () => void): void;
    be(inPath: string, outPath: string, lintPaths: ?Array<string>, callback: ?() => void): void;
    fe(inPath: string, outPath: string, lintPaths: ?Array<string>, callback: ?() => void): void;
  }

  declare class SASS {
    compiler: SASSCompiler;
    constructor(compress: ?boolean, includePaths: ?Array<string>, excludeLinter: ?Array<string>,
                importOnceOptions: ?Object): void;
    lint(paths: Array<string>, callback: () => void): void;
    fe(inPath: string, outPath: string, lintPaths: ?Array<string>, callback: ?() => void): void;
  }

  declare class DevServer {
    constructor(script: string, style: string, devDir: string, port: ?number, react: ?boolean): void;
    watchSASS(): void;
    watchJS(): void;
    run(): void;
  }

}
