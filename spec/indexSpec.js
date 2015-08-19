/* @flow */

import {
  NativeProcess as TestNativeProcess,
  JS as TestJS,
  SASS as TestSASS,
  DevServer as TestDevServer,
  JSLint as TestJSLint,
  jsNodeCompileFile as testJSNodeCompileFile,
  jsNodeCompileDir as testJSNodeCompileDir,
  jsWebCompile as testJSWebCompile,
  jsMin as testJSMin,
  SASSLint as TestSASSLint,
  SASSCompile as TestSASSCompile,
  cssAutoprefix as testCSSAutoprefix,
  cssMin as testCSSMin
} from '../lib';

import NativeProcess from '../lib/NativeProcess';
import JS from '../lib/JS';
import SASS from '../lib/SASS';
import DevServer from '../lib/DevServer';
import JSLint from '../lib/JSLint';
import jsNodeCompileFile from '../lib/jsNodeCompileFile';
import jsNodeCompileDir from '../lib/jsNodeCompileDir';
import jsWebCompile from '../lib/jsWebCompile';
import jsMin from '../lib/jsMin';
import SASSLint from '../lib/SASSLint';
import SASSCompile from '../lib/SASSCompile';
import cssAutoprefix from '../lib/cssAutoprefix';
import cssMin from '../lib/cssMin';

describe('index', function () {

  it('re-exports NativeProcess', function () {
    expect(TestNativeProcess).toBe(NativeProcess);
  });

  it('re-exports JS', function () {
    expect(TestJS).toBe(JS);
  });

  it('re-exports SASS', function () {
    expect(TestSASS).toBe(SASS);
  });

  it('re-exports DevServer', function () {
    expect(TestDevServer).toBe(DevServer);
  });

  it('re-exports JSLint', function () {
    expect(TestJSLint).toBe(JSLint);
  });

  it('re-exports jsNodeCompileFile', function () {
    expect(testJSNodeCompileFile).toBe(jsNodeCompileFile);
  });

  it('re-exports jsNodeCompileDir', function () {
    expect(testJSNodeCompileDir).toBe(jsNodeCompileDir);
  });

  it('re-exports jsWebCompile', function () {
    expect(testJSWebCompile).toBe(jsWebCompile);
  });

  it('re-exports jsMin', function () {
    expect(testJSMin).toBe(jsMin);
  });

  it('re-exports SASSLint', function () {
    expect(TestSASSLint).toBe(SASSLint);
  });

  it('re-exports SASSCompile', function () {
    expect(TestSASSCompile).toBe(SASSCompile);
  });

  it('re-exports cssAutoprefix', function () {
    expect(testCSSAutoprefix).toBe(cssAutoprefix);
  });

  it('re-exports cssMin', function () {
    expect(testCSSMin).toBe(cssMin);
  });

});
