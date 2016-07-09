/* @flow */

type DOM = {
  toArray(): Array<Object>;
  html(): string;
  children(): DOM;
  each(iteratee: (i: number, el: Object) => any): DOM;
  find(selector: string): DOM;
  removeAttr(attr: string): void;
};

declare module 'cheerio' {
  declare function load(html: string): {
    (): DOM;
    root(): DOM;
  };
}
