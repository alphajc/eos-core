/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by Gavin Chan at 2017/4/5 18:02.
 */
"use strict";

const fs = require('fs');
const crypto = require('crypto');
const uuid = require('uuid/v4');
const path = require('path');

module.exports = {
    save: (args, callback) => {
        let hash_name = "";
        const input = args.input;
        const cipher = crypto.createCipher(args.crypto_method, args.key);
        const hash = crypto.createHash('sha256');

        input.on('data', hash.update.bind(hash));
        input.on('end', function () {
            hash_name = hash.digest('hex');
            let save_path = path.join(args.storage, hash_name);

            const output = fs.createWriteStream(save_path);
            input.pipe(cipher).pipe(output);

            callback({
                uuid: uuid(),
                last_modify: new Date()
            }, {
                save_path: save_path
            });
        });
    }
}