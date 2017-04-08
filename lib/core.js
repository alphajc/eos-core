/**
 *
 * Created by gavin on 17-4-3.
 */
"use strict";

const path = require('path');
const restify = require('restify');
const assert = require('assert-plus');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

const ROOT = path.join(__dirname, '..');

let CORE = function (opts) {
  EventEmitter.call(this);
  assert.object(opts.config, 'opts.config');
  assert.object(opts.log, 'opts.log');

  this.root = ROOT;
  this.config = opts.config;
  this.log = opts.log;
  this.server = this.createServer();
};

util.inherits(CORE, EventEmitter);

CORE.prototype.createServer = function () {
  let config = this.config;
  let log = this.log;

  let server = restify.createServer({
    name: 'core',
    log: log,
  });

  server.root = this.root;
  server.pre(restify.pre.pause());
  server.pre(restify.pre.sanitizePath());
  server.use(restify.requestLogger());
  server.use(restify.queryParser());
  server.use(restify.gzipResponse());
  server.use(restify.bodyParser());
  server.use(restify.acceptParser(server.acceptable));
  server.use((req, res, next) => {
    req.config = this.config
    return next();
  });

  const crypto = require('./crypto');
  server.get({path: '/api/cryptoes', version: '0.0.1'}, crypto.getCryptoes);

  const files = require('./files');
  server.get({path: '/api/files/:uuid', version: '0.0.1'}, files.download);
  server.post({path: '/api/files', version: '0.0.1'}, files.upload);
  server.get({path: '/api/filelist', version: '0.0.1'}, files.getList);

  const auditLogger = require('./audit');
  server.on('after', function _filteredAuditLog(req, res, route, err) {
    if (req.path() === '/ping') {
      return;
    }
    const method = req.method;
    const body = !(method === 'GET' && Math.floor(res.statusCode / 100) === 2);

    auditLogger({
      log: req.log.child({component: 'audit', route: route && route.name}, true),
      body: body
    })(req, res, route, err);
  });

  server.on('uncaughtException', function (req, res, route, error) {
    req.log.fatal({
      err: error,
      url: req.url,
      route: route,
      params: req.params
    });
    res.send(error);
  });

  return server;
};

CORE.prototype.listen = function () {
  const core = this;

  assert.object(this.server, 'this.server');
  this.server.listen(this.config.port, this.config.host, function () {

    core.log.info('core监听在%s:%s上',
      core.server.address().address,
      core.server.address().port);
  });


  if (typeof (callback) === 'function') {
    callback(this);
  }

};

module.exports = {
  CORE: CORE,
  createServer: options => {
    return new CORE(options);
  }
};