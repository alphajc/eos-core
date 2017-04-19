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
const async = require('async');

const moray = require('./moray');
const storage = require('./storage');

const files = module.exports = {};

files.upload = (req, res, next) => {
  const params = req.body;
  assert.arrayOfObject(params, "params");
  req.log.info(params);
  let data = [];

  async.mapSeries(params, (param, callback) => {
    const cache = param.path;
    const data_area = req.config.data_area;
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

      return callback(null, err);
    }

    const file_size = fs.statSync(cache).size;
    storage.save(
      {
        data_area: data_area,
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

          return callback(null, err);
        }

        common.filename = param.originalname;
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

        data.push(common);
        callback(null, JSON.parse(ret));
      }
    );
  },(err, results) => {

    if (err) {
      req.log.error(err);
      next(err);
    }
    req.log.info(data, "数据库存储");
    if (data.length === 0) {
      return res.send(results);
    }

    moray.save({log: req.log, data: data}, err => {
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
    });

  });

};

files.download = (req, res, next) => {
  req.log.debug(req.params, "下载参数");
  moray.query({
      ret:["*"],
      cond:{
        uuid: req.params.uuid
      }
    },
    (error, results) => {
      req.log.info(results.rows, "查询结果：");
      if (error) {
        req.log.error(error, "查询时：");
        return next(error);
      }

      if (results.rows.length === 0) {
        return next(new restify.InvalidArgumentError("文件不存在！"));
      }

      const result = results.rows[0];

      req.log.info({
        save_path: result.save_path,
        crypto_method: result.crypto_method,
        key: result.key,
        filename: result.filename,
        cache_area: req.params.cache_area
      }, "obtain");

      storage.obtain({
        save_path: result.save_path,
        crypto_method: result.crypto_method,
        key: result.key,
        cache_area: req.params.cache_area
      }, (err, path) => {
        req.log.debug("完成返回");
        res.send({
          uuid: req.params.uuid,
          path: path,
          type: result.type,
          filename: result.filename,
          size: result.size
        });
        return next();
      });
    }
  );
};

files.getList = (req, res, next) => {
  moray.query({
    ret:["uuid", "filename", "type", "size", "visibility", "uploaded_by", "last_modify"],
    cond:req.params},
    (error, results) => {
      req.log.info(results.rows, "查询结果：");
      if (error) {
        req.log.error(error, "查询时：");
        return next(error);
      }
      res.send(results.rows);
      return next();
    }
  );
};