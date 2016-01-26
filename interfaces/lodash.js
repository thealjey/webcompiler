type LoDashIteratee = (value: any, key: number|string, collection: Array<any>|Object) => void;

declare module 'lodash/forEach' {
  declare var exports: (collection: Array<any>|Object, iteratee: ?LoDashIteratee) => Array<any>|Object;
}

declare module 'lodash/noop' {
  declare var exports: (...args: Array<any>) => void;
}

declare module 'lodash/constant' {
  declare var exports: (value: any) => any;
}
