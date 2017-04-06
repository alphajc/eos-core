/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by Gavin Chan at 2017/4/5 14:06.
 */

"use strict";

const restify = require('restify');
const assert = require('assert-plus');
const fs = require('fs');
const path = require('path');

const files = module.exports = {};

files.upload = (req, res, next) => {
    let params = req.body;
    assert.object(params, "params");
    req.log.info(params);

    let cache = params.path;
    let storage = req.config.storage;
    let file_type = params.type || "";
    let uploaded_by = params.uploaded_by;
    let crypto_method = params.crypto || "rc4";
    let visibility = params.visibility || "public";
    let key = params.key || req.config.password ||"default password.";

    if (!cache || !uploaded_by) {
        return next(restify.InvalidArgumentError("path和uploaded_by一定要有！"))
    }

    const file_size = fs.statSync(cache).size;
    const input = fs.createReadStream(cache);
    require('./storage').save(
        {
            storage:storage,
            input:input,
            key:key,
            crypto_method:crypto_method
        },
        /**
         * @param common
         * @param saves
         */
        (err, common, saves) => {
            if (err) {
                return next(err);
            }
            common.filename = path.basename(cache);
            common.uploaded_by = uploaded_by;
            common.crypto_method = crypto_method;
            common.visibility = visibility;
            common.size = file_size;
            common.type = file_type;
            req.log.info(common, "res.send");
            var ret = JSON.stringify(common);
            common.key = key;
            for (let k in saves) {
                common[k] = saves[k];
            }
            req.log.info(common, "database save");
            require('./moray').save({log:req.log, data: common},err=>{
                if (err) {
                    return next(err);
                }

                res.send(ret);
            });
        }
    );

    return next();
};

files.download = (req, res, next) => {

}

files.getList = (req, res, next) => {

}