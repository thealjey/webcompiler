/* @flow */

import type {ObjectOrErrorCallback} from '../src/typedef';
import chai, {expect} from 'chai';
import {spy, stub} from 'sinon';
import sinonChai from 'sinon-chai';
import {yaml} from '../src/yaml';
import fs from 'fs';
import jsYaml from 'js-yaml';

chai.use(sinonChai);

/* eslint-disable no-sync */

let callback;

describe('yaml', () => {

  beforeEach(() => {
    /* @flowignore */
    callback = (spy(): ObjectOrErrorCallback);
    stub(fs, 'readFileSync').returns('a yaml string');
  });

  afterEach(() => {
    fs.readFileSync.restore();
  });

  describe('throws', () => {

    beforeEach(() => {
      stub(jsYaml, 'safeLoad').throws(new Error('I am sowwy'));
      yaml('/path/to/a/file', callback);
    });

    afterEach(() => {
      jsYaml.safeLoad.restore();
    });

    it('calls spy', () => {
      expect(callback).calledWith('Error: I am sowwy', {});
    });

  });

  describe('does not throw', () => {

    beforeEach(() => {
      stub(jsYaml, 'safeLoad').returns({parsed: 'data'});
      yaml('/path/to/a/file', callback);
    });

    afterEach(() => {
      jsYaml.safeLoad.restore();
    });

    it('calls readFileSync', () => {
      expect(fs.readFileSync).calledWith('/path/to/a/file', 'utf8');
    });

    it('calls safeLoad', () => {
      expect(jsYaml.safeLoad).calledWith('a yaml string', {filename: '/path/to/a/file'});
    });

    it('calls spy', () => {
      expect(callback).calledWith(null, {parsed: 'data'});
    });

  });

});
