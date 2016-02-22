
/**
 * @memberOf core
 */
(function () {
    const fs = require('graceful-fs');
    const glob = require('glob');
    const jph = require('json-parse-helpfulerror');
    const parse = jph.parse;
    const _ = require('lodash');
    const path = require('path');


    /**
     * @namespace io
     * @classdesc Main flatly class used to load db and query data
     * @constructor
     * @desc I/O Operations for the flatly library
     * @class
     */
    function io() {
        "use strict";

        /**
         * @func io#getAll
         * @desc Takes a glob pattern and returns an array of table files
         * @param options {Object}
         * @param options.src {String} Glob pattern of target files
         * @param {string} [options.format=JSON] A string switch that tells flatly what format the source files are in
         * @returns {Array}
         * @example var files = io.getAll('../data/*.json')
         */
        this.getAll = function (options) {

            _.defaults(options, {format: 'JSON'});

            var pattern = "";

            if(options.format !== 'JSON') {
                //TODO add support for other formats
            } else {
                pattern = path.join(options.src, '/**/*.json');
            }
            try {
                var files = glob.sync(pattern);

            } catch (e) {
                if(e.message == 'must provide pattern') {
                    console.error('Theres something wrong with the supplied glob: ', pattern);
                }
            }

            if(files.length == 0) {
                throw new Error("No files found at: " + pattern);
            }

            return files;

        };

        /**
         * @desc Parse JSON files into JS objects
         * @param dbName {String}
         * @param {String|Array} tables | A string containing the filepaths of the tables
         * @returns {Object}
         */
        this.parse = function (dbName, tables) {

            if (!_.isArray(tables)) {
                tables = [tables];
            }
            var results = {};

            tables.forEach(function (item) {
                var tblName = path.basename(item, path.extname(item)).toLowerCase();
                var tblData = parse(fs.readFileSync(item));
                results[tblName] = tblData;
            });

            return results;
        };

        /**
         * Write data to file asynchronously
         * @param data
         * @param destination
         * @param cb
         */
        this.put = (data, destination, cb) => {
            var stringified = JSON.stringify(data, null, 2);

            fs.writeFile(destination, stringified, null, cb);
        };

        /**
         * Write data to file synchronously
         * @param {Object} data
         * @param {string} destination
         * @param {boolean} [overwrite=false] Overwrite the existing table file?
         */
        this.putSync = (data, destination, overwrite) => {
            if(!overwrite) {
                let ts = "-" + new Date().getTime().toString();
                let dir = path.dirname(destination);
                let file = path.basename(destination, path.extname(destination)) + ts + '.json';
                destination = path.join(dir, file);
                console.log(destination);
            }

            var stringified = JSON.stringify(data, null, 2);

            fs.writeFileSync(destination, stringified);
        }

    }

    module.exports = new io();

})();

