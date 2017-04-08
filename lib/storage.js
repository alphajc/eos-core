/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by Gavin Chan at 2017/4/5 18:02.
 */
/**
 * @fileoverview 该模块目的是将文件存入文件系统
 */
"use strict";

const fs = require('fs');
const crypto = require('crypto');
const uuid = require('uuid/v4');
const path = require('path');
const restify = require('restify');

module.exports = {
  save: (args, callback) => {
    let hash_name = "";
    const hash_input = fs.createReadStream(args.cache);
    const cipher_input = fs.createReadStream(args.cache);
    if (crypto.getCiphers().indexOf(args.crypto_method) === -1) {
      return callback(new restify.InvalidArgumentError("加密方法不存在！"));
    }
    const cipher = crypto.createCipher(args.crypto_method, args.key);
    const hash = crypto.createHash('sha256');

    hash_input.on('data', hash.update.bind(hash));
    hash_input.on('end', function () {
      hash_name = hash.digest('hex');
      let save_path = path.join(args.storage, hash_name);
      if (fs.existsSync(save_path)) {
        console.log("文件已存储！");
        return callback(new restify.InvalidArgumentError("文件已经被存储！"));
      } else {
        console.log("文件未存储！");
        const output = fs.createWriteStream(save_path);
        cipher_input.pipe(cipher).pipe(output);

        callback(null, {
          uuid: uuid(),
          last_modify: (new Date()).toJSON()
        }, {
          save_path: save_path
        });
      }
    });
  }
}