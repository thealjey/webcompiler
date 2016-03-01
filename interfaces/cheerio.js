/* @flow */

import type {CheerioNode} from '../src/typedef';

type DOM = {
  toArray: () => Array<CheerioNode>,
  html: () => string,
  children: () => DOM,
  each: (iteratee: (i: number, el: CheerioNode) => any) => DOM,
  find: (selector: string) => DOM,
  removeAttr: (attr: string) => void
};

declare module 'cheerio' {
  declare function load(html: string): {
    (): DOM,
    root: () => DOM
  };
}
