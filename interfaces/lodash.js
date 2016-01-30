/* @flow */

type LoDashTransformCallback = (accumulator: any, value: any, key: number|string, collection: Array<any>|Object) => any;
type LoDashCallback = (value: any, key: number|string, collection: Array<any>|Object) => any;
type LoDashIteratee = LoDashCallback|Object|Array<any>|string;

declare module 'lodash/noop' {
  declare function exports(...args: Array<any>): void;
}

declare module 'lodash/assignWith' {
  declare function exports(...args: Array<any>): Object;
}

declare module 'lodash/constant' {
  declare function exports(value: any): any;
}

declare module 'lodash/isArray' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isString' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/camelCase' {
  declare function exports(value: string): string;
}

declare module 'lodash/uniq' {
  declare function exports(collection: Array<any>): Array<any>;
}

declare module 'lodash/has' {
  declare function exports(object: Object, path: string|Array<string>): boolean;
}

declare module 'lodash/get' {
  declare function exports(object: Object, path: string|Array<string>, defaultValue: ?any): any;
}

declare module 'lodash/forEach' {
  declare function exports(collection: Array<any>|Object, iteratee: ?LoDashCallback): Array<any>|Object;
}

declare module 'lodash/filter' {
  declare function exports(collection: Array<any>|Object, iteratee: ?LoDashIteratee): Array<any>;
}

declare module 'lodash/reject' {
  declare function exports(collection: Array<any>|Object, iteratee: ?LoDashIteratee): Array<any>;
}

declare module 'lodash/map' {
  declare function exports(collection: Array<any>|Object, iteratee: ?LoDashIteratee): Array<any>;
}

declare module 'lodash/find' {
  declare function exports(collection: Array<any>|Object, iteratee: ?LoDashIteratee): any;
}

declare module 'lodash/transform' {
  declare function exports(collection: Array<any>|Object, iteratee: ?LoDashTransformCallback, accumulator: ?any): any;
}

declare module 'lodash/reduce' {
  declare function exports(collection: Array<any>|Object, iteratee: ?LoDashTransformCallback, accumulator: ?any): any;
}
