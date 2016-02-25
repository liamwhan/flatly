
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
         * Write data to file
         * @param {Object} data
         * @param {string} destination
         * @param {boolean} overwrite
         * @param {function} callback
         * @param {boolean} [overwrite=false] Overwrite the existing table file?
         */
        this.put = (data, destination, overwrite, callback) => {
           let ts = "-" + new Date().getTime().toString();
            let dir = path.dirname(destination);
            var stringified = JSON.stringify(data, null, 2);

            if(overwrite) {
                let back = path.join(dir, path.basename(destination, path.extname(destination)) + ts + '.bak');

                this.backup(destination, back);
            } else
            {

                let file = path.basename(destination, path.extname(destination)) + ts + '.json';
                destination = path.join(dir, file);
            }

            if(!_.isUndefined(callback)) {
                fs.writeFile(destination, stringified, callback);
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
        this.putSync = (data, destination, overwrite, callback) => {
            _.defaults(overwrite, false);
            
            let ts = "-" + new Date().getTime().toString();
            let dir = path.dirname(destination);
            var stringified = JSON.stringify(data, null, 2);

            if(overwrite) {
                let back = path.join(dir, path.basename(destination, path.extname(destination)) + ts + '.bak');

                this.backup(destination, back);
            } else
            {

                let file = path.basename(destination, path.extname(destination)) + ts + '.json';
                destination = path.join(dir, file);
            }

            if(!_.isUndefined(callback)) {
                fs.writeFile(destination, stringified, callback);
            } else {
                fs.writeFileSync(destination, stringified);
            }


        }
        /**
         * Create a backup of a file
         * @param source
         * @param destination
         */
        this.backup = (source, destination) => {
            console.log('backing up to: ', destination);
            var oldData = fs.readFileSync(source);
            fs.writeFileSync(destination, oldData);
            //fs.createReadStream(source).pipe(fs.createWriteStream(destination));
        }

    }

    module.exports = new io();

})();

