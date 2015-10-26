/* @flow */

import JSLint from '../lib/JSLint';
import {CLIEngine} from 'eslint';

const MAX_COMPLEXITY = 4,
    props = {complexity: [2, MAX_COMPLEXITY]},
    line = 1,
    column = 3;

describe('JSLint', function () {
  let cmp;

  it('should contain the linter object', function () {
    cmp = new JSLint();

    expect(cmp.linter instanceof CLIEngine).toBeTruthy();
  });

  it('should have easily configurable rules', function () {
    cmp = new JSLint(props);

    expect(cmp.linter.options.rules).toEqual(jasmine.objectContaining(props));
  });

  describe('when invoking run', function () {

    beforeEach(function () {
      cmp = new JSLint();
    });

    it('should invoke the executeOnFiles method of the linter', function () {
      if (!cmp) {
        return;
      }
      spyOn(cmp.linter, 'executeOnFiles').and.returnValue({results: [{messages: []}]});
      cmp.run(['somefile.js', 'somedirectory'], Function.prototype);
      expect(cmp.linter.executeOnFiles).toHaveBeenCalledWith(['somefile.js', 'somedirectory']);
    });

    describe('return proper response', function () {
      let callback;

      beforeEach(function () {
        callback = jasmine.createSpy('callback');
      });

      it('should return an array of error objects on linter error', function () {
        if (!cmp) {
          return;
        }
        spyOn(cmp.linter, 'executeOnFiles').and.returnValue({results: [
          {filePath: 'first file', messages: [
            {message: 'error message', ruleId: 'some rule', line, column}
          ]}
        ]});
        cmp.run([], callback);
        expect(callback).toHaveBeenCalledWith([
          {message: 'error message', ruleId: 'some rule', filePath: 'first file', line, column}
        ]);
      });

      it('should return null if everything is OK', function () {
        if (!cmp) {
          return;
        }
        spyOn(cmp.linter, 'executeOnFiles').and.returnValue({results: [{messages: []}]});
        cmp.run([], callback);
        expect(callback).toHaveBeenCalledWith(null);
      });

    });

  });

});
