/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by Gavin Chan at 2017/4/6 20:36.
 */
const assert = require('assert-plus');
const bunyan = require('bunyan');

const HttpError = require('restify').HttpError;

/**
 * Returns a Bunyan audit logger suitable to be used in a server.on('after')
 * event.  I.e.:
 *
 * server.on('after', restify.auditLogger({ log: myAuditStream }));
 *
 * This logs at the INFO level.
 *
 * @param {Object} options at least a bunyan logger (log).
 * @return {Function} to be used in server.after.
 */

function auditLogger(options) {
    assert.object(options, 'options');
    assert.object(options.log, 'options.log');

    let log = options.log.child({
        audit: true,
        serializers: {
            err: bunyan.stdSerializers.err,
            req: function auditRequestSerializer(req) {
                if (!req) {
                    return (false);
                }

                let timers = {};
                (req.timers || []).forEach(function (time) {
                    let t = time.time;
                    let _t = Math.floor((1000000 * t[0]) +
                        (t[1] / 1000));
                    timers[time.name] = _t;
                });
                let obj = ({
                    method: req.method,
                    url: req.url,
                    headers: req.headers,
                    httpVersion: req.httpVersion,
                    trailers: req.trailers,
                    version: req.version,
                    body: options.body === true ?
                        req.body : undefined,
                    timers: timers
                });

                if (req.session && req.session.data.user) {
                    obj.reqUser = req.session.data.user;
                }

                return obj;
            },

            res: function auditResponseSerializer(res) {
                if (!res)
                    return (false);

                let body;
                if (options.body === true) {
                    if (res._body instanceof HttpError) {
                        body = res._body.body;
                    } else {
                        body = res._body;
                    }
                }

                return ({
                    statusCode: res.statusCode,
                    headers: res._headers,
                    trailer: res._trailer || false,
                    body: body
                });

            }

        }

    });

    function audit(req, res, route, err) {
        let latency = res.get('Response-Time');
        if (typeof (latency) !== 'number')
            latency = Date.now() - req._time;

        let obj = {
            remoteAddress: req.connection.remoteAddress,
            remotePort: req.connection.remotePort,
            req_id: req.getId(),
            req: req,
            res: res,
            err: err,
            latency: latency,
            secure: req.secure,
            _audit: true
        };

        log.info(obj, 'handled: %d', res.statusCode);

        return (true);
    }

    return (audit);
}

// Exports
module.exports = auditLogger;