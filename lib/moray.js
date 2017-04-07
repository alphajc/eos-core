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
    save: (opts, callback)=>{
        let values = [];
        let smt = "INSERT INTO files ("+ Object.keys(opts.data).join(',') +") values(";
        for (let i in opts.data) {
            values.push("'"+ opts.data[i] + "'");
        }
        smt += values.join(",") + ")";
        console.log("插入语句：" + smt);
        db.connect()
            .then((client) => {
                client
                    .query('CREATE TABLE IF NOT EXISTS files (uuid char(36) primary key,' +
                        ' last_modify date, filename varchar(256) not null, uploaded_by char(36) not null,' +
                        ' crypto_method char(20) not null, visibility char(10) not null, size numeric,' +
                        ' type char(40), key char(20) null, save_path text not null)')
                    .then((res)=>{
                        opts.log.info(res, "创建：")
                    })
                    .catch((err) => {
                        opts.log.error(err, '创建时：');
                        return callback(err);
                    });
                client
                    .query(smt)
                    .then(res=>{
                        opts.log.info(res, "插入：");
                    })
                    .catch((err) => {
                        opts.log.error(err, '插入时：');
                        return callback(err);
                    });
                client
                    .query('SELECT * from files')
                    .then((res) => {
                        client.release();
                        // opts.log.info(res, '查询：');
                    })
                    .catch((err) => {
                        opts.log.error(err, '查询时：');
                        return callback(err);
                    });
                callback();
            })
            .catch((err) => {
                opts.log.error(err, '连接数据库时：');
                return callback(err);
            });

    }
}