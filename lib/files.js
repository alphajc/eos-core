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
const crypto = require('crypto');
const path = require('path');
const uuid = require('uuid/v4');

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
    let hash_name = "";

    req.log.info({
        cache:cache,
        storage:storage,
        file_type: file_type,
        uploaded_by: uploaded_by,
        crypto_method: crypto_method,
        visibility:visibility},
        "所需要的参数：");

    if (!cache || !uploaded_by) {
        return next(restify.InvalidArgumentError("path和uploaded_by一定要有！"))
    }

    const cipher = crypto.createCipher(crypto_method, key);
    const hash = crypto.createHash('sha256');

    const input = fs.createReadStream(cache);
    input.on('data', hash.update.bind(hash));
    input.on('end', function () {
        hash_name = hash.digest('hex');
        let save_path = path.join(storage, hash_name);

        const output = fs.createWriteStream(save_path);
        input.pipe(cipher).pipe(output);
        const last_modify = new Date();
        const file_size = fs.statSync(cache).size;
        const file_uuid = uuid();

        let fileInfo = {
            type:file_type,
            filename: path.basename(cache, path.extname(cache)),
            extname: path.extname(cache),
            uploaded_by: uploaded_by,
            crypto_method: crypto_method,
            visibility: visibility,
            uuid: file_uuid,
            save_path: save_path,
            last_modify: last_modify,
            size: file_size,
            key: key
        };

        let retInfo = {
            uuid: fileInfo.uuid,
            file_name: path.basename(cache),
            uploaded_by: uploaded_by,
            size: file_size,
            type: file_type,
            visibility: visibility,
            last_modify: last_modify
        };


        res.send(retInfo);
    });

    return next();
};

files.download = (req, res, next) => {

}

files.getList = (req, res, next) => {

}