/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import {Client} from './mock';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */
/* eslint-disable require-jsdoc */
/* eslint-disable camelcase */

const ALPHANUMERIC_BASE = 36,
  capabilityErr = new Error('capabilityErr'),
  watchErr = new Error('watchErr'),
  clockErr = new Error('clockErr'),
  subscribeErr = new Error('subscribeErr');

let callback, toString, watch, logError, log, yellow;

function req(options: Object = {}) {
  return proxyquire('../src/watch', options).watch;
}

describe('watch', () => {

  beforeEach(() => {
    logError = stub();
    log = stub();
    yellow = stub().returns('yellow text');
    watch = req({'fb-watchman': {Client}, './logger': {logError, log, consoleStyles: {yellow}}});
    callback = spy();
    toString = stub().returns('qwerty');
    stub(Date, 'now').returns({toString});
  });

  afterEach(() => {
    Date.now.restore();
  });

  describe('start', () => {

    beforeEach(() => {
      watch('directory', 'type', callback);
    });

    it('gets the current timestamp', () => {
      expect(Date.now).called;
    });

    it('calls number toString', () => {
      expect(toString).calledWith(ALPHANUMERIC_BASE);
    });

  });

  describe('capabilityCheck error', () => {

    beforeEach(() => {
      stub(Client.prototype, 'capabilityCheck').callsArgWith(1, capabilityErr);
      stub(Client.prototype, 'command');
      watch('qwe', 'rty', callback);
    });

    afterEach(() => {
      Client.prototype.capabilityCheck.restore();
      Client.prototype.command.restore();
    });

    it('calls capabilityCheck', () => {
      expect(Client.prototype.capabilityCheck).calledWith({optional: [], required: ['relative_root']}, match.func);
    });

    it('prints an error on screen', () => {
      expect(logError).calledWith(capabilityErr);
    });

    it('does not call command', () => {
      expect(Client.prototype.command).not.called;
    });

  });

  describe('capabilityCheck success', () => {

    beforeEach(() => {
      stub(Client.prototype, 'capabilityCheck').callsArg(1);
    });

    afterEach(() => {
      Client.prototype.capabilityCheck.restore();
    });

    describe('watch-project error', () => {

      beforeEach(() => {
        stub(Client.prototype, 'command').callsArgWith(1, watchErr, {watch: 'a watcher instance'});
        watch('qwe', 'rty', callback);
      });

      afterEach(() => {
        Client.prototype.command.restore();
      });

      it('executes a watch-project command', () => {
        expect(Client.prototype.command).calledWith(['watch-project', 'qwe'], match.func);
      });

      it('prints an error on screen', () => {
        expect(logError).calledWith(watchErr);
      });

      it('does not execute a clock command', () => {
        expect(Client.prototype.command).not.calledWith(['clock', 'a watcher instance'], match.func);
      });

    });

    describe('watch-project warning', () => {

      beforeEach(() => {
        stub(Client.prototype, 'command').callsArgWith(1, null, {warning: 'a warning message'});
        watch('qwe', 'rty', callback);
      });

      afterEach(() => {
        Client.prototype.command.restore();
      });

      it('does not print an error on screen', () => {
        expect(logError).not.called;
      });

      it('prints a warning on screen', () => {
        expect(yellow).calledWith('Warning: ', 'a warning message');
        expect(log).calledWith('yellow text');
      });

    });

    describe('clock error', () => {

      beforeEach(() => {
        stub(Client.prototype, 'command').callsFake((command, cb) => {
          if ('watch-project' === command[0]) {
            cb(null, {watch: 'a watcher instance'});
          } else {
            cb(clockErr, {clock: 'clock value'});
          }
        });
        watch('qwe', 'rty', callback);
      });

      afterEach(() => {
        Client.prototype.command.restore();
      });

      it('does not print a warning on screen', () => {
        expect(log).not.called;
      });

      it('executes a clock command', () => {
        expect(Client.prototype.command).calledWith(['clock', 'a watcher instance'], match.func);
      });

      it('prints an error on screen', () => {
        expect(logError).calledWith(clockErr);
      });

      it('does not execute a subscribe command', () => {
        expect(Client.prototype.command).not.calledWith(['subscribe', 'a watcher instance', 'qwerty',
          {expression: ['suffix', 'rty'], since: 'clock value'}], match.func);
      });

    });

    describe('subscribe error', () => {

      beforeEach(() => {
        stub(Client.prototype, 'command').callsFake((command, cb) => {
          if ('watch-project' === command[0]) {
            cb(null, {watch: 'a watcher instance', relative_path: 'relative path'});
          } else if ('clock' === command[0]) {
            cb(null, {clock: 'clock value'});
          } else {
            cb(subscribeErr);
          }
        });
        watch('qwe', 'rty', callback);
      });

      afterEach(() => {
        Client.prototype.command.restore();
      });

      it('executes a subscribe command', () => {
        expect(Client.prototype.command).calledWith(['subscribe', 'a watcher instance', 'qwerty',
          {expression: ['suffix', 'rty'], since: 'clock value', relative_root: 'relative path'}], match.func);
      });

      it('prints an error on screen', () => {
        expect(logError).calledWith(subscribeErr);
      });

    });

    describe('command success', () => {

      beforeEach(() => {
        stub(Client.prototype, 'command').callsFake((command, cb) => {
          if ('watch-project' === command[0]) {
            cb(null, {watch: 'a watcher instance'});
          } else if ('clock' === command[0]) {
            cb(null, {clock: 'clock value'});
          } else {
            cb();
          }
        });
      });

      afterEach(() => {
        Client.prototype.command.restore();
      });

      describe('no subscribed events', () => {

        beforeEach(() => {
          stub(Client.prototype, 'on').callsArgWith(1, {subscription: 'some other subscription'});
          watch('qwe', 'rty', callback);
        });

        afterEach(() => {
          Client.prototype.on.restore();
        });

        it('does not print an error on screen', () => {
          expect(logError).not.called;
        });

        it('calls on', () => {
          expect(Client.prototype.on).calledWith('subscription', match.func);
        });

        it('does not call callback', () => {
          expect(callback).not.called;
        });

      });

      describe('subscribed event', () => {

        beforeEach(() => {
          stub(Client.prototype, 'on').callsArgWith(1, {subscription: 'qwerty'});
          watch('qwe', 'rty', callback);
        });

        afterEach(() => {
          Client.prototype.on.restore();
        });

        it('calls callback', () => {
          expect(callback).calledWith({subscription: 'qwerty'});
        });

      });

    });

  });

});
