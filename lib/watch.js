'use strict';

exports.__esModule = true;
exports.watch = watch;

var _fbWatchman = require('fb-watchman');

var client = new _fbWatchman.Client(),
    ALPHANUMERIC_BASE = 36;

/**
 * Using the Facebook Watchman, watches the directory `dir` for changes of files with extension `type` and runs
 * `callback` when a change is detected.
 *
 * This watcher's only goal is performance, hence the simplicity.
 *
 * @function watch
 * @param {string}        dir      - a full system path to a directory to watch
 * @param {string}        type     - a file extension
 * @param {WatchCallback} callback - a callback function
 * @see {@link https://facebook.github.io/watchman/ Watchman}
 * @example
 * import {watch} from 'webcompiler';
 * // or - import {watch} from 'webcompiler/lib/watch';
 * // or - var watch = require('webcompiler').watch;
 * // or - var watch = require('webcompiler/lib/watch').watch;
 * import {join} from 'path';
 *
 * watch(join(__dirname, 'src'), 'js', someFunction);
 */
function watch(dir, type, callback) {
  var subscription = Date.now().toString(ALPHANUMERIC_BASE);

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
        console.log('Warning:', watchResp.warning);
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
            console.error('Failed to subscribe:', subscribeErr);
          }
        });

        client.on('subscription', function (subscriptionResp) {
          if (subscription === subscriptionResp.subscription) {
            callback(subscriptionResp);
          }
        });
      });
    });
  });
}