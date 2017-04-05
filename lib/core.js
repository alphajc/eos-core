/**
 *
 * Created by gavin on 17-4-3.
 */
"use strict";

var path = require('path');
var restify = require('restify');
var assert = require('assert-plus');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var ROOT = path.join(__dirname, '..');

var CORE = function (opts) {
    EventEmitter.call(this);
    assert.object(opts.config, 'opts.config');
    assert.object(opts.log, 'opts.log');

    this.root = ROOT;
    this.config = opts.config;
    this.log = opts.log;
    this.server =  this.createServer();
};

util.inherits(CORE, EventEmitter);

CORE.prototype.createServer = function () {
    let config = this.config;
    let log = this.log;

    var server = restify.createServer({
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
    server.use((req, res, next)=>{
        req.config = this.config
        return next();
    });

    var crypto = require('./crypto');
    server.get({path: '/cryptoes', version: '0.0.1'}, crypto.getCryptoes);

    var files = require('./files');
    server.get({path:'/files', version:'0.0.1'}, files.download);
    server.post({path:'/files', version: '0.0.1'}, files.upload);
    server.get({path: '/filelist', version: '0.0.1'},files.getList);

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
}


CORE.prototype.listen = function () {
    var core = this;

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