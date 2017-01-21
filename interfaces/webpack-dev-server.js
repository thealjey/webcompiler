/* @flow */

declare module 'webpack-dev-server' {
  declare class exports {
    app: ExpressApplication;
    constructor(webpack: Object): void;
    use(...callback: Array<ExpressMiddleware>): void;
    listen(port: number, host: string, callback: (error: ?Error) => void): void;
  }
}
