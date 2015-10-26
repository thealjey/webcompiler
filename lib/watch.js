/* @flow */

import {Client} from 'fb-watchman';

const client = new Client(),
    ALPHANUMERIC_BASE = 36;

/**
 * Using the Facebook Watchman, watches the directory "dir" for changes of files with extension "type" and runs
 * "callback" when a change is detected.
 * This watcher's only goal is performance, hence the simplicity.
 *
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
export default function watch(dir: string, type: string, callback: Function) {
  const subscription = Number(Date.now()).toString(ALPHANUMERIC_BASE);

  client.capabilityCheck({}, function (capabilityErr) {
    if (capabilityErr) {
      console.error(capabilityErr);
      return;
    }

    client.command(['watch-project', dir], function (watchError, watchResp) {
      const watcher = watchResp.watch;

      if (watchError) {
        console.error('Error initiating watch:', watchError);
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
          subscriptionResp.files.forEach(function () {
            if (subscription === subscriptionResp.subscription) {
              callback();
            }
          });
        });
      });
    });
  });
}
