/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by Gavin Chan at 2017/4/5 13:20.
 */

"use strict";

const restify = require('restify');
const crypto = require('crypto');

const Crypto = module.exports ={};

Crypto.getCryptoes = (req, res, next) => {
    const cryptoes = crypto.getCiphers();

    if (!cryptoes) {
        return next(new restify.InternalServerError("算法没有被找到！"))
    } else {
        res.send(cryptoes);
    }


    return next();
};