/* @flow */

import chai, {expect} from 'chai';
import {spy, stub} from 'sinon';
import sinonChai from 'sinon-chai';
import {JSLint} from '../src/JSLint';
import type {JSLintCallback} from '../src/JSLint';
import {CLIEngine} from 'eslint';

chai.use(sinonChai);

const MAX_COMPLEXITY = 4,
    props = {complexity: [2, MAX_COMPLEXITY]},
    line = 1,
    column = 3;

let cmp, callback;

describe('JSLint', () => {

  beforeEach(() => {
    /* @flowignore */
    callback = (spy(): JSLintCallback);
  });

  describe('no props', () => {

    beforeEach(() => {
      cmp = new JSLint();
    });

    it('should contain the linter object', () => {
      expect(cmp.linter).instanceof(CLIEngine);
    });

  });

  describe('props', () => {

    beforeEach(() => {
      cmp = new JSLint(props);
    });

    it('should have easily configurable rules', () => {
      expect(cmp.linter.options.rules).contain(props);
    });

    describe('executeOnFiles error', () => {

      beforeEach(() => {
        stub(cmp.linter, 'executeOnFiles').returns({results: [
          {filePath: 'first file', messages: [
            {message: 'error message', ruleId: 'some rule', line, column}
          ]}
        ]});
        cmp.run(['somefile.js', 'somedirectory'], callback);
      });

      afterEach(() => {
        cmp.linter.executeOnFiles.restore();
      });

      it('should invoke the executeOnFiles method of the linter', () => {
        expect(cmp.linter.executeOnFiles).calledWith(['somefile.js', 'somedirectory']);
      });

      it('calls the callback', () => {
        expect(callback).calledWith([{message: 'error message', ruleId: 'some rule', filePath: 'first file', line,
                                    column}]);
      });

    });

    describe('executeOnFiles success', () => {

      beforeEach(() => {
        stub(cmp.linter, 'executeOnFiles').returns({results: []});
        cmp.run(['somefile.js', 'somedirectory'], callback);
      });

      afterEach(() => {
        cmp.linter.executeOnFiles.restore();
      });

      it('calls the callback', () => {
        expect(callback).calledWith(null);
      });

    });

  });

});
