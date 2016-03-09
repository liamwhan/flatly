/**
 * @fileOverview
 * @author Liam Whan
 * @memberOf core
 *
 */
;
(function () {
    "use strict";

    const io = require('./io');
    const path = require('path');
    const _ = require('lodash');


    /**
     * flatly class contains the entire flatly api
     * @func flatly
     * @classdesc flatly is a simple flat file JSON db system.
     * IMPORTANT: flatly is under active development and is not considered production ready
     * @class
     * @constructor
     * @returns {flatly}
     */
    function flatly() {
        if (new.target === undefined) {
            throw "You must instantiate flatly. e.g. const Flatly = require('flatly');\r\nvar flatly = new Flatly();"
        }

        //region Private members
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
         * Get the flatly metadata from an object
         * @func flatly~getMeta
         * @param obj The object to check
         * @returns {Object|boolean}
         * @private
         */
        let _getMeta = (obj) => {
            if (!_.has(obj, '$$flatly')) {
                return false;
            } else {
                return obj['$$flatly'];
            }
        };

        /**
         * Returns the a new Id for a table
         * @func flatly~nextId
         * @param tblName {Object} The table to query
         * @private
         * @returns {number}
         */
        let _nextId = (table) => {

            let maxId = _.max(_.map(table, 'id'));


            return maxId + 1;

        };

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



        /**
         * Adds flatly metadata to db object
         * @param data {Object|Array} the data to tag
         * @param [tblName] {String} a string identifier for what
         * @returns {*}
         * @private
         */
        let _addMeta = () => {
            let clone = _.cloneDeep(_tables);


            if (!_.has(clone, '$$flatly')) {
                _.forIn(clone, (tbl, tblName) => {
                    let meta = {
                        $$flatly: {
                            table: tblName
                        }
                    };

                    _.forIn(tbl, (row) => {

                        _.assign(row, meta);

                    });
                });
            }


            return clone;
        };


        /**
         * @function flatly~_parseCriteria
         * @desc Helper method to parse the search criteria object
         * @private
         * @param criteria {Object} The criteria object to parse
         * @param criteria.from {String} Table name
         * @param criteria.where {Object} An object defining the search criteria
         * @param criteria.where.column {String} the Column name to search
         * @param criteria.where.equals {String} the search term.
         * @returns {Object} The search result object is of form {"columnName": searchTerm} which is used by the find methods
         */
        function _parseCriteria(criteria) {

            if (!_.has(criteria, 'from') || !_.has(criteria, 'where') || !_.has(criteria, 'where.column') || !_.has(criteria, 'where.equals')
            ) {
                throw new Error('You must include both "where" and "from" criteria to use findOne()');
            }
            let search = {};
            search[criteria.where.column.toLowerCase()] = criteria.where.equals;

            return search;
        }

        //endregion

        // region Public
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
         * Returns the schema of the currently selected DB
         *
         * @function flatly#getSchema
         * @example console.log(flatly.getSchema());
         *  // -> ['table1', 'table2', 'table3']
         * @returns {string[]}
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
         * @returns {?Object} A row object
         */
        this.findOne = (criteria) => {
            let tblName = criteria.from;
            let search = _parseCriteria(criteria);
            let tblTarget = this.getTable(tblName.toLowerCase());
            let result = _.find(tblTarget, search);


            return result || null;
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
            _baseDir = path.resolve(global.parent, options.src);
            _files = io.getAll({src: _baseDir});


            let tablesClean = io.parse(options.name, _files);

            _tables = tablesClean;
            /* Add table and row metadata */
            _addMeta();


            return this;
        };

        /**
         * Refresh table from disk
         * @func flatly#refreshTable
         * @param tblName {string} Table name to refresh
         * @returns {object} Table
         */
        this.refreshTable = function (tblName) {
            var filename = tblName.toLowerCase() + ".json";
            var filePath = path.join(_baseDir, filename);

            var tbl = io.getOne(filePath);


            _tables[tblName] = tbl;
            _addMeta();
            return _tables[tblName];

        };
        

        /**
         * Save table data to disk. Remove flatly metadata before saving.
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

            _.defaults(options, {overwrite: false}, {async: false});

            let target = _removeMeta(this.getTable(options.table));
            let filename = options.table;
            let tblFile = path.normalize(path.format({
                dir: _baseDir,
                base: filename + ".json",
                ext: ".json",
                name: options.table
            }));

            if (_.has(options, 'async') && options.async) {
                if (_.isUndefined(callback)) {
                    throw Error("save() is set to async and no callback was supplied.");
                } else {
                    io.put(target, tblFile, callback, options.overwrite);
                    return this;
                }
            } else {
                io.put(target, tblFile, options.overwrite);
                this.refreshTable(options.table);
                return this;
            }

        };


        /**
         * Check if a record (row) exists within a given table
         * @param {string} tblName The name of the table to check
         * @param {string} column The column to search
         * @param {*} value The value to search for
         * @func flatly#checkExists
         * @example if(flatly.checkExists('table1', 'id', 1)) { //do something }
         * @return {boolean} Returns {true} if the value is found {false} otherwise
         */
        this.checkExists = (tblName, column, value) => {

            var bool = this.findOne({from: tblName, where: {column: column, equals: value}});
            if (_.isNull(bool)) {
                return false;
            } else {
                return true;
            }
        };

        /**
         * Insert a row into a table
         * @func flatly#insert
         * @param row {object} Row object to insert
         * @param tblName {string} Name of the table to insert into
         * @returns {flatly}
         */
        this.insert = (row, tblName) => {
            let table = this.getTable(tblName);


            if (!_.isNull(table)) {
                let newId = table.length === 0 ? 1 : _nextId(table);

                row.id = newId;


                _tables[tblName].push(row);
                addMeta();

                return row;
            } else {
                throw Error('Table not found: ', tblName);
            }


        };

        /**
         * Update an existing table row
         * @func flatly#update
         * @param rowData {Object} An object representing a row of the target table
         * @param matchBy {String} The key to use to match rowData to an existing row in the table
         * @param tblName {String} The target table name
         * @example flatly.update({
         *      id: 6,
         *      name: Michael Flatly
         *  }, 'id', 'customers');
         * @returns {flatly}
         */
        this.update = (rowData, matchBy, tblName) => {
            if (_.has(rowData, '$$flatly')) {
                tblName = rowData.$$flatly.table;
            } else {
                if (_.isUndefined(tblName)) {
                    throw new Error("You must pass a flatly object or the name of the table to insert the data into");
                }
            }

            if (!_.has(rowData, matchBy)) {
                throw new Error("The key: " + matchBy + " does not exist.");
            }

            var where = {
                column: matchBy,
                equals: rowData[matchBy]
            };


            var old = this.findOne({from: tblName, where: where});

            if (old) {

                let index = _.findIndex(_tables[tblName], old);

                if (index !== -1) {

                    _tables[tblName].splice(index, 1, rowData);


                } else {
                    console.warn("Could not find the specified Row in table " + tblName);

                }

            } else {
                console.warn("No object found", matchBy);
            }
            return this;


        };

        //endregion


    }//end flatly()


    module.exports = flatly;

})();