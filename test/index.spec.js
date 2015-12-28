/* @flow */

import {expect} from 'chai';

import {
  NativeProcess as TestNativeProcess,
  Documentation as TestDocumentation,
  watch as testWatch,
  yaml as testYaml,
  JS as TestJS,
  SASS as TestSASS,
  DevServer as TestDevServer,
  JSLint as TestJSLint,
  JSCompiler as TestJSCompiler,
  SASSLint as TestSASSLint,
  SASSCompiler as TestSASSCompiler
} from '../src';

import {NativeProcess} from '../src/NativeProcess';
import {Documentation} from '../src/Documentation';
import {watch} from '../src/watch';
import {yaml} from '../src/yaml';
import {JS} from '../src/JS';
import {SASS} from '../src/SASS';
import {DevServer} from '../src/DevServer';
import {JSLint} from '../src/JSLint';
import {JSCompiler} from '../src/JSCompiler';
import {SASSLint} from '../src/SASSLint';
import {SASSCompiler} from '../src/SASSCompiler';

describe('index', () => {

  it('re-exports NativeProcess', () => {
    expect(TestNativeProcess).equal(NativeProcess);
  });

  it('re-exports Documentation', () => {
    expect(TestDocumentation).equal(Documentation);
  });

  it('re-exports watch', () => {
    expect(testWatch).equal(watch);
  });

  it('re-exports yaml', () => {
    expect(testYaml).equal(yaml);
  });

  it('re-exports JS', () => {
    expect(TestJS).equal(JS);
  });

  it('re-exports SASS', () => {
    expect(TestSASS).equal(SASS);
  });

  it('re-exports DevServer', () => {
    expect(TestDevServer).equal(DevServer);
  });

  it('re-exports JSLint', () => {
    expect(TestJSLint).equal(JSLint);
  });

  it('re-exports JSCompiler', () => {
    expect(TestJSCompiler).equal(JSCompiler);
  });

  it('re-exports SASSLint', () => {
    expect(TestSASSLint).equal(SASSLint);
  });

  it('re-exports SASSCompiler', () => {
    expect(TestSASSCompiler).equal(SASSCompiler);
  });

});
