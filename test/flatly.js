var chai = require('chai');
var chaiParam = require('chai-param');
var expect = chai.expect;
var param = chaiParam.param;

chaiParam.config.improveMessages = true;

chai.use(chaiParam);

var Flatly = require('../core/flatly');
var path = require('path');


describe('Flatly', function () {
    var flatly = new Flatly();

    beforeEach(function () {
        flatly = new Flatly();
        flatly.use({name: 'data', src: '../schema/'});

    });

    it('should have properties: use, tables, db', function () {
        expect(flatly).to.be.an.instanceof(Flatly);
        expect(flatly).to.have.property('use');
        expect(flatly).to.have.property('tables');
        expect(flatly).to.have.property('db');

    });

    describe('#getTable()', function () {
        it('should have method getTable()', function () {
            expect(flatly).to.have.property('getTable');

        });

        it('should return an array with length greater than 0', function () {
            expect(flatly.getTable('Indicators')).to.be.an.array;
            expect(flatly.getTable('Indicators').length).to.be.above(0);


        });

    });


    describe('#use()', function () {
        it('should return itself for method chaining', function () {
            expect(flatly).to.be.an.instanceof(Flatly);

        });

        it('fixture: should have props: Indicators, Sections_GH_Home', function () {
            expect(flatly.tables()).to.have.property('Indicators'.toLowerCase());
            expect(flatly.tables()).to.have.property('Sections_GH_Home'.toLowerCase());

        });
    });

    describe('#getSchema()', function () {
        it('should return an array of strings', function () {
            expect(flatly.getSchema()).to.be.an.array;
            expect(flatly.getSchema().length).to.be.above(0);


        });

        it('fixture: should have members "indicators" and "sections_gh_home"', function () {
            expect(flatly.getSchema()).to.include.members(['indicators', 'sections_gh_home']);

        });

    });

    describe('#findOne()', function () {
        it('should return an array of exactly 1 item if the table exists', function () {
            var findResult = flatly.findOne({
                from: 'Indicators',
                where: {
                    column: 'Id',
                    equals: 1
                }
            });

            expect(findResult).to.be.an.array;
            expect(findResult).have.length(1)

        });

        it('should return undefined if that table does not exist', function () {

            var findResult = flatly.findOne({
                from: 'ndicators',
                where: {
                    column: 'Id',
                    equals: 1
                }
            });

            expect(findResult).to.be.undefined;
        });
    });

    describe('#findAll()', function() {

        it('should return an array if search is successful', function() {
            var findResults = flatly.findAll({
                from: 'Indicators',
                where: {
                    column: 'Section',
                    equals: 1
                }
            });

            expect(findResults).to.be.an.array;
            expect(findResults.length).to.be.above(0);
        })

    });


});
