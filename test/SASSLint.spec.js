/* @flow */

import chai, {expect} from 'chai';
import {stub} from 'sinon';
import sinonChai from 'sinon-chai';
import {SASSLint} from '../src/SASSLint';
import {NativeProcess} from '../src/NativeProcess';
import {join} from 'path';
import noop from 'lodash/noop';

chai.use(sinonChai);

/* eslint-disable require-jsdoc */

const config = join(__dirname, '..', 'config', 'scsslint.yml');

let cmp;

describe('SASSLint', () => {

  describe('no excludes', () => {

    beforeEach(() => {
      cmp = new SASSLint();
      stub(cmp.proc, 'run');
      cmp.run(['style.scss', 'sass'], noop);
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
      expect(cmp.proc.run).calledWith(noop, ['style.scss', 'sass', '-c', config]);
    });

  });

  describe('exclude some linters', () => {

    beforeEach(() => {
      cmp = new SASSLint('QualifyingElement', 'PlaceholderInExtend');
      stub(cmp.proc, 'run');
      cmp.run(['style.scss', 'sass'], noop);
    });

    afterEach(() => {
      cmp.proc.run.restore();
    });

    it('contains a comma-separated exclude list', () => {
      expect(cmp.excludeLinter).equal('QualifyingElement,PlaceholderInExtend');
    });

    it('supplies proc.run with the list of excluded linters', () => {
      expect(cmp.proc.run).calledWith(noop, ['style.scss', 'sass', '-c', config, '-x',
                                      'QualifyingElement,PlaceholderInExtend']);
    });

  });

});
