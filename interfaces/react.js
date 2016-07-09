/* @flow */

declare module 'react' {
  declare function createElement(type: any, props: ?Object, ...children: Array<any>): void;
  declare var PropTypes: {
    instanceOf(obj: any): void;
    arrayOf(obj: any): void;
    string: {isRequired: void};
    any: {isRequired: void};
    object: {isRequired: void};
    bool: {isRequired: void};
    array: {isRequired: void};
    number: {isRequired: void};
    func: {isRequired: void};
  };
  declare class Component {}
}

declare module 'react/lib/shallowCompare' {
  declare function exports(component: any, props: Object, state: Object): boolean;
}
