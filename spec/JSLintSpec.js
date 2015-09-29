/* @flow */

import JSLint from '../lib/JSLint';
import {CLIEngine} from 'eslint';

describe('JSLint', function () {

  /* @noflow */
  let cmp;

  it('should contain the linter object', function () {
    cmp = new JSLint();

    expect(cmp.linter instanceof CLIEngine).toBeTruthy();
  });

  it('should have easily configurable rules', function () {
    cmp = new JSLint({complexity: [2, 4]});

    expect(cmp.linter.options.rules).toEqual(jasmine.objectContaining({complexity: [2, 4]}));
  });

  describe('when invoking run', function () {

    beforeEach(function () {
      cmp = new JSLint();
    });

    it('should invoke the executeOnFiles method of the linter', function () {
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
        spyOn(cmp.linter, 'executeOnFiles').and.returnValue({results: [
          {filePath: 'first file', messages: [
            {message: 'error message', ruleId: 'some rule', line: 1, column: 3}
          ]}
        ]});
        cmp.run([], callback);
        expect(callback).toHaveBeenCalledWith([
          {message: 'error message', ruleId: 'some rule', filePath: 'first file', line: 1, column: 3}
        ]);
      });

      it('should return null if everything is OK', function () {
        spyOn(cmp.linter, 'executeOnFiles').and.returnValue({results: [{messages: []}]});
        cmp.run([], callback);
        expect(callback).toHaveBeenCalledWith(null);
      });

    });

  });

});
