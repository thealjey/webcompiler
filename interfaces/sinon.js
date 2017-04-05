/* @flow */

type Spy = {
  (...args: any[]): any;
  callCount: number;
};

type Stub = {
  (...args: any[]): any;
  returns(obj: any): any;
  returnsArg(i: number): any;
  throws(err: Error): any;
  callsArg(i: number): any;
  callsArgWith(i: number, ...args: any[]): any;
  callsFake(cb: Function): any;
};

declare module 'sinon' {
  declare function spy(obj: ?any, method: ?string): Spy;
  declare function stub(obj: ?any, method: ?string, func: ?(...args: any[]) => any): Stub;
  declare var match: {
    (callback: (value: any) => boolean): void;
    func: void;
    instanceOf(obj: any): void;
  };
}
