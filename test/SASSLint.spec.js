/* @flow */

import chai, {expect} from 'chai';
import {stub} from 'sinon';
import sinonChai from 'sinon-chai';
import {SASSLint} from '../src/SASSLint';
import {NativeProcess} from '../src/NativeProcess';
import {join} from 'path';

chai.use(sinonChai);

const config = join(__dirname, '..', 'config', 'scsslint.yml');

let cmp;

function callback() {}

describe('SASSLint', () => {

  describe('no excludes', () => {

    beforeEach(() => {
      cmp = new SASSLint();
      stub(cmp.proc, 'run');
      cmp.run(['style.scss', 'sass'], callback);
    });

    afterEach(() => {
      cmp.proc.run.restore();
    });

    it('contains an empty exclude list', () => {
      expect(cmp.excludeLinter).equal('');
    });

    it('includes a correct NativeProcess instance', () => {
      expect(cmp.proc).instanceof(NativeProcess);
      expect(cmp.proc.task).equal('scss-lint');
    });

    it('invokes proc.run', () => {
      expect(cmp.proc.run).calledWith(callback, ['style.scss', 'sass', '-c', config]);
    });

  });

  describe('exclude some linters', () => {

    beforeEach(() => {
      cmp = new SASSLint('QualifyingElement', 'PlaceholderInExtend');
      stub(cmp.proc, 'run');
      cmp.run(['style.scss', 'sass'], callback);
    });

    afterEach(() => {
      cmp.proc.run.restore();
    });

    it('contains a comma-separated exclude list', () => {
      expect(cmp.excludeLinter).equal('QualifyingElement,PlaceholderInExtend');
    });

    it('supplies proc.run with the list of excluded linters', () => {
      expect(cmp.proc.run).calledWith(callback, ['style.scss', 'sass', '-c', config, '-x',
                                      'QualifyingElement,PlaceholderInExtend']);
    });

  });

});
