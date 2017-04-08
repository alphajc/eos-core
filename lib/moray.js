/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by Gavin Chan at 2017/4/6 8:13.
 */
/**
 * @fileoverview 该模块目的是将文件属性存入数据库
 */
"use strict";

var db = require('./db');

module.exports = {
  save: (opts, callback) => {
    let smt = "INSERT INTO files (" + Object.keys(opts.data[0]).join(',') + ") values ";
    const items = opts.data.map(function (it) {
      let values = [];
      for (let i in it) {
        values.push("'" + it[i] + "'");
      }
      return "\n(" + values.join(",") + ")\n";
    });
    smt += items.join(",");

    console.log("插入语句：" + smt);
    db.connect()
      .then((client) => {
        client.query('CREATE TABLE IF NOT EXISTS files (uuid char(36) primary key,' +
            ' last_modify date, filename varchar(256) not null, uploaded_by char(36) not null,' +
            ' crypto_method char(20) not null, visibility char(10) not null, size numeric,' +
            ' type char(40), key char(30) not null, save_path text not null)', (err, res) => {
            if (err) {
              err.message = "<<<<<创建数据表>>>>>\n" + err.message;
              return callback(err);
            }
            opts.log.info(res, "创建：");
            client.query(smt, (err, res) => {
              if (err) {
                err.message = "<<<<<插入数据>>>>>\n" + err.message;
                return callback(err);
              }
              opts.log.info(res, "插入：");
              callback();
            });
          });
      })
      .catch((err) => {
        return callback(err);
      });

  }
}