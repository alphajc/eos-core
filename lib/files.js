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
        let err = new restify.InvalidArgumentError("path和uploaded_by一定要有！");
        req.log.error(err, err.message);
        return next(err);
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
         * @param err
         * @param common
         * @param saves
         */
        (err, common, saves) => {
            if (err) {
                req.log.error(err, err.message);
                return next(err);
            }
            common.filename = path.basename(cache);
            common.uploaded_by = uploaded_by;
            common.crypto_method = crypto_method;
            common.visibility = visibility;
            common.size = file_size;
            common.type = file_type;
            let ret = JSON.stringify(common);
            common.key = key;
            for (let k in saves) {
                common[k] = saves[k];
            }
            req.log.info(common, "数据库存储");
            require('./moray').save({log:req.log, data: common},err=>{
                if (err) {
                    req.log.error(err, "数据库存储：");
                    return next(err);
                }

                res.send(JSON.parse(ret));
                return next();
            });
        }
    );
};

files.download = (req, res, next) => {

};

files.getList = (req, res, next) => {

};