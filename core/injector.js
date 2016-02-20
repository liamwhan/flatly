/**
 * @namespace core
 *
 */
;(function () {
    var _ = require('lodash');
    var provider = require('./provider');

    /**
     * Regular Expression to strip comments - taken from AngularJS source injector.js
     * @type {RegExp}
     * @constant
     * @private
     */
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    /**
     * Regular Expression to identify ES6 arrow functions - taken from AngularJS source injector.js
     * @type {RegExp}
     * @constant
     * @private
     */
    const ARROW_ARG = /^([^\(]+?)=>/;

    /**
     * Regular Expression to extract all argument names from a function into a single string - taken from AngularJS source injector.js
     * @type {RegExp}
     * @constant
     * @private
     */
    const FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m;

    /**
     * Regular Expression to split arguments string into array of arguments - taken from AngularJS source injector.js
     * @type {RegExp}
     * @constant
     * @private
     */
    const FN_ARG_SPLIT = /,/;

    const FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;


    function extractArgs(fn) {
        var fnText = fn.toString().replace(STRIP_COMMENTS, '');

        return fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);

    }

    function annotate(fn) {
        var argDecl, inject, argSplit;

        inject = [];

        if(_.isFunction(fn)) {
            argDecl = extractArgs(fn);
            argSplit = argDecl[1].split(FN_ARG_SPLIT);
            argSplit.forEach(function(arg) {
                arg.replace(FN_ARG, function(allArgs, underscoreChar, argName) {
                    inject.push(argName);
                })
            });


            fn.deps = inject;

            return fn;

        } else {
            throw new Error("Injection target is not a function or function signature. Only functions can be injected.");
        }
    }

    function Injector(fn) {
        return annotate(fn);
    }

    module.exports = Injector;

})();