/* @flow */

type TransformCallback = (accumulator: any, value: any, key: number|string, collection: Array<any>|Object) => any;
type Callback = (value: any, key: number|string, collection: Array<any>|Object) => any;
type Iteratee = Callback|Object|Array<any>|string;
type Iterable = Array<any>|Object;
type Path = string|Array<string>;

declare module 'lodash/noop' {
  declare function exports(...args: Array<any>): void;
}

declare module 'lodash/assignWith' {
  declare function exports(...args: Array<any>): Object;
}

declare module 'lodash/constant' {
  declare function exports(value: any): () => any;
}

declare module 'lodash/identity' {
  declare function exports(value: any): any;
}

declare module 'lodash/clone' {
  declare function exports(value: any): any;
}

declare module 'lodash/cloneDeep' {
  declare function exports(value: any): any;
}

declare module 'lodash/isArray' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isString' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isError' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/keys' {
  declare function exports(value: any): Array<any>;
}

declare module 'lodash/camelCase' {
  declare function exports(value: string): string;
}

declare module 'lodash/upperFirst' {
  declare function exports(value: string): string;
}

declare module 'lodash/attempt' {
  declare function exports(callback: Function): any;
}

declare module 'lodash/trim' {
  declare function exports(value: string, chars: ?string): string;
}

declare module 'lodash/uniq' {
  declare function exports(collection: Array<any>): Array<any>;
}

declare module 'lodash/flatten' {
  declare function exports(collection: Array<any>): Array<any>;
}

declare module 'lodash/flattenDeep' {
  declare function exports(collection: Array<any>): Array<any>;
}

declare module 'lodash/without' {
  declare function exports(collection: Array<any>, ...values: Array<any>): Array<any>;
}

declare module 'lodash/defaultsDeep' {
  declare function exports(value: Object, ...sources: Array<Object>): Object;
}

declare module 'lodash/isEqual' {
  declare function exports(value: any, other: any): boolean;
}

declare module 'lodash/has' {
  declare function exports(object: any, path: Path): boolean;
}

declare module 'lodash/get' {
  declare function exports(object: any, path: Path, defaultValue: ?any): any;
}

declare module 'lodash/set' {
  declare function exports(object: any, path: Path, value: any): any;
}

declare module 'lodash/forEach' {
  declare function exports(collection: Iterable, iteratee: ?Callback): Iterable;
}

declare module 'lodash/filter' {
  declare function exports(collection: Iterable, iteratee: ?Iteratee): Array<any>;
}

declare module 'lodash/reject' {
  declare function exports(collection: Iterable, iteratee: ?Iteratee): Array<any>;
}

declare module 'lodash/map' {
  declare function exports(collection: Iterable, iteratee: ?Iteratee): Array<any>;
}

declare module 'lodash/find' {
  declare function exports(collection: Iterable, iteratee: ?Iteratee): any;
}

declare module 'lodash/findIndex' {
  declare function exports(collection: Iterable, iteratee: ?Iteratee): number;
}

declare module 'lodash/transform' {
  declare function exports(collection: Iterable, iteratee: ?TransformCallback, accumulator: ?any): any;
}

declare module 'lodash/reduce' {
  declare function exports(collection: Iterable, iteratee: ?TransformCallback, accumulator: ?any): any;
}

declare module 'lodash/sortedIndexBy' {
  declare function exports(collection: Array<any>, value: any, iteratee: ?Iteratee): number;
}
