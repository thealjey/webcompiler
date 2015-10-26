/* @flow */

import proxyquire from 'proxyquire';

const ALPHANUMERIC_BASE = 36;

class Client {

  capabilityCheck() {}

  command() {}

  on() {}

}

describe('watch', function () {
  let watch, forEach, callback;

  beforeEach(function () {
    watch = proxyquire('../lib/watch', {'fb-watchman': {Client}});
    forEach = jasmine.createSpy('forEach').and.callFake(function (cb) {
      cb();
    });
    callback = jasmine.createSpy('callback');
    spyOn(Date, 'now');
    spyOn(Number.prototype, 'toString').and.returnValue('qwerty');
    spyOn(console, 'log');
    spyOn(console, 'error');
  });

  it('get the current timestamp', function () {
    if (!watch) {
      return;
    }
    watch('qwe', 'rty', Function.prototype);
    expect(Date.now).toHaveBeenCalled();
  });

  it('calls number toString', function () {
    if (!watch) {
      return;
    }
    watch('qwe', 'rty', Function.prototype);
    expect(Number.prototype.toString).toHaveBeenCalledWith(ALPHANUMERIC_BASE);
  });

  describe('capabilityCheck error', function () {

    beforeEach(function () {
      if (!watch) {
        return;
      }
      spyOn(Client.prototype, 'capabilityCheck').and.callFake(function (config, cb) {
        cb('something bad happened');
      });
      spyOn(Client.prototype, 'command');
      watch('qwe', 'rty', Function.prototype);
    });

    it('calls capabilityCheck', function () {
      expect(Client.prototype.capabilityCheck).toHaveBeenCalledWith({}, jasmine.any(Function));
    });

    it('prints an error on screen', function () {
      expect(console.error).toHaveBeenCalledWith('something bad happened');
    });

    it('does not call command', function () {
      expect(Client.prototype.command).not.toHaveBeenCalled();
    });

  });

  describe('capabilityCheck success', function () {

    beforeEach(function () {
      spyOn(Client.prototype, 'capabilityCheck').and.callFake(function (config, cb) {
        cb();
      });
    });

    describe('watch-project error', function () {

      beforeEach(function () {
        if (!watch) {
          return;
        }
        spyOn(Client.prototype, 'command').and.callFake(function (command, cb) {
          cb('watch-project exception', {watch: 'a watcher instance'});
        });
        watch('qwe', 'rty', Function.prototype);
      });

      it('executes a watch-project command', function () {
        expect(Client.prototype.command).toHaveBeenCalledWith(['watch-project', 'qwe'], jasmine.any(Function));
      });

      it('prints an error on screen', function () {
        expect(console.error).toHaveBeenCalledWith('Error initiating watch:', 'watch-project exception');
      });

      it('does not execute a clock command', function () {
        expect(Client.prototype.command).not.toHaveBeenCalledWith(['clock', 'a watcher instance'],
          jasmine.any(Function));
      });

    });

    describe('watch-project warning', function () {

      beforeEach(function () {
        if (!watch) {
          return;
        }
        spyOn(Client.prototype, 'command').and.callFake(function (command, cb) {
          cb(null, {warning: 'a warning message'});
        });
        watch('qwe', 'rty', Function.prototype);
      });

      it('does not print an error on screen', function () {
        expect(console.error).not.toHaveBeenCalled();
      });

      it('prints a warning on screen', function () {
        expect(console.log).toHaveBeenCalledWith('warning: ', 'a warning message');
      });

    });

    describe('clock error', function () {

      beforeEach(function () {
        if (!watch) {
          return;
        }
        spyOn(Client.prototype, 'command').and.callFake(function (command, cb) {
          if ('watch-project' === command[0]) {
            cb(null, {watch: 'a watcher instance'});
          } else {
            cb('clock exception', {clock: 'clock value'});
          }
        });
        watch('qwe', 'rty', Function.prototype);
      });

      it('does not print a warning on screen', function () {
        expect(console.log).not.toHaveBeenCalled();
      });

      it('executes a clock command', function () {
        expect(Client.prototype.command).toHaveBeenCalledWith(['clock', 'a watcher instance'], jasmine.any(Function));
      });

      it('prints an error on screen', function () {
        expect(console.error).toHaveBeenCalledWith('Failed to query clock:', 'clock exception');
      });

      it('does not execute a subscribe command', function () {
        expect(Client.prototype.command).not.toHaveBeenCalledWith(['subscribe', 'a watcher instance', 'qwerty', {
          expression: ['suffix', 'rty'],
          since: 'clock value'
        }], jasmine.any(Function));
      });

    });

    describe('subscribe error', function () {

      beforeEach(function () {
        if (!watch) {
          return;
        }
        spyOn(Client.prototype, 'command').and.callFake(function (command, cb) {
          if ('watch-project' === command[0]) {
            cb(null, {watch: 'a watcher instance'});
          } else if ('clock' === command[0]) {
            cb(null, {clock: 'clock value'});
          } else {
            cb('subscribe exception');
          }
        });
        watch('qwe', 'rty', Function.prototype);
      });

      it('executes a subscribe command', function () {
        expect(Client.prototype.command).toHaveBeenCalledWith(['subscribe', 'a watcher instance', 'qwerty', {
          expression: ['suffix', 'rty'],
          since: 'clock value'
        }], jasmine.any(Function));
      });

      it('prints an error on screen', function () {
        expect(console.error).toHaveBeenCalledWith('failed to subscribe: ', 'subscribe exception');
      });

    });

    describe('command success', function () {

      beforeEach(function () {
        spyOn(Client.prototype, 'command').and.callFake(function (command, cb) {
          if ('watch-project' === command[0]) {
            cb(null, {watch: 'a watcher instance'});
          } else if ('clock' === command[0]) {
            cb(null, {clock: 'clock value'});
          } else {
            cb();
          }
        });
      });

      describe('no subscribed events', function () {

        beforeEach(function () {
          if (!watch) {
            return;
          }
          spyOn(Client.prototype, 'on').and.callFake(function (event, cb) {
            cb({files: {forEach}, subscription: 'some other subscription'});
          });
          watch('qwe', 'rty', callback);
        });

        it('does not print an error on screen', function () {
          expect(console.error).not.toHaveBeenCalled();
        });

        it('calls on', function () {
          expect(Client.prototype.on).toHaveBeenCalledWith('subscription', jasmine.any(Function));
        });

        it('calls forEach', function () {
          expect(forEach).toHaveBeenCalledWith(jasmine.any(Function));
        });

        it('does not call callback', function () {
          expect(callback).not.toHaveBeenCalled();
        });

      });

      describe('subscribed event', function () {

        beforeEach(function () {
          if (!watch) {
            return;
          }
          spyOn(Client.prototype, 'on').and.callFake(function (event, cb) {
            cb({files: {forEach}, subscription: 'qwerty'});
          });
          watch('qwe', 'rty', callback);
        });

        it('calls callback', function () {
          expect(callback).toHaveBeenCalled();
        });

      });

    });

  });

});
