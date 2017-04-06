/**
 * Created by gavin on 17-4-3.
 */
const path = require('path');
const assert = require('assert');
const fs = require('fs');
const restify = require('restify');


function loadConfig(file) {
    assert.ok(file);

    const _f = fs.readFileSync(file, 'utf8');
    return JSON.parse(_f);
}


const cfgFile = path.join(__dirname, '/etc/config.json');
const cfg = loadConfig(cfgFile);

const log = require('bunyan').createLogger({
    name: 'core',
    level: process.env.LOG || cfg.logLevel || 'info',
    serializers: restify.bunyan.serializers,
    streams:[ {
        level: 'info',
        stream: process.stdout
    },{
        path:'./log/fatal.log',
        level: 'fatal'
    }]
});

require('./lib/db').createPGPool({config:cfg.postgres, log:log});

log.info('初始化CORE');
const core = require('./lib/core').createServer({
    config: cfg,
    log: log,
    version: require('./package.json').version
});

core.listen(function ready() {
    log.info('开始监听！');
});

process.on('uncaughtException', function preventOtherError(e) {
    log.fatal(e, '未捕获的异常');
});
// Increase/decrease loggers levels using SIGUSR2/SIGUSR1:
const sigyan = require('sigyan');
sigyan.add([log]);