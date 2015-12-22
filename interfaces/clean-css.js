type CleanCSSResult = {errors: Array<string>, warnings: Array<string>, styles: string, sourceMap: string};

declare module 'clean-css' {
  declare class exports {
    constructor(config: Object): void;
    minify(code: string): CleanCSSResult;
  }
}
