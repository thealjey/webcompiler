/* @flow */

type Assert = {
  not: Assert;
  a(type: string): void;
  calledWith(...args: Array<any>): void;
  called: void;
  equal(obj: any): void;
  eql(obj: any): void;
  instanceof(obj: any): void;
  contain(obj: Object | string | number): void;
  returned(obj: any): void;
  calledOnce: void;
  calledTwice: void;
  null: void;
  false: void;
  true: void;
};

declare module 'chai' {
  declare function expect(obj: any): Assert;
  declare function use(obj: any): void;
}
