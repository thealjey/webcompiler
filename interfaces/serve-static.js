/* @flow */

declare module 'serve-static' {
  declare function exports(root: string, options?: {
    dotfiles?: string;
    etag?: boolean;
    extensions?: boolean | Array<string>;
    fallthrough?: boolean;
    index?: any;
    lastModified?: boolean;
    maxAge?: number | string;
    redirect?: boolean;
    setHeaders?: (res: Response, path: string, stat: Object) => void;
  }): ExpressMiddleware;
}
