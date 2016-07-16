/* @flow */

/* eslint-disable no-unused-vars */

import EventEmitter from 'events';

declare class Request {
  app: ExpressApplication;
  baseUrl: string;
  body: any;
  cookies: Object;
  fresh: boolean;
  hostname: string;
  ip: string;
  ips: Array<string>;
  method: string;
  params: Object|Array<any>;
  path: string;
  protocol: string;
  query: Object;
  route: Object;
  secure: boolean;
  signedCookies: Object;
  stale: boolean;
  subdomains: Array<string>;
  xhr: boolean;
  accepts(types: string|Array<string>): ?string;
  acceptsCharsets(...charset: Array<string>): ?string;
  acceptsEncodings(...encoding: Array<string>): ?string;
  acceptsLanguages(...lang: Array<string>): ?string;
  get(field: string): ?string;
  is(type: string): boolean;
  range(size: number, options?: {combine: boolean}): number|Array<{start: number; end: number}>;
}

type CookieOptions = {
  domain?: string;
  encode?: Function;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: string;
  path?: string;
  secure?: boolean;
  signed?: boolean;
};

type RenderCallback = (err: Error, html: string) => void;

type SendFileOptions = {
  maxAge?: number|string;
  root?: string;
  lastModified?: boolean;
  headers?: Object;
  dotfiles?: string;
  acceptRanges?: boolean;
  cacheControl?: boolean;
};

declare class Response {
  app: ExpressApplication;
  headersSent: boolean;
  locals: Object;
  append(field: string, value?: string|Array<string>): Response;
  attachment(filename?: string): Response;
  cookie(name: string, value: string|Object, options?: CookieOptions): Response;
  clearCookie(name: string, options?: CookieOptions): Response;
  download(path: string): void;
  download(path: string, filename: string): void;
  download(path: string, fn: (err: Error) => void): void;
  download(path: string, filename: string, fn: (err: Error) => void): void;
  end(data?: string, encoding?: string): void;
  format(object: Object): Response;
  get(field: string): string;
  json(body: ?Object): Response;
  jsonp(body: ?Object): Response;
  links(links: Object): Response;
  location(path: string): Response;
  redirect(path: string): void;
  redirect(status: number, path: string): void;
  render(view: string): void;
  render(view: string, locals: Object): void;
  render(view: string, callback: RenderCallback): void;
  render(view: string, locals: Object, callback: RenderCallback): void;
  send(body: any): Response;
  sendFile(path: string): void;
  sendFile(path: string, options: SendFileOptions): void;
  sendFile(path: string, fn: (err: Error) => void): void;
  sendFile(path: string, options: SendFileOptions, fn: (err: Error) => void): void;
  sendStatus(statusCode: number): Response;
  set(fields: Object): Response;
  set(field: string, value: string): Response;
  status(code: number): Response;
  type(type: string): Response;
  vary(field: string): Response;
}

type ExpressMiddleware = (req: Request, res: Response, next?: Function) => void;

declare class ExpressApplication extends EventEmitter {
  locals: Object;
  mountpath: string|Array<string>;
  all(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  delete(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  disable(name: string): ExpressApplication;
  disabled(name: string): boolean;
  enable(name: string): ExpressApplication;
  enabled(name: string): boolean;
  engine(ext: string, callback: (path: string, options: Object, callback: Function) => void): ExpressApplication;
  get(name: string): any;
  get(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  listen(port: number): ExpressApplication;
  listen(port: number, hostname: string): ExpressApplication;
  listen(port: number, backlog: number): ExpressApplication;
  listen(port: number, callback: Function): ExpressApplication;
  listen(port: number, hostname: string, backlog: number): ExpressApplication;
  listen(port: number, hostname: string, callback: Function): ExpressApplication;
  listen(port: number, backlog: number, callback: Function): ExpressApplication;
  listen(port: number, hostname: string, backlog: number, callback: Function): ExpressApplication;
  checkout(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  copy(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  head(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  lock(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  merge(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  mkactivity(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  mkcol(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  move(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  notify(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  options(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  patch(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  purge(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  report(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  search(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  subscribe(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  trace(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  unlock(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  unsubscribe(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  param(callback: (req: Request, res: Response, next: Function, id: string) => void): ExpressApplication;
  param(name: string, callback: (req: Request, res: Response, next: Function, id: string) => void): ExpressApplication;
  path(): string;
  post(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  put(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
  render(view: string, callback: RenderCallback): ExpressApplication;
  render(view: string, locals: Object, callback: RenderCallback): ExpressApplication;
  route(path: string): ExpressApplication;
  set(name: string, value: any): ExpressApplication;
  use(...callback: Array<ExpressMiddleware>): ExpressApplication;
  use(path: string, ...callback: Array<ExpressMiddleware>): ExpressApplication;
}
