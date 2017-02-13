/* @flow */

import chai, {expect} from 'chai';
import {stub} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import {Server} from './mock';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */
/* eslint-disable require-jsdoc */

const LIVERELOAD_PORT = 35729;

let livereload, tinylr, srv, result;

function req(options: Object) {
  return proxyquire('../src/livereload', options).livereload;
}

describe('livereload', () => {

  beforeEach(() => {
    srv = new Server();
    tinylr = stub().returns(srv);
    livereload = req({'tiny-lr': tinylr});
    result = livereload();
  });

  it('calls tinylr', () => {
    expect(tinylr).called;
  });

  it('starts up LiveReload', () => {
    expect(srv.listen).calledWith(LIVERELOAD_PORT);
  });

  it('returns a function', () => {
    expect(result).instanceof(Function);
  });

  it('no arg notifies LiveReload', () => {
    result();
    expect(srv.changed).calledWith({body: {files: ['*']}});
  });

  it('arg notifies LiveReload', () => {
    result('something');
    expect(srv.changed).calledWith({body: {files: ['something']}});
  });

  it('cache', () => {
    expect(livereload()).eql(result);
    expect(tinylr).calledOnce;
    expect(srv.listen).calledOnce;
  });

});
