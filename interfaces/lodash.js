/* @flow */

type Comparator = (arrVal: any, othVal: any) => boolean;
type IsEqualCustomizer = (objValue: any, othValue: any, key?: number | string, object?: any, other?: any,
                          stack?: any[]) => boolean;
type TransformCallback = (accumulator: any, value: any, key: number | string, collection: any[] | Object) => any;
type Callback = (value: any, key: number | string, collection: any[] | Object) => any;
type Iteratee = Callback | Object | any[] | string;
type IterableCollection = any[] | Object | string;
type Path = string | string[];
type DebounceOptions = {
  leading?: boolean;
  maxWait?: number;
  trailing?: boolean;
};
type TemplateOptions = {
  escape?: RegExp;
  evaluate?: RegExp;
  imports?: Object;
  interpolate?: RegExp;
  sourceURL?: string;
  variable?: string;
};
type TruncateOptions = {
  length?: number;
  omission?: string;
  separator?: string | RegExp;
};

// Array

declare module 'lodash/chunk' {
  declare function exports(collection: any[], size?: number): any[];
}

declare module 'lodash/compact' {
  declare function exports(collection: any[]): any[];
}

declare module 'lodash/concat' {
  declare function exports(collection: any[], ...args: any[]): any[];
}

declare module 'lodash/difference' {
  declare function exports(collection: any[], ...args: any[]): any[];
}

declare module 'lodash/differenceBy' {
  declare function exports(collection: any[], ...args: any[]): any[];
}

declare module 'lodash/differenceWith' {
  declare function exports(collection: any[], ...args: any[]): any[];
}

declare module 'lodash/drop' {
  declare function exports(collection: any[], n?: number): any[];
}

declare module 'lodash/dropRight' {
  declare function exports(collection: any[], n?: number): any[];
}

declare module 'lodash/dropRightWhile' {
  declare function exports(collection: any[], iteratee?: Iteratee): any[];
}

declare module 'lodash/dropWhile' {
  declare function exports(collection: any[], iteratee?: Iteratee): any[];
}

declare module 'lodash/fill' {
  declare function exports(collection: any[], value: any, start?: number, end?: number): any[];
}

declare module 'lodash/findIndex' {
  declare function exports(collection: any[], iteratee?: Iteratee, fromIndex?: number): number;
}

declare module 'lodash/findLastIndex' {
  declare function exports(collection: any[], iteratee?: Iteratee, fromIndex?: number): number;
}

declare module 'lodash/first' {
  declare function exports(collection: any[]): any;
}

declare module 'lodash/flatten' {
  declare function exports(collection: any[]): any[];
}

declare module 'lodash/flattenDeep' {
  declare function exports(collection: any[]): any[];
}

declare module 'lodash/flattenDepth' {
  declare function exports(collection: any[], depth?: number): any[];
}

declare module 'lodash/fromPairs' {
  declare function exports(collection: any[]): Object;
}

declare module 'lodash/head' {
  declare function exports(collection: any[]): any;
}

declare module 'lodash/indexOf' {
  declare function exports(collection: any[], value: any, fromIndex?: number): number;
}

declare module 'lodash/initial' {
  declare function exports(collection: any[]): any[];
}

declare module 'lodash/intersection' {
  declare function exports(...args: any[]): any[];
}

declare module 'lodash/intersectionBy' {
  declare function exports(...args: any[]): any[];
}

declare module 'lodash/intersectionWith' {
  declare function exports(...args: any[]): any[];
}

declare module 'lodash/join' {
  declare function exports(collection: any[], separator?: string): string;
}

declare module 'lodash/last' {
  declare function exports(collection: any[]): any;
}

declare module 'lodash/lastIndexOf' {
  declare function exports(collection: any[], value: any, fromIndex?: number): number;
}

declare module 'lodash/nth' {
  declare function exports(collection: any[], n?: number): any;
}

declare module 'lodash/pull' {
  declare function exports(collection: any[], ...args: any[]): any[];
}

declare module 'lodash/pullAll' {
  declare function exports(collection: any[], values: any[]): any[];
}

declare module 'lodash/pullAllBy' {
  declare function exports(collection: any[], values: any[], iteratee?: Iteratee): any[];
}

declare module 'lodash/pullAllWith' {
  declare function exports(collection: any[], values: any[], comparator?: Comparator): any[];
}

declare module 'lodash/pullAt' {
  declare function exports(collection: any[], ...indexes: Array<number | number[]>): any[];
}

declare module 'lodash/remove' {
  declare function exports(collection: any[], iteratee?: Iteratee): any[];
}

declare module 'lodash/reverse' {
  declare function exports(collection: any[]): any[];
}

declare module 'lodash/slice' {
  declare function exports(collection: any[], start?: number, end?: number): any[];
}

declare module 'lodash/sortedIndex' {
  declare function exports(collection: any[], value: any): number;
}

declare module 'lodash/sortedIndexBy' {
  declare function exports(collection: any[], value: any, iteratee?: Iteratee): number;
}

declare module 'lodash/sortedIndexOf' {
  declare function exports(collection: any[], value: any): number;
}

declare module 'lodash/sortedLastIndex' {
  declare function exports(collection: any[], value: any): number;
}

declare module 'lodash/sortedLastIndexBy' {
  declare function exports(collection: any[], value: any, iteratee?: Iteratee): number;
}

declare module 'lodash/sortedLastIndexOf' {
  declare function exports(collection: any[], value: any): number;
}

declare module 'lodash/sortedUniq' {
  declare function exports(collection: any[]): any[];
}

declare module 'lodash/sortedUniqBy' {
  declare function exports(collection: any[], iteratee?: Iteratee): any[];
}

declare module 'lodash/tail' {
  declare function exports(collection: any[]): any[];
}

declare module 'lodash/take' {
  declare function exports(collection: any[], n?: number): any[];
}

declare module 'lodash/takeRight' {
  declare function exports(collection: any[], n?: number): any[];
}

declare module 'lodash/takeRightWhile' {
  declare function exports(collection: any[], iteratee?: Iteratee): any[];
}

declare module 'lodash/takeWhile' {
  declare function exports(collection: any[], iteratee?: Iteratee): any[];
}

declare module 'lodash/union' {
  declare function exports(...args: any[]): any[];
}

declare module 'lodash/unionBy' {
  declare function exports(...args: any[]): any[];
}

declare module 'lodash/unionWith' {
  declare function exports(...args: any[]): any[];
}

declare module 'lodash/uniq' {
  declare function exports(collection: any[]): any[];
}

declare module 'lodash/uniqBy' {
  declare function exports(collection: any[], iteratee?: Iteratee): any[];
}

declare module 'lodash/uniqWith' {
  declare function exports(collection: any[], comparator?: Comparator): any[];
}

declare module 'lodash/unzip' {
  declare function exports(collection: any[]): any[];
}

declare module 'lodash/unzipWith' {
  declare function exports(collection: any[], iteratee?: (...group: any[]) => any): any[];
}

declare module 'lodash/without' {
  declare function exports(collection: any[], ...values: any[]): any[];
}

declare module 'lodash/xor' {
  declare function exports(...args: any[]): any[];
}

declare module 'lodash/xorBy' {
  declare function exports(...args: any[]): any[];
}

declare module 'lodash/xorWith' {
  declare function exports(...args: any[]): any[];
}

declare module 'lodash/zip' {
  declare function exports(...args: any[]): any[];
}

declare module 'lodash/zipObject' {
  declare function exports(props?: any[], values?: any[]): Object;
}

declare module 'lodash/zipObjectDeep' {
  declare function exports(props?: any[], values?: any[]): Object;
}

declare module 'lodash/zipWith' {
  declare function exports(...args: any[]): any[];
}

// Collection

declare module 'lodash/countBy' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): Object;
}

declare module 'lodash/each' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): IterableCollection;
}

declare module 'lodash/eachRight' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): IterableCollection;
}

declare module 'lodash/every' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): boolean;
}

declare module 'lodash/filter' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): any[];
}

declare module 'lodash/find' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee, fromIndex?: number): any;
}

declare module 'lodash/findLast' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee, fromIndex?: number): any;
}

declare module 'lodash/flatMap' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): any[];
}

declare module 'lodash/flatMapDeep' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): any[];
}

declare module 'lodash/flatMapDepth' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee, depth?: number): any[];
}

declare module 'lodash/forEach' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): IterableCollection;
}

declare module 'lodash/forEachRight' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): IterableCollection;
}

declare module 'lodash/groupBy' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): Object;
}

declare module 'lodash/includes' {
  declare function exports(collection: IterableCollection, value: any, fromIndex?: number): boolean;
}

declare module 'lodash/invokeMap' {
  declare function exports(collection: IterableCollection, path: Path | Function, ...args: any[]): any[];
}

declare module 'lodash/keyBy' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): Object;
}

declare module 'lodash/map' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): any[];
}

declare module 'lodash/orderBy' {
  declare function exports(collection: IterableCollection, iteratees?: Iteratee[], orders?: string[]): any[];
}

declare module 'lodash/partition' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): any[];
}

declare module 'lodash/reduce' {
  declare function exports(collection: IterableCollection, iteratee?: TransformCallback, accumulator?: any): any;
}

declare module 'lodash/reduceRight' {
  declare function exports(collection: IterableCollection, iteratee?: TransformCallback, accumulator?: any): any;
}

declare module 'lodash/reject' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): any[];
}

declare module 'lodash/sample' {
  declare function exports(collection: IterableCollection): any;
}

declare module 'lodash/sampleSize' {
  declare function exports(collection: IterableCollection, n?: number): any[];
}

declare module 'lodash/shuffle' {
  declare function exports(collection: IterableCollection): any[];
}

declare module 'lodash/size' {
  declare function exports(collection: IterableCollection): number;
}

declare module 'lodash/some' {
  declare function exports(collection: IterableCollection, iteratee?: Iteratee): boolean;
}

declare module 'lodash/sortBy' {
  declare function exports(collection: IterableCollection, iteratees?: Iteratee[]): any[];
}

// Date

declare module 'lodash/now' {
  declare function exports(): number;
}

// Function

declare module 'lodash/after' {
  declare function exports(n: number, func: Function): Function;
}

declare module 'lodash/ary' {
  declare function exports(func: Function, n?: number): Function;
}

declare module 'lodash/before' {
  declare function exports(n: number, func: Function): Function;
}

declare module 'lodash/bind' {
  declare function exports(func: Function, thisArg: any, ...partials: any[]): Function;
}

declare module 'lodash/bindKey' {
  declare function exports(object: Object, key: string, ...partials: any[]): Function;
}

declare module 'lodash/curry' {
  declare function exports(func: Function, arity?: number): Function;
}

declare module 'lodash/curryRight' {
  declare function exports(func: Function, arity?: number): Function;
}

declare module 'lodash/debounce' {
  declare function exports(func: Function, wait?: number, options?: DebounceOptions): Function;
}

declare module 'lodash/defer' {
  declare function exports(func: Function, ...args: any[]): number;
}

declare module 'lodash/delay' {
  declare function exports(func: Function, wait: number, ...args: any[]): number;
}

declare module 'lodash/flip' {
  declare function exports(func: Function): Function;
}

declare module 'lodash/memoize' {
  declare function exports(func: Function, resolver?: Function): Function;
}

declare module 'lodash/negate' {
  declare function exports(func: Function): Function;
}

declare module 'lodash/once' {
  declare function exports(func: Function): Function;
}

declare module 'lodash/overArgs' {
  declare function exports(func: Function, ...transforms: Array<Function | Function[]>): Function;
}

declare module 'lodash/partial' {
  declare function exports(func: Function, ...partials: any[]): Function;
}

declare module 'lodash/partialRight' {
  declare function exports(func: Function, ...partials: any[]): Function;
}

declare module 'lodash/rearg' {
  declare function exports(func: Function, ...indexes: Array<number | number[]>): Function;
}

declare module 'lodash/rest' {
  declare function exports(func: Function, start?: number): Function;
}

declare module 'lodash/spread' {
  declare function exports(func: Function, start?: number): Function;
}

declare module 'lodash/throttle' {
  declare function exports(func: Function, wait?: number, options?: DebounceOptions): Function;
}

declare module 'lodash/unary' {
  declare function exports(func: Function): Function;
}

declare module 'lodash/wrap' {
  declare function exports(func: Function, wrapper?: (func: Function, ...args: any[]) => any): Function;
}

// Lang

declare module 'lodash/castArray' {
  declare function exports(value: any): any[];
}

declare module 'lodash/clone' {
  declare function exports(value: any): any;
}

declare module 'lodash/cloneDeep' {
  declare function exports(value: any): any;
}

declare module 'lodash/cloneDeepWith' {
  declare function exports(value: any, customizer?: Function): any;
}

declare module 'lodash/cloneWith' {
  declare function exports(value: any, customizer?: Function): any;
}

declare module 'lodash/conformsTo' {
  declare function exports(object: Object, source: Object): boolean;
}

declare module 'lodash/eq' {
  declare function exports(value: any, other: any): boolean;
}

declare module 'lodash/gt' {
  declare function exports(value: any, other: any): boolean;
}

declare module 'lodash/gte' {
  declare function exports(value: any, other: any): boolean;
}

declare module 'lodash/isArguments' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isArrayBuffer' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isArrayLike' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isArrayLikeObject' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isBoolean' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isBuffer' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isDate' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isElement' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isEmpty' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isEqual' {
  declare function exports(value: any, other: any): boolean;
}

declare module 'lodash/isEqualWith' {
  declare function exports(value: any, other: any, customizer?: IsEqualCustomizer): boolean;
}

declare module 'lodash/isError' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isFinite' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isFunction' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isInteger' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isLength' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isMap' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isMatch' {
  declare function exports(object: Object, source: Object): boolean;
}

declare module 'lodash/isMatchWith' {
  declare function exports(object: Object, source: Object, customizer?: IsEqualCustomizer): boolean;
}

declare module 'lodash/isNaN' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isNative' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isNil' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isNull' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isNumber' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isObject' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isObjectLike' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isPlainObject' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isRegExp' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isSafeInteger' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isSet' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isString' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isSymbol' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isTypedArray' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isUndefined' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isWeakMap' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/isWeakSet' {
  declare function exports(value: any): boolean;
}

declare module 'lodash/lt' {
  declare function exports(value: any, other: any): boolean;
}

declare module 'lodash/lte' {
  declare function exports(value: any, other: any): boolean;
}

declare module 'lodash/toArray' {
  declare function exports(value: any): any[];
}

declare module 'lodash/toFinite' {
  declare function exports(value: any): number;
}

declare module 'lodash/toInteger' {
  declare function exports(value: any): number;
}

declare module 'lodash/toLength' {
  declare function exports(value: any): number;
}

declare module 'lodash/toNumber' {
  declare function exports(value: any): number;
}

declare module 'lodash/toPlainObject' {
  declare function exports(value: any): Object;
}

declare module 'lodash/toSafeInteger' {
  declare function exports(value: any): number;
}

declare module 'lodash/toString' {
  declare function exports(value: any): string;
}

// Math

declare module 'lodash/add' {
  declare function exports(augend: number, addend: number): number;
}

declare module 'lodash/ceil' {
  declare function exports(value: number, precision?: number): number;
}

declare module 'lodash/divide' {
  declare function exports(dividend: number, divisor: number): number;
}

declare module 'lodash/floor' {
  declare function exports(value: number, precision?: number): number;
}

declare module 'lodash/max' {
  declare function exports(collection: any[]): any;
}

declare module 'lodash/maxBy' {
  declare function exports(collection: any[], iteratee?: Iteratee): any;
}

declare module 'lodash/mean' {
  declare function exports(collection: any[]): any;
}

declare module 'lodash/meanBy' {
  declare function exports(collection: any[], iteratee?: Iteratee): any;
}

declare module 'lodash/min' {
  declare function exports(collection: any[]): any;
}

declare module 'lodash/minBy' {
  declare function exports(collection: any[], iteratee?: Iteratee): any;
}

declare module 'lodash/multiply' {
  declare function exports(multiplier: number, multiplicand: number): number;
}

declare module 'lodash/round' {
  declare function exports(value: number, precision?: number): number;
}

declare module 'lodash/subtract' {
  declare function exports(minuend: number, subtrahend: number): number;
}

declare module 'lodash/sum' {
  declare function exports(collection: any[]): number;
}

declare module 'lodash/sumBy' {
  declare function exports(collection: any[], iteratee?: Iteratee): number;
}

// Number

declare module 'lodash/clamp' {
  declare function exports(value: number, lower: number, upper?: number): number;
}

declare module 'lodash/inRange' {
  declare function exports(value: number, lower: number, upper?: number): boolean;
}

declare module 'lodash/random' {
  declare function exports(lower?: number, upper?: number, floating?: boolean): number;
}

// Object

declare module 'lodash/assign' {
  declare function exports(object: Object, ...sources: Object[]): Object;
}

declare module 'lodash/assignIn' {
  declare function exports(object: Object, ...sources: Object[]): Object;
}

declare module 'lodash/assignInWith' {
  declare function exports(...args: any[]): Object;
}

declare module 'lodash/assignWith' {
  declare function exports(...args: any[]): Object;
}

declare module 'lodash/at' {
  declare function exports(object: Object, ...paths: Path[]): any[];
}

declare module 'lodash/create' {
  declare function exports(prototype: Object, properties?: Object): Object;
}

declare module 'lodash/defaults' {
  declare function exports(value: Object, ...sources: Object[]): Object;
}

declare module 'lodash/defaultsDeep' {
  declare function exports(value: Object, ...sources: Object[]): Object;
}

declare module 'lodash/entries' {
  declare function exports(collection: IterableCollection): any[];
}

declare module 'lodash/entriesIn' {
  declare function exports(collection: IterableCollection): any[];
}

declare module 'lodash/extend' {
  declare function exports(object: Object, ...sources: Object[]): Object;
}

declare module 'lodash/extendWith' {
  declare function exports(...args: any[]): Object;
}

declare module 'lodash/findKey' {
  declare function exports(object: Object, iteratee?: Iteratee): string;
}

declare module 'lodash/findLastKey' {
  declare function exports(object: Object, iteratee?: Iteratee): string;
}

declare module 'lodash/forIn' {
  declare function exports(object: Object, iteratee?: Iteratee): Object;
}

declare module 'lodash/forInRight' {
  declare function exports(object: Object, iteratee?: Iteratee): Object;
}

declare module 'lodash/forOwn' {
  declare function exports(object: Object, iteratee?: Iteratee): Object;
}

declare module 'lodash/forOwnRight' {
  declare function exports(object: Object, iteratee?: Iteratee): Object;
}

declare module 'lodash/functions' {
  declare function exports(object: Object): string[];
}

declare module 'lodash/functionsIn' {
  declare function exports(object: Object): string[];
}

declare module 'lodash/get' {
  declare function exports(object: Object, path: Path, defaultValue?: any): any;
}

declare module 'lodash/has' {
  declare function exports(object: Object, path: Path): boolean;
}

declare module 'lodash/hasIn' {
  declare function exports(object: Object, path: Path): boolean;
}

declare module 'lodash/invert' {
  declare function exports(object: Object): Object;
}

declare module 'lodash/invertBy' {
  declare function exports(object: Object, iteratee?: Iteratee): Object;
}

declare module 'lodash/invoke' {
  declare function exports(object: Object, path: Path, ...args: any[]): any;
}

declare module 'lodash/keys' {
  declare function exports(collection: IterableCollection): Array<number | string>;
}

declare module 'lodash/keysIn' {
  declare function exports(collection: IterableCollection): Array<number | string>;
}

declare module 'lodash/mapKeys' {
  declare function exports(object: Object, iteratee?: Iteratee): Object;
}

declare module 'lodash/mapValues' {
  declare function exports(object: Object, iteratee?: Iteratee): Object;
}

declare module 'lodash/merge' {
  declare function exports(object: Object, ...sources: Object[]): Object;
}

declare module 'lodash/mergeWith' {
  declare function exports(...args: any[]): Object;
}

declare module 'lodash/omit' {
  declare function exports(object: Object, ...props: Array<string | string[]>): Object;
}

declare module 'lodash/omitBy' {
  declare function exports(object: Object, iteratee?: Iteratee): Object;
}

declare module 'lodash/pick' {
  declare function exports(object: Object, ...props: Array<string | string[]>): Object;
}

declare module 'lodash/pickBy' {
  declare function exports(object: Object, iteratee?: Iteratee): Object;
}

declare module 'lodash/result' {
  declare function exports(object: Object, path: Path, defaultValue?: any): any;
}

declare module 'lodash/set' {
  declare function exports(object: Object, path: Path, value: any): Object;
}

declare module 'lodash/setWith' {
  declare function exports(object: Object, path: Path, value: any, customizer?: Callback): Object;
}

declare module 'lodash/toPairs' {
  declare function exports(object: Object): any[];
}

declare module 'lodash/toPairsIn' {
  declare function exports(object: Object): any[];
}

declare module 'lodash/transform' {
  declare function exports(collection: IterableCollection, iteratee?: TransformCallback, accumulator?: any): any;
}

declare module 'lodash/unset' {
  declare function exports(object: Object, path: Path): boolean;
}

declare module 'lodash/update' {
  declare function exports(object: Object, path: Path, updater: Callback): Object;
}

declare module 'lodash/updateWith' {
  declare function exports(object: Object, path: Path, updater: Callback, customizer?: Callback): Object;
}

declare module 'lodash/values' {
  declare function exports(object: Object): any[];
}

declare module 'lodash/valuesIn' {
  declare function exports(object: Object): any[];
}

// String

declare module 'lodash/camelCase' {
  declare function exports(value?: string): string;
}

declare module 'lodash/capitalize' {
  declare function exports(value?: string): string;
}

declare module 'lodash/deburr' {
  declare function exports(value?: string): string;
}

declare module 'lodash/endsWith' {
  declare function exports(value?: string, target?: string, position?: number): boolean;
}

declare module 'lodash/escape' {
  declare function exports(value?: string): string;
}

declare module 'lodash/escapeRegExp' {
  declare function exports(value?: string): string;
}

declare module 'lodash/kebabCase' {
  declare function exports(value?: string): string;
}

declare module 'lodash/lowerCase' {
  declare function exports(value?: string): string;
}

declare module 'lodash/lowerFirst' {
  declare function exports(value?: string): string;
}

declare module 'lodash/pad' {
  declare function exports(value?: string, length?: number, chars?: string): string;
}

declare module 'lodash/padEnd' {
  declare function exports(value?: string, length?: number, chars?: string): string;
}

declare module 'lodash/padStart' {
  declare function exports(value?: string, length?: number, chars?: string): string;
}

declare module 'lodash/parseInt' {
  declare function exports(value: string, radix?: number): number;
}

declare module 'lodash/repeat' {
  declare function exports(value?: string, n?: number): string;
}

declare module 'lodash/replace' {
  declare function exports(value: string, pattern: string | RegExp, replacement: string | Function): string;
}

declare module 'lodash/snakeCase' {
  declare function exports(value?: string): string;
}

declare module 'lodash/split' {
  declare function exports(value: string, separator: string | RegExp, limit?: number): string[];
}

declare module 'lodash/startCase' {
  declare function exports(value?: string): string;
}

declare module 'lodash/startsWith' {
  declare function exports(value?: string, target?: string, position?: number): boolean;
}

declare module 'lodash/template' {
  declare function exports(value?: string, options?: TemplateOptions): Function;
}

declare module 'lodash/toLower' {
  declare function exports(value?: string): string;
}

declare module 'lodash/toUpper' {
  declare function exports(value?: string): string;
}

declare module 'lodash/trim' {
  declare function exports(value?: string, chars?: string): string;
}

declare module 'lodash/trimEnd' {
  declare function exports(value?: string, chars?: string): string;
}

declare module 'lodash/trimStart' {
  declare function exports(value?: string, chars?: string): string;
}

declare module 'lodash/truncate' {
  declare function exports(value?: string, options?: TruncateOptions): string;
}

declare module 'lodash/unescape' {
  declare function exports(value?: string): string;
}

declare module 'lodash/upperCase' {
  declare function exports(value?: string): string;
}

declare module 'lodash/upperFirst' {
  declare function exports(value?: string): string;
}

declare module 'lodash/words' {
  declare function exports(value: string, pattern: string | RegExp): string[];
}

// Util

declare module 'lodash/attempt' {
  declare function exports(func: Function, ...args: any[]): any;
}

declare module 'lodash/bindAll' {
  declare function exports(object: Object, ...methodNames: Array<string | string[]>): Object;
}

declare module 'lodash/cond' {
  declare function exports(pairs: Function[]): Function;
}

declare module 'lodash/conforms' {
  declare function exports(source: Object): Function;
}

declare module 'lodash/constant' {
  declare function exports(value: any): Function;
}

declare module 'lodash/defaultTo' {
  declare function exports(value: any, defaultValue: any): any;
}

declare module 'lodash/flow' {
  declare function exports(...funcs: Array<Function | Function[]>): Function;
}

declare module 'lodash/flowRight' {
  declare function exports(...funcs: Array<Function | Function[]>): Function;
}

declare module 'lodash/identity' {
  declare function exports(value: any): any;
}

declare module 'lodash/iteratee' {
  declare function exports(iteratee?: Iteratee): Function;
}

declare module 'lodash/matches' {
  declare function exports(source: Object): Function;
}

declare module 'lodash/matchesProperty' {
  declare function exports(path: Path, srcValue: any): Function;
}

declare module 'lodash/method' {
  declare function exports(path: Path, ...args: any[]): Function;
}

declare module 'lodash/methodOf' {
  declare function exports(object: Object, ...args: any[]): Function;
}

declare module 'lodash/mixin' {
  declare function exports(object: Object | Function, source: Object, options?: {chain?: boolean}): Object | Function;
}

declare module 'lodash/noop' {
  declare function exports(...args: any[]): void;
}

declare module 'lodash/nthArg' {
  declare function exports(n?: number): Function;
}

declare module 'lodash/over' {
  declare function exports(...iteratees: Array<Function | Function[]>): Function;
}

declare module 'lodash/overEvery' {
  declare function exports(...predicates: Array<Function | Function[]>): Function;
}

declare module 'lodash/overSome' {
  declare function exports(...predicates: Array<Function | Function[]>): Function;
}

declare module 'lodash/property' {
  declare function exports(path: Path): Function;
}

declare module 'lodash/propertyOf' {
  declare function exports(object: Object): Function;
}

declare module 'lodash/range' {
  declare function exports(start: number, end?: number, step?: number): number[];
}

declare module 'lodash/rangeRight' {
  declare function exports(start: number, end?: number, step?: number): number[];
}

declare module 'lodash/stubArray' {
  declare function exports(): any[];
}

declare module 'lodash/stubFalse' {
  declare function exports(): boolean;
}

declare module 'lodash/stubObject' {
  declare function exports(): Object;
}

declare module 'lodash/stubString' {
  declare function exports(): string;
}

declare module 'lodash/stubTrue' {
  declare function exports(): boolean;
}

declare module 'lodash/times' {
  declare function exports(n: number, iteratee?: (index: number) => any): any[];
}

declare module 'lodash/toPath' {
  declare function exports(value: any): string[];
}

declare module 'lodash/uniqueId' {
  declare function exports(prefix?: string): string;
}
