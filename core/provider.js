;(function () {
    "use strict";
    var _ = require('lodash');

    module.exports = function Provider() {
        var hash = {};

        this.use = function(fn, name) {
            if(_.isFunction(fn)) {
                var fnClone = _.cloneDeep(fn);
                var nameClone = _.cloneDeep(name);

                if(_.isString(name) && !_.isNil(name)) {

                    //hash[nameClone] = fnClone;
                    hash[name] = fn;
                    return this;

                } else {

                    throw new Error('The second argument is required and must be a string');
                }

            } else {

                throw new Error('The first argument is required and must be a function');
            }
        };

        this.provide = function(name) {
            if(_.isString(name))
            {

                    if(_.has(hash, name)) {
                        return _.pick(hash, name);
                    } else {
                        throw new Error('There is no provider named ' + name);
                    }

            } else {
                throw Error('The "name" argument must be a string.');
            }
        };

        this.has = function(name) {
            return _.has(hash, name);
        };

        this.remove = function(name) {
            _.unset(hash, name);
            return this;
        };
    }
})();
