var chai = require('chai');
var chaiParam = require('chai-param');
var expect = chai.expect;
var param = chaiParam.param;


chaiParam.config.improveMessages = true;

chai.use(chaiParam);

var Flatly = require('../index');
var path = require('path');


describe('Flatly', function () {
    var flatly = new Flatly();

    beforeEach(function () {
        flatly = new Flatly();
        flatly.use({name: 'data', src: '../../schema/'});

    });

    it('should be a flatly object', function () {
        expect(flatly).to.be.an.instanceof(Flatly);
    });


    it('should have properties: use, tables, db', function () {

        expect(flatly).to.have.property('use');
        expect(flatly).to.have.property('tables');
        expect(flatly).to.have.property('dbInfo');

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
        it('should return an object with $$flatly metadata if item exists', function () {
            var findResult = flatly.findOne({
                from: 'Indicators',
                where: {
                    column: 'Id',
                    equals: 1
                }
            });

            expect(findResult).to.be.an.object;
            expect(findResult).have.property('$$flatly');

        });

        it('should return null if that table does not exist', function () {

            var findResult = flatly.findOne({
                from: 'ndicators',
                where: {
                    column: 'Id',
                    equals: 1
                }
            });

            expect(findResult).to.be.null;
        });
    });

    describe('#findAll()', function () {

        it('should return an array if search is successful', function () {
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


    //describe('~next()', function() {
    //
    //    it('should return an integer', function () {
    //       expect(flatly.nextId('indicators')).to.be.a.number;
    //       expect(flatly.nextId('indicators')).to.be.above(114);
    //
    //    });
    //
    //});


});

describe('Flatly - Users', function () {
    "use strict";

    let flatly = {};
    beforeEach(function () {
        flatly = new Flatly();
        flatly.use({name: 'data', src: '../../users/'});

    });


    it('fixture: should load the user-manifest', function () {
        expect(flatly.tables()).to.have.property('manifest');

    });

    describe('#insert()', function () {
        let user = {
            firstName: 'Liam',
            lastName: 'Whan',
            username: 'WHANL2',
            access: 'admin'

        };
        it('should not throw an error if the table exists', function () {
            expect(flatly.insert(user, 'manifest')).not.to.throwError;

        });

        it('should throw an error if the table does not exist', function () {
            expect(flatly.insert(user, 'manifest')).to.throwError;
        });

        it('should return the object we just added ', function () {
            expect(flatly.insert(user, 'manifest')).not.to.throwError;
            expect(flatly.findOne({
                from: 'manifest',
                where: {
                    column: 'id',
                    equals: 1
                }
            })).to.not.be.null;

            flatly.save({table: 'manifest', overwrite: true});



        });

    })

});
