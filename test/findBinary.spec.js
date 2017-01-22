/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import {NativeProcess} from '../src/NativeProcess';
import {findBinary} from '../src/findBinary';
import fs from 'fs';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */

const error = new Error('something happened');

let cb, callback, result;

describe('findBinary', () => {

  beforeEach(() => {
    callback = spy();
    cb = (error, res) => {
      result = res;
      callback(error, res);
    };
  });

  describe('npm error', () => {

    beforeEach(() => {
      stub(NativeProcess.prototype, 'run').callsArgWith(0, error);
      stub(fs, 'stat');
      findBinary('something', cb);
    });

    afterEach(() => {
      NativeProcess.prototype.run.restore();
      fs.stat.restore();
    });

    it('calls run', () => {
      expect(NativeProcess.prototype.run).calledWith(match.func, ['bin']);
    });

    it('calls callback', () => {
      expect(callback).calledWith(error);
    });

    it('does not call stat', () => {
      expect(fs.stat).not.called;
    });

  });

  describe('npm success', () => {

    beforeEach(() => {
      stub(NativeProcess.prototype, 'run').callsArgWith(0, null, '/path/to/.bin\n');
    });

    afterEach(() => {
      NativeProcess.prototype.run.restore();
    });

    describe('stat error', () => {

      beforeEach(() => {
        stub(fs, 'stat').callsArgWith(1, error);
        findBinary('something', cb);
      });

      afterEach(() => {
        fs.stat.restore();
      });

      it('calls stat', () => {
        expect(fs.stat).calledWith('/path/to/.bin/something', match.func);
      });

      it('calls callback', () => {
        expect(callback).calledWith(error);
      });

    });

    describe('stat success', () => {

      beforeEach(() => {
        stub(fs, 'stat').callsArg(1);
        findBinary('something', cb);
      });

      afterEach(() => {
        fs.stat.restore();
      });

      it('calls callback', () => {
        expect(callback).calledWith(null, match.instanceOf(NativeProcess));
      });

      it('returns from cache', () => {
        findBinary('something', cb);
        expect(callback).calledWith(null, result);
      });

    });

  });

});
