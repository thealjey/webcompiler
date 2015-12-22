type Spy = {
  and: {
    callFake: (callback: (...args: Array<any>) => any) => Spy,
    returnValue: (obj: any) => Spy,
    callThrough: () => Spy
  },
  calls: {count: () => number}
};
type Match = {
  not: Match,
  toBe: (obj: any) => void,
  toEqual: (obj: any) => void,
  toBeTruthy: () => void,
  toHaveBeenCalled: () => void,
  toHaveBeenCalledWith: (...args: Array<any>) => void
};

declare function describe(title: string, callback: () => void): void;
declare function beforeEach(callback: () => void): void;
declare function afterEach(callback: () => void): void;
declare function it(title: string, callback: () => void): void;
declare function expect(obj: any): Match;
declare function spyOn(obj: any, fn: string): Spy;
declare var jasmine: {
  createSpy: (name: string) => Spy,
  any: (obj: any) => any,
  objectContaining: (obj: Object) => void
};
