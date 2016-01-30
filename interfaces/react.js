/* @flow */

type PropTypesObject = {
  arrayOf: (obj: any) => void,
  string: {isRequired: void},
  any: {isRequired: void},
  object: {isRequired: void},
  bool: {isRequired: void},
  array: {isRequired: void},
  func: {isRequired: void}
};

declare module 'react' {
  declare function createElement(type: any, props: ?Object, ...children: Array<any>): void;
  declare var PropTypes: PropTypesObject;
  declare class Component {}
}

declare module 'react/lib/ReactWithAddons' {
  declare function createElement(type: any, props: ?Object, ...children: Array<any>): void;
  declare var PropTypes: PropTypesObject;
  declare class Component {}
  declare var addons: {
    shallowCompare: (component: any, props: Object, state: Object) => boolean
  };
}
