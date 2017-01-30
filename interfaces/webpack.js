/* @flow */

type WebPackStats = {
  toJson(): {
    errors: string[];
    warnings: string[];
  };
};
type WebPackCallback = (error: ?Error, stats: WebPackStats) => void;

declare module 'webpack' {
  declare function exports(config: Object): {
    run(WebPackCallback): void;
    outputFileSystem: any;
  };
}
