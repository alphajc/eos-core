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

module.exports = {
  save: (args, callback) => {
    const cache = args.cache;
    const crypto_method = args.crypto_method;
    let hash = crypto.createHash('sha256');
    hash.update(args.key);
    const hash_key = hash.digest('base64');
    const hash_input = fs.createReadStream(cache);
    const cipher_input = fs.createReadStream(cache);
    if (crypto.getCiphers().indexOf(crypto_method) === -1) {
      return callback({
        message: "加密方法不存在！",
        detail: {
          cache: cache,
          crypto: crypto_method
        }});
    }
    const cipher = crypto.createCipher(crypto_method, hash_key);

    hash = crypto.createHash('sha256');
    hash_input.on('data', hash.update.bind(hash));
    hash_input.on('end', function () {
      const hash_name = hash.digest('hex');
      const save_path = path.join(args.data_area, hash_name);
      if (fs.existsSync(save_path)) {
        return callback({
          message: "文件已经被存储！",
          detail: {
            cache: cache
          }
        });
      } else {
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
  },
  obtain: (args, callback) => {
    const file_path = args.save_path;
    const crypto_method = args.crypto_method;
    const hash = crypto.createHash('sha256');
    hash.update(args.key);
    const hash_key = hash.digest('base64');
    const input = fs.createReadStream(file_path);
    const output = fs.createWriteStream(path.join(args.cache_area, args.filename));
    if (crypto.getCiphers().indexOf(crypto_method) === -1) {
      return callback({
        message: "加密方法不存在！",
        detail: {
          cache: args.filename,
          crypto: crypto_method
        }});
    }
    const decipher = crypto.createDecipher(crypto_method, hash_key);

    input.pipe(decipher).pipe(output);
    callback();
  }
}