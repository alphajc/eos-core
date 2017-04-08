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
const crypto = require('crypto');

const files = module.exports = {};

files.upload = (req, res, next) => {
  const params = req.body;
  assert.arrayOfObject(params, "params");
  req.log.info(params);
  let results = [], data = [];

  params.forEach(function (param, index) {
    const cache = param.path;
    const storage = req.config.storage;
    const file_type = param.type || "";
    const uploaded_by = param.uploaded_by;
    const crypto_method = param.crypto || "rc4";
    const visibility = param.visibility || "public";
    const key = param.key || req.config.password || "default password.";
    const hash = crypto.createHash('sha1');
    hash.update(key);
    const hash_key = hash.digest('base64');

    if (!cache || !uploaded_by) {
      const err = {
        message: "path和uploaded_by一定要有！",
        context: param
      };
      req.log.error(err, err.message);
      results.push(err);

      if ((index + 1) === params.length) {
        return persistence();
      }

      return;
    }

    const file_size = fs.statSync(cache).size;
    require('./storage').save(
      {
        storage: storage,
        cache: cache,
        key: hash_key,
        crypto_method: crypto_method
      },
      /**
       * @param err
       * @param common
       * @param saves
       */
      (err, common, saves) => {
        if (err) {
          req.log.error(err, err.message);
          results.push(err);
          if (results.length === params.length) {
            res.send(results);
            return next();
          }
          return;
        }
        common.filename = path.basename(cache);
        common.uploaded_by = uploaded_by;
        common.crypto_method = crypto_method;
        common.visibility = visibility;
        common.size = file_size;
        common.type = file_type;
        const ret = JSON.stringify(common);
        common.key = hash_key;
        for (let k in saves) {
          common[k] = saves[k];
        }

        results.push(JSON.parse(ret));
        data.push(common);

        if ((index + 1) === params.length) {
          return persistence();
        }
      }
    );
  });

  function persistence() {
    req.log.info(data, "数据库存储");
    require('./moray').save({log: req.log, data: data}, err => {
      if (err) {
        req.log.error(err, "数据库存储时：");

        //删除已存储文件
        data.forEach(function (item) {
          fs.unlink(item.save_path, (e) => {
            if (e) {
              req.log.error(e, "删除" + item.filename + "时：");
            }
          })
        });

        return next(err);
      }

      res.send(results);
      return next();
    });
  }
};

files.download = (req, res, next) => {

};

files.getList = (req, res, next) => {

};