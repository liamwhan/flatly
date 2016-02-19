;(function () {
    "use strict";
    var _ = require('lodash');
    var hash = {};

    function use(fn, name) {
        if(_.isFunction(fn)) {
            if(typeof(name) == 'String' && !_.isNil(name)) {
                hash[name] = fn;
            } else {
                throw new Error('The second argument is required and must be a string')
            }
        } else {
            throw new Error('The first argument is required and must be a function');
        }
    }
})();
