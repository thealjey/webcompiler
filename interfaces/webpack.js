/* @flow */

type WebPackStats = {
  toJson(): {
    errors: Array<string>;
    warnings: Array<string>;
  };
};
type WebPackCallback = (error: ?Error, stats: WebPackStats) => void;

declare module 'webpack' {
  declare function exports(config: Object): {
    run(WebPackCallback): void;
    outputFileSystem: any;
  };
}
