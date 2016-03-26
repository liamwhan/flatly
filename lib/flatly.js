import io from './io'
import path from 'path';
import _ from 'lodash';


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
export class Flatly {
    
    /**
     * @member _tables Tables collection
     * @type {Array}
     * @private
     */
    _tables;
    
    /**
     * @member _files Array of table file names
     * @type {Array}
     * @private
     */
    _files;
    
    /**
     * @member _baseDir The base directory where the table files are located.
     * @type {string}
     * @private
     */
    _baseDir;

    /**
     * The name of the database currently in use
     * @member {string}
     */
    name;
    
    /**
     * Instantiate a new Flatly DB
     * @constructor
     */
    constructor(useOpts) {

        if (new.target === undefined) {
            throw "You must instantiate flatly. e.g. const Flatly = require('flatly');\r\nvar flatly = new Flatly();"
        }

        this._tables = [];
        this._files = [];
        this._baseDir = "";
        this.name = "";

        if (!_.isUndefined(useOpts)) {
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
    static _getMeta(obj) {
        if (!_.has(obj, '__flatly')) {
            return false;
        } else {
            return obj['__flatly'];
        }
    };

    /**
     * Returns the a new Id for a table
     * @func flatly~nextId
     * @param table {object} The table to query
     * @private
     * @returns {number}
     */
    static _nextId(table) {

        var maxId = _.max(_.map(table, 'id'));

        return maxId + 1;

    };

    /**
     * Removes flatly metadata before saving to disk
     * @function flatly~_removeMeta
     * @param data
     * @returns {*}
     * @private
     */
    static _removeMeta(data) {
        var clone = _.cloneDeep(data);
        if (_.has(clone, '__flatly')) {
            delete clone['__flatly'];
        }

        _.each(clone, (row) => {
            if (_.has(row, '__flatly')) {
                delete row['__flatly'];
            }
        });

        return clone;
    };

    /**
     * Adds flatly metadata to db object
     * @func Flatly#_addMeta()
     * @param table {Array} The table array to tag
     * @param tableName {string} The name of the table
     * @returns {Array} The tagged table
     * @private
     */
    static _addMeta(table, tableName) {

        let meta = {
            table: tableName
        };

        _.each(table, (row) => {
            row.flatly__ = meta
        });

        return table;
    };

    /**
     * Adds a table to the db collection
     * @param table {Array} The table to add to the DB
     * @param tableName {string} The name of the table to add
     * @returns {Flatly}
     * @private
     */
    _addTable(table, tableName) {

        this._tables[tableName] = Flatly._addMeta(table, tableName);

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
    static _parseCriteria(criteria) {

        var search = {};

        if (_.has(criteria, 'from')
            && _.has(criteria, 'where')
            && _.has(criteria, 'where.column')
            && _.has(criteria, 'where.equals')) {
            search[criteria.where.column] = criteria.where.equals;
        } else {
            search = criteria;
        }

        return search;
    }

    //endregion

    /**
     * Returns currently selected database name and table names
     *
     * @function Flatly#dbInfo
     * @returns {{name: String, tables: Array, count: number}} An object with the database name, table names and table count
     */
    dbInfo() {
        return {
            name: this.name,
            tables: this.tableNames,
            count: this.tableNames.length
        }
    };


    /**
     * Returns the indicators of the currently selected DB
     *
     * @function Flatly#getTableNames
     * @example console.log(flatly.getTableNames());
     *  // -> ['table1', 'table2', 'table3']
     * @returns {string[]}
     */
    get tableNames() {
       return  _.keys(this.tables);
    }


    /**
     * Returns a deep clone of the tables array
     *
     * @memberOf Flatly
     * @function Flatly#tables
     * @returns {Array}
     */
    get tables() {
        return _.cloneDeep(this._tables);
    }

    /**
     * Returns an object representing the table requested. Use {@link Flatly#findOne} or {@link Flatly#findAll} for querying table contents
     *
     * @function Flatly#getTable
     * @param tableName {string} The name of the table to be returned
     * @returns {object} An deep clone of the table
     */
    getTable(tableName) {
        tableName = tableName.toLowerCase();
        return _.cloneDeep(this._tables[tableName]);
    };

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
    findOne(from, predicate) {

        /**
         * Handle legacy opts
         */
        let search = Flatly._parseCriteria(predicate);

        let tblTarget = this.getTable(from.toLowerCase());

        return _.find(tblTarget, search) || null;
    };


    /**
     * Returns all rows that match the criteria object
     * @function Flatly#findAll
     * @param from {string} The name of the table to search
     * @param predicate {Object | function} A key/value pair where key = column name and value = value to match or a predicate function that to match against
     * @returns {Array} An array of rows that match the predicate
     */
    findAll(from, predicate) {

        predicate = _.isObject(from) ? Flatly._parseCriteria(predicate) : predicate;

        let result = _.filter(this.getTable(from), predicate);

        return (result) ? [result] : null;
    };

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
    use(options) {

        this.name = options.name.toLowerCase();

        this._baseDir = path.resolve(global.parent, options.src);

        this._files = io.getAll({src: this._baseDir});

        let _tables = io.parse(options.name, this._files);

        _.forIn(_tables, (value, key) => {
            this._addTable(value, key);
        });

        return this;
    };

    /**
     * Refresh table from disk
     * @func Flatly#refreshTable
     * @param tableName {string} Table name to refresh
     * @returns {object} Table
     */
    refreshTable(tableName) {
        let filename = tableName.toLowerCase() + ".json";
        let filePath = path.join(this._baseDir, filename);

        this._tables[tableName] = io.getOne(filePath);
        return this.getTable(tableName);

    };


    /**
     * Save table data to disk. Remove flatly metadata before saving.
     *
     * @func Flatly#save
     * @param tableName {string} The table to save
     * @param [overwrite=false] {boolean} Overwrite the existing table?
     * @param [callback] {function} The callback to execute if we're working asynchronously
     * @returns {Flatly}
     */
    save(tableName, overwrite, callback) {

        let options = {
            table: tableName,
            overwrite: overwrite,
            async: _.isFunction(callback),
            callback: callback
        };

        _.defaults(options, {overwrite: false}, {async: false});

        let target = Flatly._removeMeta(this.getTable(options.table));
        let filename = options.table;

        let tblFile = path.normalize(path.format({
            dir: this._baseDir,
            base: filename + ".json",
            ext: ".json",
            name: options.table
        }));

        if (options.async) {
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
     * @param {string} tableName The name of the table to check
     * @param {object} predicate The value to search for
     * @func Flatly#checkExists
     * @example if(flatly.checkExists('table1', 'id', 1)) { //do something }
     * @return {boolean} Returns {true} if the value is found {false} otherwise
     */
    checkExists(tableName, predicate) {

        let bool = this.findOne(tableName, predicate);
        return !_.isNull(bool);

    };

    /**
     * Insert a row into a table
     * @func Flatly#insert
     * @param row {object} Row object to insert
     * @param tableName {string} Name of the table to insert into
     * @returns {Flatly}
     */
    insert(row, tableName) {

        let table = this.getTable(tableName);


        if (!_.isNull(table)) {

            row.id = table.length === 0 ? 1 : Flatly._nextId(table);

            this._tables[tableName].push(row);

            return this;

        } else {

            throw Error('Table not found: ', tableName);

        }


    };

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
    update(rowData, tableName, matchBy) {
        if (_.has(rowData, '__flatly')) {
            tableName = rowData.__flatly.table;
        } else if (_.isUndefined(tableName)) {
            throw new Error("You must pass a flatly object or the name of the table to insert the data into");
        }

        if (!_.has(rowData, matchBy)) {
            throw new Error("The key: " + matchBy + " does not exist.");
        }

        var predicate = {};

        predicate[matchBy] = rowData[matchBy];


        var old = this.findOne(tableName, predicate);

        if (old) {

            let index = _.findIndex(this._tables[tableName], old);

            if (index !== -1) {

                this._tables[tableName].splice(index, 1, rowData);

            } else {

                console.warn("Could not find the specified Row in table " + tableName);

            }

        } else {
            console.warn("No object found", matchBy);
        }
        return this;


    };

    //endregion


}//end flatly()
