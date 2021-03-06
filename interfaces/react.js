/* @flow */

declare module 'react' {
  declare function createElement(type: any, props?: Object, ...children: any[]): void;
  declare class Component {}
  declare class PureComponent {}
}

declare module 'react/lib/shallowCompare' {
  declare function exports(component: any, props: Object, state: Object): boolean;
}

declare module 'prop-types' {
  declare var exports: {
    instanceOf(obj: any): void;
    arrayOf(obj: any): void;
    oneOfType(types: any[]): void;
    string: {isRequired: void};
    any: {isRequired: void};
    object: {isRequired: void};
    bool: {isRequired: void};
    array: {isRequired: void};
    number: {isRequired: void};
    func: {isRequired: void};
  };
}
