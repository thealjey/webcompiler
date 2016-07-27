/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import {SASSLint} from '../src/SASSLint';
import {NativeProcess} from '../src/NativeProcess';
import {join} from 'path';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */

const config = join(__dirname, '..', 'config', 'scsslint.yml');

let cmp, callback;

describe('SASSLint', () => {

  beforeEach(() => {
    callback = spy();
  });

  describe('no excludes', () => {

    beforeEach(() => {
      cmp = new SASSLint();
      stub(cmp.proc, 'run').callsArgWith(0, '');
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
      expect(cmp.proc.run).calledWith(match.func, ['style.scss', 'sass', '-c', config], {stdio: 'inherit'});
    });

    it('does not call the callback', () => {
      expect(callback).not.called;
    });

  });

  describe('exclude some linters', () => {

    beforeEach(() => {
      cmp = new SASSLint('QualifyingElement', 'PlaceholderInExtend');
      stub(cmp.proc, 'run').callsArgWith(0, null);
      cmp.run(['style.scss', 'sass'], callback);
    });

    afterEach(() => {
      cmp.proc.run.restore();
    });

    it('contains a comma-separated exclude list', () => {
      expect(cmp.excludeLinter).equal('QualifyingElement,PlaceholderInExtend');
    });

    it('supplies proc.run with the list of excluded linters', () => {
      expect(cmp.proc.run).calledWith(match.func, ['style.scss', 'sass', '-c', config, '-x',
                                      'QualifyingElement,PlaceholderInExtend'], {stdio: 'inherit'});
    });

    it('calls the callback', () => {
      expect(callback).called;
    });

  });

});
