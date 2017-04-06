/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by Gavin Chan at 2017/4/6 9:48.
 */
"use strict";
const pg = require('pg');
const assert = require('assert-plus');
let pool;
//export the query method for passing queries to the pool
module.exports.query = function (text, values, callback) {
    assert.object(pool, 'pool');
    pool.blog({text:text, values:values}, "query");
    return pool.query(text, values, callback);
};

// the pool also supports checking out a client for
// multiple operations, such as a transaction
module.exports.connect = function (callback) {
    assert.object(pool, 'pool');
    return pool.connect(callback);
};

module.exports.createPGPool = (opts) => {
    opts.log = console.log;
    pool = new pg.Pool(opts.config);
    pool.blog = opts.log;

    pool.on('error', function (err, client) {
        pool.blog.error(err, 'idle client error');
    });
};