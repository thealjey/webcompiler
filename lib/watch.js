'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.watch = watch;

var _fbWatchman = require('fb-watchman');

var client = new _fbWatchman.Client(),
    ALPHANUMERIC_BASE = 36;

/**
 * Using the Facebook Watchman, watches the directory "dir" for changes of files with extension "type" and runs
 * "callback" when a change is detected.
 * This watcher's only goal is performance, hence the simplicity.
 *
 * @function watch
 * @param {string}   dir      - a full system path to a directory to watch
 * @param {string}   type     - a file extension
 * @param {Function} callback - a callback function
 * @see {@link https://facebook.github.io/watchman/|Watchman}
 * @example
 * import {watch} from 'webcompiler';
 * import {join} from 'path';
 *
 * watch(join(__dirname, 'src'), 'js', someFunction);
 */
function watch(dir, type, callback) {
  var subscription = Number(Date.now()).toString(ALPHANUMERIC_BASE);

  client.capabilityCheck({}, function (capabilityErr) {
    if (capabilityErr) {
      console.error(capabilityErr);
      return;
    }

    client.command(['watch-project', dir], function (watchErr, watchResp) {
      var watcher = watchResp.watch;

      if (watchErr) {
        console.error('Error initiating watch:', watchErr);
        return;
      }

      if (watchResp.warning) {
        console.log('warning: ', watchResp.warning);
      }

      client.command(['clock', watcher], function (clockErr, clockResp) {
        if (clockErr) {
          console.error('Failed to query clock:', clockErr);
          return;
        }

        client.command(['subscribe', watcher, subscription, {
          expression: ['suffix', type],
          since: clockResp.clock
        }], function (subscribeErr) {
          if (subscribeErr) {
            console.error('failed to subscribe: ', subscribeErr);
          }
        });

        client.on('subscription', function (subscriptionResp) {
          if (subscription === subscriptionResp.subscription) {
            callback();
          }
        });
      });
    });
  });
}