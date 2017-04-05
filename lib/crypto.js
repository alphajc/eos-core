/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by Gavin Chan at 2017/4/5 13:20.
 */

"use strict";

var restify = require('restify');
var crypto = require('crypto');

var Crypto = module.exports ={};

Crypto.getCryptoes = (req, res, next) => {
    let cryptoes = crypto.getCiphers();

    if (!cryptoes) {
        return next(restify.InternalServerError("算法没有被找到！"))
    } else {
        res.send(cryptoes);
    }


    return next();
};