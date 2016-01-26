/* @flow */

import chai, {expect} from 'chai';
import {spy, stub, match} from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import noop from 'lodash/noop';

chai.use(sinonChai);

/* eslint-disable no-unused-expressions */

class Client {
  capabilityCheck: () => void;
  command: () => void;
  on: () => void;
}
Client.prototype.capabilityCheck = noop;
Client.prototype.command = noop;
Client.prototype.on = noop;

const ALPHANUMERIC_BASE = 36,
    watch = proxyquire('../src/watch', {'fb-watchman': {Client}}).watch;

let callback, toString;

describe('watch', () => {

  beforeEach(() => {
    callback = spy();
    toString = stub().returns('qwerty');
    stub(Date, 'now').returns({toString});
    stub(console, 'log');
    stub(console, 'error');
  });

  afterEach(() => {
    Date.now.restore();
    console.log.restore();
    console.error.restore();
  });

  describe('start', () => {

    beforeEach(() => {
      watch('qwe', 'rty', callback);
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
      stub(Client.prototype, 'capabilityCheck').callsArgWith(1, 'something bad happened');
      stub(Client.prototype, 'command');
      watch('qwe', 'rty', callback);
    });

    afterEach(() => {
      Client.prototype.capabilityCheck.restore();
      Client.prototype.command.restore();
    });

    it('calls capabilityCheck', () => {
      expect(Client.prototype.capabilityCheck).calledWith({}, match.func);
    });

    it('prints an error on screen', () => {
      expect(console.error).calledWith('something bad happened');
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
        stub(Client.prototype, 'command').callsArgWith(1, 'watch-project exception', {watch: 'a watcher instance'});
        watch('qwe', 'rty', callback);
      });

      afterEach(() => {
        Client.prototype.command.restore();
      });

      it('executes a watch-project command', () => {
        expect(Client.prototype.command).calledWith(['watch-project', 'qwe'], match.func);
      });

      it('prints an error on screen', () => {
        expect(console.error).calledWith('Error initiating watch:', 'watch-project exception');
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
        expect(console.error).not.called;
      });

      it('prints a warning on screen', () => {
        expect(console.log).calledWith('warning: ', 'a warning message');
      });

    });

    describe('clock error', () => {

      beforeEach(() => {
        stub(Client.prototype, 'command', (command, cb) => {
          if ('watch-project' === command[0]) {
            cb(null, {watch: 'a watcher instance'});
          } else {
            cb('clock exception', {clock: 'clock value'});
          }
        });
        watch('qwe', 'rty', callback);
      });

      afterEach(() => {
        Client.prototype.command.restore();
      });

      it('does not print a warning on screen', () => {
        expect(console.log).not.called;
      });

      it('executes a clock command', () => {
        expect(Client.prototype.command).calledWith(['clock', 'a watcher instance'], match.func);
      });

      it('prints an error on screen', () => {
        expect(console.error).calledWith('Failed to query clock:', 'clock exception');
      });

      it('does not execute a subscribe command', () => {
        expect(Client.prototype.command).not.calledWith(['subscribe', 'a watcher instance', 'qwerty',
          {expression: ['suffix', 'rty'], since: 'clock value'}], match.func);
      });

    });

    describe('subscribe error', () => {

      beforeEach(() => {
        stub(Client.prototype, 'command', (command, cb) => {
          if ('watch-project' === command[0]) {
            cb(null, {watch: 'a watcher instance'});
          } else if ('clock' === command[0]) {
            cb(null, {clock: 'clock value'});
          } else {
            cb('subscribe exception');
          }
        });
        watch('qwe', 'rty', callback);
      });

      afterEach(() => {
        Client.prototype.command.restore();
      });

      it('executes a subscribe command', () => {
        expect(Client.prototype.command).calledWith(['subscribe', 'a watcher instance', 'qwerty',
          {expression: ['suffix', 'rty'], since: 'clock value'}], match.func);
      });

      it('prints an error on screen', () => {
        expect(console.error).calledWith('failed to subscribe: ', 'subscribe exception');
      });

    });

    describe('command success', () => {

      beforeEach(() => {
        stub(Client.prototype, 'command', (command, cb) => {
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
          expect(console.error).not.called;
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
          expect(callback).called;
        });

      });

    });

  });

});
