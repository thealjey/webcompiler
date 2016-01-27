type LoDashCallback = (value: any, key: number|string, collection: Array<any>|Object) => any;
type LoDashIteratee = LoDashCallback|Object|Array<any>|string;

declare module 'lodash/noop' {
  declare var exports: (...args: Array<any>) => void;
}

declare module 'lodash/assignWith' {
  declare var exports: (...args: Array<any>) => Object;
}

declare module 'lodash/constant' {
  declare var exports: (value: any) => any;
}

declare module 'lodash/isArray' {
  declare var exports: (value: any) => boolean;
}

declare module 'lodash/uniq' {
  declare var exports: (collection: Array<any>) => Array<any>;
}

declare module 'lodash/get' {
  declare var exports: (object: Object, path: string|Array<string>, defaultValue: ?any) => any;
}

declare module 'lodash/forEach' {
  declare var exports: (collection: Array<any>|Object, iteratee: ?LoDashIteratee) => Array<any>|Object;
}

declare module 'lodash/filter' {
  declare var exports: (collection: Array<any>|Object, iteratee: ?LoDashIteratee) => Array<any>;
}

declare module 'lodash/map' {
  declare var exports: (collection: Array<any>|Object, iteratee: ?LoDashIteratee) => Array<any>;
}

declare module 'lodash/find' {
  declare var exports: (collection: Array<any>|Object, iteratee: ?LoDashIteratee) => any;
}
