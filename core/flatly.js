/**
 * @fileOverview
 * @author Liam Whan
 * @memberOf core
 */
;
(function () {
    "use strict";

    const io = require('./io');
    const path = require('path');
    const _ = require('lodash');

    /**
     * @namespace flatly
     * @classdesc Main flatly class used to load db and query data
     * @class
     * @constructor
     * @returns {flatly}
     */
    function flatly() {

        /**
         * @member _tables Tables collection
         * @type {Object}
         * @private
         */
        let _tables = [],
            /**
             * @member _files Array of table file names
             * @type {Array}
             * @private
             */
            _files,
            /**
             * @member _baseDir The base directory where the table files are located.
             * @type {string}
             * @private
             */
            _baseDir = "";

        /**
         * Removes flatly metadata before saving to disk
         * @function flatly~_removeMeta
         * @param data
         * @returns {*}
         * @private
         */
        let _removeMeta = (data) => {
            var clone = _.cloneDeep(data);
            if (_.has(clone, '$$flatly')) {
                delete clone['$$flatly'];
            }

            _.each(clone, (row) => {
                if (_.has(row, '$$flatly')) {
                    delete row['$$flatly'];
                }
            });

            return clone;
        };


        if (new.target === undefined) {
            throw "You must instantiate flatly. e.g. const Flatly = require('flatly');\r\nvar flatly = new Flatly();"
        }


        /**
         * @function flatly~_parseCriteria
         * @desc Helper method to parse the search criteria object
         * @private
         * @param criteria
         * @returns {Object} The search result object is of form {"columnName": searchTerm} which is used by the find methods
         */
        function _parseCriteria(criteria) {

            if (!_.has(criteria, 'from') || !_.has(criteria, 'where') || !_.has(criteria, 'where.column') || !_.has(criteria, 'where.equals')
            ) {
                throw new Error('You must include both "where" and "from" criteria to use findOne()');
            }
            let search = {};
            search[criteria.where.column] = criteria.where.equals;

            return search;
        }

        /**
         * The name of the database currently in use
         * @member {String}
         */
        this.name = undefined;

        /**
         * Returns currently selected database name and table names
         *
         * @function flatly#dbInfo
         * @returns {{name: String, tables: Array, count: number}} An object with the database name, table names and table count
         */
        this.dbInfo = () => {
            return {
                name: this.name,
                tables: this.getSchema(),
                count: this.getSchema().length
            }
        };

        /**
         * Returns the schema of the current DB
         *
         * @function flatly#getSchema
         * @returns {Array}
         */
        this.getSchema = () => _.keys(_tables);


        /**
         * Returns a deep clone of the tables array
         *
         * @memberOf flatly
         * @function flatly#tables
         * @returns {Array}
         */
        this.tables = () => _tables;

        /**
         * Returns an object representing the table requested. Use {@link flatly#findOne} or {@link flatly#findAll} for querying table contents
         *
         * @function flatly#getTable
         * @param tblName {String} The name of the table to be returned
         * @returns {Object} An object representing the requested table
         */
        this.getTable = function (tblName) {
            tblName = tblName.toLowerCase();
            return _.cloneDeep(_tables[tblName]);
        };

        /**
         * Returns a row from the specified table
         *
         * @function flatly#findOne
         * @param {Object} criteria An options object with the search details
         * @param {String} criteria.from The name of the table to search
         * @param {Object} criteria.where An object containing the column and value criterion
         * @params {String} criteria.where.column The name of the column to search
         * @params {number|String} criteria.where.equals The value to search the column for
         * @returns {?Array} An array containing the search result
         */
        this.findOne = (criteria) => {
            let tblName = criteria.from;
            let search = _parseCriteria(criteria);
            let tblTarget = this.getTable(tblName);
            let result = _.find(tblTarget, search);


            return (result) ? [result] : null;
        };


        /**
         * Returns all rows that match the criteria object
         * @function flatly#findAll
         * @param {Object} criteria An options object with the search details
         * @param {String} criteria.from The name of the table to search
         * @param {Object} criteria.where An object containing the column and value criterion
         * @params {String} criteria.where.column The name of the column to search
         * @params {number|String} criteria.where.equals The value to search the column for
         * @returns {*}
         */
        this.findAll = (criteria) => {
            if (!_.has(criteria, 'from') || !_.has(criteria, 'where') || !_.has(criteria, 'where.column') || !_.has(criteria, 'where.equals')
            ) {
                throw new Error('You must include both "where" and "from" criteria to use findAll()');
            }

            let search = {};
            search[criteria.where.column] = criteria.where.equals;

            let result = _.filter(this.getTable(criteria.from), search);


            return (result) ? [result] : null;
        };

        /**
         * Loads a database from the specified filepath
         *
         * @function flatly#use
         * @param options {Object}
         * @param options.name {String} Specify a name for the database
         * @param options.src {String} A path to the required data
         * @returns {flatly}
         */
        this.use = function (options) {
            this.name = options.name.toLowerCase();
            _baseDir = options.src;
            _files = io.getAll({src: options.src});

            /* Add table and row metadata */
            _tables = _.forIn(io.parse(options.name, _files), (tbl, tblName) => {
                _.forIn(tbl, (row) => {
                    row['$$flatly'] = {
                        table: tblName
                    }
                });

                tbl["$$flatly"] = {
                    table: tblName
                };

            });


            return this;
        };


        /**
         * Save table data to disk
         *
         * @func flatly#save
         * @param options {Object}
         * @param options.table {string} The table to save
         * @param [options.overwrite=false] Overwrite the existing table?
         * @param [options.async=false] {boolean} Sync/Async Execution. Defaults to Sync
         * @param [callback] {function} The callback to execute if we're working asynchronously
         * @returns {flatly}
         */
        this.save = function (options, callback) {
            if (!_.has(options, 'table')) {
                throw new Error('You must pass a "table" parameter to use save()');
            }

            let target = _removeMeta(this.getTable(options.table));
            let filename = options.table;
            let tblFile = path.normalize(path.format({
                dir: _baseDir,
                base: filename + ".json",
                ext: ".json",
                name: options.table
            }));

            if (_.has(options, 'async') && options.async) {
                    if (!_.isSet(callback)) {
                        throw "save() is set to async and no callback was supplied.";
                    } else {
                        io.putSync(target, tblFile, callback);
                        return this;
                    }
            } else {
                io.putSync(target, tblFile);
                return this;
            }

        };


        this.update = (rowData, matchBy, tblName) => {
            if (_.has(rowData, '$$flatly')) {
                tblName = rowData.$$flatly.table;
            } else {
                if (!_.isSet(tblName)) {
                    throw new Error("You must pass a flatly object or the name of the table to insert the data into");
                }
            }

            if(!_.has(rowData, matchBy)) {
                throw new Error("The key: " + matchBy + " does not exist.");
            }

            var where = {
                column: matchBy,
                equals: rowData[matchBy]
            };



            var old = this.findOne({from: tblName, where: where})[0];

            if(old) {

                let index = _.findIndex(_tables[tblName], old);

                if(index !== -1) {

                    _tables[tblName].splice(index, 1, rowData);


                } else {
                    console.warn("No row found");

                }

            } else {
                console.warn("No object found", matchBy);
            }
            return this;


        };

        let _getMeta = (obj) => {
            if (!_.has(obj, '$$flatly')) {
                return false;
            } else {
                return obj['$$flatly'];
            }
        };

    }//end flatly()


    module.exports = flatly;

})();