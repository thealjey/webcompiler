type PostCSSResult = {css: string, map: Object, warnings: () => Array<string>};
type PostCSSPromise = {then: (callback: (result: PostCSSResult) => void) => void};

declare module 'postcss' {
  declare var exports: (plugins: Array<any>) => {process: (code: string, config: Object) => PostCSSPromise};
}
