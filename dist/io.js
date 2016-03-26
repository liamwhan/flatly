'use strict';

/**
 * @memberOf core
 */
(function () {
    var fs = require('graceful-fs');
    var glob = require('glob');
    var jph = require('json-parse-helpfulerror');
    var jsonParse = jph.parse;
    var _ = require('lodash');
    var path = require('path');

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

        var _this = this;

        this.getAll = function (options) {

            _.defaults(options, { format: 'JSON' });

            var pattern = "";

            if (options.format !== 'JSON') {
                //TODO add support for other formats
            } else {
                    pattern = path.join(options.src, '/**/*.json');
                }
            try {
                var files = glob.sync(pattern);
            } catch (e) {
                if (e.message == 'must provide pattern') {
                    console.error('Theres something wrong with the supplied glob: ', pattern);
                }
            }

            if (files.length == 0) {
                throw new Error("No files found at: " + pattern);
            }

            return files;
        };

        this.getOne = function (filePath) {
            return parse(fs.readFileSync(filePath));
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
                results[tblName] = jsonParse(fs.readFileSync(item));
            });

            return results;
        };

        /**
          * Write data to file
          * @param {Object} data
          * @param {string} destination
          * @param {boolean} overwrite
          * @param {function} callback
          * @param {boolean} [overwrite=false] Overwrite the existing table file?
          */
        this.put = function (data, destination, overwrite, callback) {
            var ts = "-" + new Date().getTime().toString();
            var dir = path.dirname(destination);
            var stringified = JSON.stringify(data, null, 2);

            if (overwrite) {
                var back = path.join(dir, path.basename(destination, path.extname(destination)) + ts + '.bak');

                _this.backup(destination, back);
            } else {

                var file = path.basename(destination, path.extname(destination)) + ts + '.json';
                destination = path.join(dir, file);
            }

            if (!_.isUndefined(callback)) {
                fs.writeFile(destination, stringified, {}, callback);
            } else {
                fs.writeFileSync(destination, stringified);
            }
        };

        /**
         * Write data to file synchronously
         * @deprecated Will be removed in version 0.1.6
         * @param {Object} data
         * @param {string} destination
         * @param {boolean} overwrite
         * @param {function} callback
         * @param {boolean} [overwrite=false] Overwrite the existing table file?
         */
        this.putSync = function (data, destination, overwrite, callback) {
            _.defaults(overwrite, false);

            var ts = "-" + new Date().getTime().toString();
            var dir = path.dirname(destination);
            var stringified = JSON.stringify(data, null, 2);

            if (overwrite) {
                var back = path.join(dir, path.basename(destination, path.extname(destination)) + ts + '.bak');

                _this.backup(destination, back);
            } else {

                var file = path.basename(destination, path.extname(destination)) + ts + '.json';
                destination = path.join(dir, file);
            }

            if (!_.isUndefined(callback)) {
                fs.writeFile(destination, stringified, callback);
            } else {
                fs.writeFileSync(destination, stringified);
            }
        };
        /**
         * Create a backup of a file
         * @param source
         * @param destination
         */
        this.backup = function (source, destination) {
            console.log('backing up to: ', destination);
            var oldData = fs.readFileSync(source);
            fs.writeFileSync(destination, oldData);
            //fs.createReadStream(source).pipe(fs.createWriteStream(destination));
        };
    }

    module.exports = new io();
})();