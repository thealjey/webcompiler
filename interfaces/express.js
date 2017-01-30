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
  ips: string[];
  method: string;
  params: Object | any[];
  path: string;
  protocol: string;
  query: Object;
  route: Object;
  secure: boolean;
  signedCookies: Object;
  stale: boolean;
  subdomains: string[];
  xhr: boolean;
  accepts(types: string | string[]): ?string;
  acceptsCharsets(...charset: string[]): ?string;
  acceptsEncodings(...encoding: string[]): ?string;
  acceptsLanguages(...lang: string[]): ?string;
  get(field: string): ?string;
  is(type: string): boolean;
  range(size: number, options?: {combine: boolean}): number | Array<{start: number; end: number}>;
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
  maxAge?: number | string;
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
  append(field: string, value?: string | string[]): Response;
  attachment(filename?: string): Response;
  cookie(name: string, value: string | Object, options?: CookieOptions): Response;
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
  mountpath: string | string[];
  all(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  delete(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  disable(name: string): ExpressApplication;
  disabled(name: string): boolean;
  enable(name: string): ExpressApplication;
  enabled(name: string): boolean;
  engine(ext: string, callback: (path: string, options: Object, callback: Function) => void): ExpressApplication;
  get(name: string): any;
  get(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  listen(port: number): ExpressApplication;
  listen(port: number, hostname: string): ExpressApplication;
  listen(port: number, backlog: number): ExpressApplication;
  listen(port: number, callback: Function): ExpressApplication;
  listen(port: number, hostname: string, backlog: number): ExpressApplication;
  listen(port: number, hostname: string, callback: Function): ExpressApplication;
  listen(port: number, backlog: number, callback: Function): ExpressApplication;
  listen(port: number, hostname: string, backlog: number, callback: Function): ExpressApplication;
  checkout(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  copy(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  head(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  lock(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  merge(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  mkactivity(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  mkcol(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  move(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  notify(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  options(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  patch(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  purge(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  report(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  search(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  subscribe(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  trace(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  unlock(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  unsubscribe(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  param(callback: (req: Request, res: Response, next: Function, id: string) => void): ExpressApplication;
  param(name: string, callback: (req: Request, res: Response, next: Function, id: string) => void): ExpressApplication;
  path(): string;
  post(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  put(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
  render(view: string, callback: RenderCallback): ExpressApplication;
  render(view: string, locals: Object, callback: RenderCallback): ExpressApplication;
  route(path: string): ExpressApplication;
  set(name: string, value: any): ExpressApplication;
  use(...callback: ExpressMiddleware[]): ExpressApplication;
  use(path: string, ...callback: ExpressMiddleware[]): ExpressApplication;
}
