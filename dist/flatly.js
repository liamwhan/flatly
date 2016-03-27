'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Flatly = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _io = require('./io');

var _io2 = _interopRequireDefault(_io);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @fileOverview
 * @author Liam Whan
 * @module
 *
 */

/**
 * Flatly class contains the entire flatly api
 * @classdesc flatly is a simple flat file JSON db system.
 *
 * IMPORTANT: flatly is under active development and is not considered production ready
 * @class Flatly
 * @returns {Flatly}
 */

var Flatly = exports.Flatly = function () {

    /**
     * Instantiate a new Flatly DB
     * @constructor
     */


    /**
     * @member {string} _baseDir
     * @private
     */


    /**
     * @member _tables Tables collection
     * @type {Array}
     * @private
     */

    function Flatly(useOpts) {
        _classCallCheck(this, Flatly);

        if (new.target === undefined) {
            throw "You must instantiate flatly. e.g. const Flatly = require('flatly');\r\nvar flatly = new Flatly();";
        }

        this._tables = [];
        this._files = [];
        this._baseDir = "";
        this.name = "";

        if (!_lodash2.default.isUndefined(useOpts)) {
            this.use(useOpts);
        }
    }

    /**
     * Get the flatly metadata from an object
     * @func flatly~getMeta
     * @param obj {Array|Object} The object to check
     * @returns {Object|boolean} Returns metadata object if found, otherwise false
     * @private
     */


    /**
     * The name of the database currently in use
     * @member {string}
     */


    /**
     * @member _files Array of table file names
     * @type {Array}
     * @private
     */


    _createClass(Flatly, [{
        key: '_addTable',


        /**
         * Adds a table to the db collection
         * @param table {Array} The table to add to the DB
         * @param tableName {string} The name of the table to add
         * @returns {Flatly}
         * @private
         */
        value: function _addTable(table, tableName) {

            this._tables[tableName] = Flatly._addTableMeta(table, tableName);

            return this;
        }

        // region Public

        //region Static
        /**
         * @function flatly~_parseCriteria
         * @desc Helper method to parse the search criteria object
         * @private
         * @param criteria {object} The criteria object to parse
         * @param criteria.from {string} Table name
         * @param criteria.where {object} An object defining the search criteria
         * @param criteria.where.column {string} the Column name to search
         * @param criteria.where.equals {string} the search term.
         * @returns {object} The search result object is of form {"columnName": searchTerm} which is used by the find methods
         */

    }, {
        key: 'dbInfo',


        //endregion

        /**
         * Returns currently selected database name and table names
         *
         * @function Flatly#dbInfo
         * @returns {{name: String, tables: Array, count: number}} An object with the database name, table names and table count
         */
        value: function dbInfo() {
            return {
                name: this.name,
                tables: this.tableNames,
                count: this.tableNames.length
            };
        }
    }, {
        key: 'getTable',


        /**
         * Returns an object representing the table requested. Use {@link Flatly#findOne} or {@link Flatly#findAll} for querying table contents
         *
         * @function Flatly#getTable
         * @param tableName {string} The name of the table to be returned
         * @returns {object} An deep clone of the table
         */
        value: function getTable(tableName) {
            tableName = tableName.toLowerCase();
            return _lodash2.default.cloneDeep(this._tables[tableName]);
        }
    }, {
        key: 'findOne',


        /**
         * Returns a row from the specified table
         *
         * @function Flatly#findOne
         * @param from {string} The name of the table to search
         * @param predicate {Object | Function} A key/value pair where key = column name and value = value to match or a predicate function that to match against
         * @example flatlyDb.findOne("table1", {id: 1});
         * // -> {id: 1, name: 'Flatly is great!'}
         * @returns {?Object} A row object
         */
        value: function findOne(from, predicate) {

            /**
             * Handle legacy opts
             */
            var search = Flatly._parseCriteria(predicate);

            var tblTarget = this.getTable(from.toLowerCase());

            return _lodash2.default.find(tblTarget, search) || null;
        }
    }, {
        key: 'findAll',


        /**
         * Returns all rows that match the criteria object
         * @function Flatly#findAll
         * @param from {string} The name of the table to search
         * @param predicate {Object | function} A key/value pair where key = column name and value = value to match or a predicate function that to match against
         * @returns {Array} An array of rows that match the predicate
         */
        value: function findAll(from, predicate) {

            predicate = _lodash2.default.isObject(from) ? Flatly._parseCriteria(predicate) : predicate;

            var result = _lodash2.default.filter(this.getTable(from), predicate);

            return result ? [result] : null;
        }
    }, {
        key: 'use',


        /**
         * Database initialisation method. Given an options object with {options.name} and {options.src} string params
         * it will recursively load all the JSON from the filepath specified by {options.src}
         *
         * @function Flatly#use
         * @param options {object}
         * @param options.name {string} Specify a name for the database
         * @param options.src {string} A path to the required data
         * @returns {Flatly}
         */
        value: function use(options) {
            var _this = this;

            this.name = options.name.toLowerCase();

            this._baseDir = _path2.default.resolve(global.parent, options.src);

            this._files = _io2.default.getAll({ src: this._baseDir });

            var _tables = _io2.default.parse(options.name, this._files);

            _lodash2.default.forIn(_tables, function (value, key) {
                _this._addTable(value, key);
            });

            return this;
        }
    }, {
        key: 'refreshTable',


        /**
         * Refresh table from disk
         * @func Flatly#refreshTable
         * @param tableName {string} Table name to refresh
         * @returns {object} Table
         */
        value: function refreshTable(tableName) {

            var filename = tableName.toLowerCase() + ".json";
            var filePath = _path2.default.join(this._baseDir, filename);

            this._tables[tableName] = _io2.default.getOne(filePath);

            return this.getTable(tableName);
        }
    }, {
        key: 'save',


        /**
         * Save table data to disk. Remove flatly metadata before saving.
         *
         * @func Flatly#save
         * @param tableName {string} The table to save
         * @param [overwrite=false] {boolean} Overwrite the existing table?
         * @param [callback] {function} The callback to execute if we're working asynchronously
         * @returns {Flatly}
         */
        value: function save(tableName, overwrite, callback) {

            var options = {
                table: tableName,
                overwrite: overwrite,
                async: _lodash2.default.isFunction(callback),
                callback: callback
            };

            _lodash2.default.defaults(options, { overwrite: false }, { async: false });

            var target = Flatly._removeMeta(this.getTable(options.table));
            var filename = options.table;

            var tblFile = _path2.default.normalize(_path2.default.format({
                dir: this._baseDir,
                base: filename + ".json",
                ext: ".json",
                name: options.table
            }));

            if (options.async) {

                if (_lodash2.default.isUndefined(callback)) {

                    throw Error("save() is set to async and no callback was supplied.");
                } else {

                    _io2.default.put(target, tblFile, callback, options.overwrite);
                    return this;
                }
            } else {

                _io2.default.put(target, tblFile, options.overwrite);
                this.refreshTable(options.table);
                return this;
            }
        }
    }, {
        key: 'checkExists',


        /**
         * Check if a record (row) exists within a given table
         * @param {string} tableName The name of the table to check
         * @param {object} predicate The value to search for
         * @func Flatly#checkExists
         * @example if(flatly.checkExists('table1', 'id', 1)) { //do something }
         * @return {boolean} Returns {true} if the value is found {false} otherwise
         */
        value: function checkExists(tableName, predicate) {

            var bool = this.findOne(tableName, predicate);
            return !_lodash2.default.isNull(bool);
        }
    }, {
        key: 'insert',


        /**
         * Insert a row into a table
         * @func Flatly#insert
         * @param row {object} Row object to insert
         * @param tableName {string} Name of the table to insert into
         * @returns {Flatly}
         */
        value: function insert(row, tableName) {

            var table = this.getTable(tableName);

            if (_lodash2.default.isNull(table)) {

                throw Error('Table not found: ', tableName);
            }

            //We Automatically add an id to each row.
            if (_lodash2.default.isUndefined(row.id)) {
                row.id = table.length === 0 ? 1 : Flatly._nextId(table);
            }

            row = Flatly._addRowMeta(row, tableName);

            this._tables[tableName].push(row);

            return this;
        }
    }, {
        key: 'update',


        /**
         * Update an existing table row
         * @func Flatly#update
         * @param rowData {object} An object representing a row of the target table
         * @param tableName {string} The target table name
         * @param matchBy {string} The key to use to match rowData to an existing row in the table
         * @example flatly.update({
             *      id: 6,
             *      name: Michael Flatly
             *  }, 'id', 'customers');
         * @returns {Flatly}
         */
        value: function update(rowData, tableName, matchBy) {
            if (_lodash2.default.has(rowData, '__flatly')) {
                tableName = rowData.__flatly.table;
            } else if (_lodash2.default.isUndefined(tableName)) {
                throw new Error("You must pass a flatly object or the name of the table to insert the data into");
            }

            if (!_lodash2.default.has(rowData, matchBy)) {
                throw new Error("The key: " + matchBy + " does not exist.");
            }

            var predicate = {};

            predicate[matchBy] = rowData[matchBy];

            var old = this.findOne(tableName, predicate);

            if (old) {

                var index = _lodash2.default.findIndex(this._tables[tableName], old);

                if (index !== -1) {

                    this._tables[tableName].splice(index, 1, rowData);
                } else {

                    console.warn("Could not find the specified Row in table " + tableName);
                }
            } else {
                console.warn("No object found", matchBy);
            }
            return this;
        }
    }, {
        key: 'tableNames',


        /**
         * Returns the indicators of the currently selected DB
         *
         * @function Flatly#getTableNames
         * @example console.log(flatly.getTableNames());
         *  // -> ['table1', 'table2', 'table3']
         * @returns {string[]}
         */
        get: function get() {
            return _lodash2.default.keys(this.tables);
        }

        /**
         * Returns a deep clone of the tables array
         *
         * @memberOf Flatly
         * @function Flatly#tables
         * @returns {Array}
         */

    }, {
        key: 'tables',
        get: function get() {
            return _lodash2.default.cloneDeep(this._tables);
        }
    }], [{
        key: '_getMeta',
        value: function _getMeta(obj) {
            if (!_lodash2.default.has(obj, '__flatly')) {
                return false;
            } else {
                return obj['__flatly'];
            }
        }
    }, {
        key: '_nextId',


        /**
         * Returns the a new Id for a table
         * @func flatly~nextId
         * @param table {object} The table to query
         * @private
         * @returns {number}
         */
        value: function _nextId(table) {

            var maxId = _lodash2.default.max(_lodash2.default.map(table, 'id'));

            return maxId + 1;
        }
    }, {
        key: '_removeMeta',


        /**
         * Removes flatly metadata before saving to disk
         * @function flatly~_removeMeta
         * @param data
         * @returns {*}
         * @private
         */
        value: function _removeMeta(data) {
            var clone = _lodash2.default.cloneDeep(data);
            if (_lodash2.default.has(clone, '__flatly')) {
                delete clone['__flatly'];
            }

            _lodash2.default.each(clone, function (row) {
                if (_lodash2.default.has(row, '__flatly')) {
                    delete row['__flatly'];
                }
            });

            return clone;
        }
    }, {
        key: '_addTableMeta',


        /**
         * Adds flatly metadata to table object
         * @func Flatly#_addTableMeta()
         * @param table {Array} The table array to tag
         * @param tableName {string} The name of the table
         * @returns {Array|object} The tagged table
         * @private
         */
        value: function _addTableMeta(table, tableName) {

            if (_lodash2.default.isPlainObject(table)) {

                //Assume it is a row and return a tagged row.
                return Flatly._addRowMeta(table, tableName);
            }

            //Iterate throw rows and tag them
            _lodash2.default.each(table, function (row) {
                row = Flatly._addRowMeta(row, tableName);
            });

            return table;
        }
    }, {
        key: '_addRowMeta',


        /**
         * Adds flatly metadata to a row object
         * @func Flatly#_addRowMeta()
         * @param row {object} The table array to tag
         * @param tableName {string} The name of the table
         * @returns {object} The tagged row
         * @private
         */
        value: function _addRowMeta(row, tableName) {

            var meta = {
                table: tableName
            };

            if (_lodash2.default.isUndefined(row.flatly__)) {
                row.flatly__ = meta;
            }

            return row;
        }
    }, {
        key: '_parseCriteria',
        value: function _parseCriteria(criteria) {

            var search = {};

            if (_lodash2.default.has(criteria, 'from') && _lodash2.default.has(criteria, 'where') && _lodash2.default.has(criteria, 'where.column') && _lodash2.default.has(criteria, 'where.equals')) {
                search[criteria.where.column] = criteria.where.equals;
            } else {
                search = criteria;
            }

            return search;
        }
    }]);

    return Flatly;
}();