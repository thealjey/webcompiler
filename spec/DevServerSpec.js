/* @flow */

import proxyquire from 'proxyquire';

class SASS {

  feDev(inPath: string, outPath: string, callback: Function) {
    callback();
  }

}

class WebpackDevServer {

  webpackInstance: any;

  config: Object;

  app: Object;

  constructor(webpackInstance: any, config: Object) {
    this.webpackInstance = webpackInstance;
    this.config = config;
  }

}

WebpackDevServer.prototype.app = {

  get(route: string, handler: Function) {
    this.handler = handler;
  }

};

class Server {

  changed() {}

  listen() {}

}

/* eslint-disable id-length */
class HotModuleReplacementPlugin {}

/* eslint-enable id-length */
class NoErrorsPlugin {}

describe('DevServer', function () {
  let DevServer, cmp, tinylr, webpack, srv, send, watch;

  beforeEach(function () {
    srv = new Server();
    tinylr = jasmine.createSpy('tinylr').and.returnValue(srv);
    webpack = jasmine.createSpy('webpack').and.returnValue('the webpack module bundler');
    send = jasmine.createSpy('send');
    watch = jasmine.createSpy('watch');

    /* eslint-disable id-length */
    webpack.HotModuleReplacementPlugin = HotModuleReplacementPlugin;

    /* eslint-enable id-length */
    webpack.NoErrorsPlugin = NoErrorsPlugin;
    spyOn(SASS.prototype.feDev, 'bind').and.callThrough();
    spyOn(WebpackDevServer.prototype.app, 'get').and.callThrough();
    DevServer = proxyquire('../lib/DevServer', {'./SASS': SASS, './watch': watch, 'tiny-lr': tinylr,
                                                'webpack-dev-server': WebpackDevServer, webpack});
  });

  describe('non-react', function () {

    beforeEach(function () {
      /* @noflow */
      cmp = new DevServer('/path/to/a/script/file.js', '/path/to/a/style/file.scss',
                          '/path/to/the/development/directory', 8000, false);
    });

    it('assigns a port number', function () {
      if (!cmp) {
        return;
      }
      expect(cmp.port).toBe(8000);
    });

    it('constructs a LiveReload server instance', function () {
      if (!cmp) {
        return;
      }
      expect(cmp.lr).toBe(srv);
    });

    it('binds the sass compiler', function () {
      if (!cmp) {
        return;
      }
      expect(SASS.prototype.feDev.bind).toHaveBeenCalledWith(jasmine.any(SASS), '/path/to/a/style/file.scss',
                                                             '/path/to/the/development/directory/style.css',
                                                             jasmine.any(Function));
      expect(cmp.compileSASS).toEqual(jasmine.any(Function));
    });

    it('invokes notifies LiveReload when SASS is recompiled', function () {
      if (!cmp) {
        return;
      }
      spyOn(cmp.lr, 'changed');
      cmp.compileSASS();
      expect(cmp.lr.changed).toHaveBeenCalledWith({body: {files: ['style.css']}});
    });

    it('invokes webpack', function () {
      expect(webpack).toHaveBeenCalledWith({
        cache: {},
        debug: true,
        devtool: 'eval-source-map',
        entry: [
          'webpack-dev-server/client?http://localhost:8000',
          'webpack/hot/only-dev-server',
          '/path/to/a/script/file.js'
        ],
        output: {
          path: '/path/to/the/development/directory',
          filename: 'script.js',
          publicPath: '/'
        },
        plugins: [
          jasmine.any(HotModuleReplacementPlugin),
          jasmine.any(NoErrorsPlugin)
        ],
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: ['babel']
          }]
        }
      });
    });

    it('instantiates WebpackDevServer', function () {
      if (!cmp) {
        return;
      }
      expect(cmp.server).toEqual(jasmine.any(WebpackDevServer));
      expect(cmp.server.webpackInstance).toBe('the webpack module bundler');
      expect(cmp.server.config).toEqual({
        contentBase: '/path/to/the/development/directory',
        publicPath: '/',
        hot: true,
        historyApiFallback: true
      });
    });

    it('creates the index route', function () {
      if (!cmp) {
        return;
      }
      expect(cmp.server.app.get).toHaveBeenCalledWith('*', jasmine.any(Function));
      cmp.server.app.handler(null, {send});
      expect(send).toHaveBeenCalledWith(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Development server - Webcompiler</title>
    <link href="/style.css" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <script src="/script.js" async defer></script>
  </body>
</html>`);
    });

  });

  describe('react', function () {

    beforeEach(function () {
      if (!cmp) {
        return;
      }
      spyOn(console, 'log');
      spyOn(console, 'error');

      /* @noflow */
      cmp = new DevServer('/path/to/a/script/file.js', '/path/to/a/style/file.scss',
                          '/path/to/the/development/directory');
    });

    it('invokes webpack', function () {
      expect(webpack).toHaveBeenCalledWith({
        cache: {},
        debug: true,
        devtool: 'eval-source-map',
        entry: [
          'webpack-dev-server/client?http://localhost:3000',
          'webpack/hot/only-dev-server',
          '/path/to/a/script/file.js'
        ],
        output: {
          path: '/path/to/the/development/directory',
          filename: 'script.js',
          publicPath: '/'
        },
        plugins: [
          jasmine.any(HotModuleReplacementPlugin),
          jasmine.any(NoErrorsPlugin)
        ],
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: ['react-hot', 'babel']
          }]
        }
      });
    });

    describe('watchSASS', function () {

      beforeEach(function () {
        if (!cmp) {
          return;
        }
        spyOn(cmp.lr, 'listen');
        spyOn(cmp, 'compileSASS');
        cmp.watchSASS('/path/to/some/directory');
      });

      it('starts up LiveReload', function () {
        if (!cmp) {
          return;
        }
        expect(cmp.lr.listen).toHaveBeenCalledWith(35729);
      });

      it('compiles SASS on start up', function () {
        if (!cmp) {
          return;
        }
        expect(cmp.compileSASS).toHaveBeenCalled();
      });

      it('starts up the watcher', function () {
        if (!cmp) {
          return;
        }
        expect(watch).toHaveBeenCalledWith('/path/to/some/directory', 'scss', cmp.compileSASS);
      });

    });

    describe('watchJS start up error', function () {

      beforeEach(function () {
        if (!cmp) {
          return;
        }
        spyOn(cmp.server, 'listen').and.callFake(function (port, host, callback) {
          callback('something bad happened');
        });
        cmp.watchJS();
      });

      it('invokes the server listen method', function () {
        if (!cmp) {
          return;
        }
        expect(cmp.server.listen).toHaveBeenCalledWith(3000, '0.0.0.0', jasmine.any(Function));
      });

      it('prints the error on screen', function () {
        expect(console.error).toHaveBeenCalledWith('something bad happened');
      });

      it('does not print the success message', function () {
        expect(console.log).not.toHaveBeenCalled();
      });

    });

    describe('watchJS success', function () {

      beforeEach(function () {
        if (!cmp) {
          return;
        }
        spyOn(cmp.server, 'listen').and.callFake(function (port, host, callback) {
          callback();
        });
        cmp.watchJS();
      });

      it('does not print any errors', function () {
        expect(console.error).not.toHaveBeenCalled();
      });

      it('prints the successful message', function () {
        expect(console.log).toHaveBeenCalledWith('Started the development server at localhost:3000');
      });

    });

    describe('run', function () {

      beforeEach(function () {
        if (!cmp) {
          return;
        }
        spyOn(cmp, 'watchJS');
        spyOn(cmp, 'watchSASS');
        cmp.run('/path/to/some/directory');
      });

      it('invokes the watchJS method', function () {
        if (!cmp) {
          return;
        }
        expect(cmp.watchJS).toHaveBeenCalled();
      });

      it('invokes the watchSASS method', function () {
        if (!cmp) {
          return;
        }
        expect(cmp.watchSASS).toHaveBeenCalledWith('/path/to/some/directory');
      });

    });

  });

});
