/**
 *
 * Created by gavin on 17-4-3.
 */

var CORE = opts => {
    
};

module.exports = {
    CORE: CORE,
    createServer: options => {
        return new CORE(options);
    }
};