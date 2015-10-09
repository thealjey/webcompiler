/* @flow */

import SASSLint from '../lib/SASSLint';
import NativeProcess from '../lib/NativeProcess';
import path from 'path';

const config = path.join(__dirname, '..', 'config', 'scsslint.yml');

describe('SASSLint', function () {

  describe('no excludes', function () {
    let cmp;

    beforeEach(function () {
      cmp = new SASSLint();
    });

    it('contains an empty exclude list', function () {
      if (!cmp) {
        return;
      }
      expect(cmp.excludeLinter).toBe('');
    });

    it('includes a correct NativeProcess instance', function () {
      if (!cmp) {
        return;
      }
      expect(cmp.proc instanceof NativeProcess).toBeTruthy();
      expect(cmp.proc.task).toBe('scss-lint');
    });

    it('invokes proc.run', function () {
      if (!cmp) {
        return;
      }
      function callback() {}

      spyOn(cmp.proc, 'run');
      cmp.run(['style.scss', 'sass'], callback);
      expect(cmp.proc.run).toHaveBeenCalledWith(callback, ['style.scss', 'sass', '-c', config]);
    });

  });

  describe('exclude some linters', function () {
    let cmp;

    beforeEach(function () {
      cmp = new SASSLint('QualifyingElement', 'PlaceholderInExtend');
    });

    it('contains a comma-separated exclude list', function () {
      if (!cmp) {
        return;
      }
      expect(cmp.excludeLinter).toBe('QualifyingElement,PlaceholderInExtend');
    });

    it('supplies proc.run with the list of excluded linters', function () {
      if (!cmp) {
        return;
      }
      function callback() {}

      spyOn(cmp.proc, 'run');
      cmp.run(['style.scss', 'sass'], callback);
      expect(cmp.proc.run).toHaveBeenCalledWith(callback, ['style.scss', 'sass', '-c', config, '-x',
                                                'QualifyingElement,PlaceholderInExtend']);
    });

  });

});
