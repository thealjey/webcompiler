type NativeProcessCallback = (stderr: ?string, stdout: string) => void;
type DocumentationConfig = {inputDir?: string, outputDir?: string, readMe?: string, template?: string,
  jsdocConfig: ?string};
type YAMLCallback = (error: ?string, data: Object) => void;
type JSLintError = {message: string, ruleId?: string, filePath: string, line: number, column: number};
type JSLintCallback = (errors: ?Array<JSLintError>) => void;
type ProgramData = {code: string, map: string};
type AutoprefixCallback = (data: ProgramData) => void;

declare module 'webcompiler' {

  declare class NativeProcess {
    constructor(task: string): void;
    run(callback: ?NativeProcessCallback, args: ?Array<string>, opts: ?Object): void;
    kill(): void;
  }

  declare class Documentation {
    constructor(config: ?DocumentationConfig): void;
    run(callback: () => void): void;
  }

  declare function watch(dir: string, type: string, callback: () => void): void;
  declare function yaml(filename: string, callback: YAMLCallback): void;

  declare class JS {
    constructor(compress: ?boolean, babelOptions: ?Object, lintRules: ?Object): void;
    typecheck(callback: () => void): void;
    lint(paths: Array<string>, callback: () => void): void;
    be(inPath: string, outPath: string, lintPaths: ?Array<string>, callback: ?() => void): void;
    fe(inPath: string, outPath: string, lintPaths: ?Array<string>, callback: ?() => void): void;
  }

  declare class SASS {
    constructor(compress: ?boolean, includePaths: ?Array<string>, excludeLinter: ?Array<string>,
                importOnceOptions: ?Object): void;
    lint(paths: Array<string>, callback: () => void): void;
    fe(inPath: string, outPath: string, lintPaths: ?Array<string>, callback: ?() => void): void;
  }

  declare class DevServer {
    constructor(script: string, style: string, devDir: string, port: ?number, react: ?boolean): void;
    watchSASS(watchDir: string): void;
    watchJS(): void;
    run(watchDir: string): void;
  }

  declare class JSLint {
    constructor(rules: ?Object): void;
    run(paths: Array<string>, callback: JSLintCallback): void;
  }

  declare class JSCompiler {
    constructor(compress: ?boolean, options: ?Object): void;
    minify(path: string, data: ProgramData): ProgramData;
    be(inPath: string, outPath: string, callback: ?() => void): void;
    fe(inPath: string, outPath: string, callback: ?() => void): void;
  }

  declare class SASSLint {
    constructor(...excludeLinter: Array<string>): void;
    run(paths: Array<string>, callback: NativeProcessCallback): void;
  }

  declare class SASSCompiler {
    constructor(compress: ?boolean, includePaths: ?Array<string>, importOnceOptions: ?Object): void;
    minify(path: string, data: ProgramData): ?ProgramData;
    autoprefix(path: string, data: ProgramData, callback: AutoprefixCallback): void;
    fe(inPath: string, outPath: string, callback: ?() => void): void;
  }

}
