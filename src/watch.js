/* @flow */

import type {WatchCallback} from './typedef';
import {logError, log, consoleStyles} from './logger';
import {Client} from 'fb-watchman';

/* eslint-disable camelcase */

const client = new Client(),
  ALPHANUMERIC_BASE = 36,
  {yellow} = consoleStyles;

/**
 * Using the [Facebook Watchman](https://facebook.github.io/watchman/), watches the directory `dir` for changes of files
 * with extension `type` and runs `callback` when a change is detected.
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
export function watch(dir: string, type: string, callback: WatchCallback) {
  const subscription = Date.now().toString(ALPHANUMERIC_BASE);

  client.capabilityCheck({optional: [], required: ['relative_root']}, capabilityErr => {
    if (capabilityErr) {
      client.end();

      return logError(capabilityErr);
    }

    client.command(['watch-project', dir], (watchErr, watchResp) => {
      const {watch: watcher, relative_path: relative_root} = watchResp;

      if (watchErr) {
        return logError(watchErr);
      }

      if (watchResp.warning) {
        log(yellow('Warning: ', watchResp.warning));
      }

      client.command(['clock', watcher], (clockErr, clockResp) => {
        if (clockErr) {
          return logError(clockErr);
        }

        client.command(['subscribe', watcher, subscription, {
          expression: ['suffix', type],
          since: clockResp.clock,
          relative_root
        }], subscribeErr => {
          if (subscribeErr) {
            logError(subscribeErr);
          }
        });

        client.on('subscription', subscriptionResp => {
          if (subscription === subscriptionResp.subscription) {
            callback(subscriptionResp);
          }
        });
      });
    });
  });
}
