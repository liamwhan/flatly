var chai = require('chai');
var chaiParam = require('chai-param');
var expect = chai.expect;
var param = chaiParam.param;

//Path resolution helpers for Tests
global.root = require('path').resolve(__dirname);
global.parent = require('path').dirname(__filename);


chaiParam.config.improveMessages = true;

chai.use(chaiParam);

var Flatly = require('../dist/flatly').Flatly;
var path = require('path');


describe('Flatly', function () {
    var flatly = new Flatly();

    beforeEach(function () {
        flatly = new Flatly();
    });

    describe("#use({src: string, name: string})", function() {

        beforeEach(function() {
            flatly.use({src: "./fixtures/", name: 'fixtures'});
        });

        it("should load the files names.json and subset.json from the fixtures directory", function () {
            
            var rgx = /(names|subset)\.json/;
            var invRgx = /(test)\.json/;

            //Check file names
            expect(flatly._files[0]).to.match(rgx);
            expect(flatly._files[1]).to.match(rgx);

            //Inverse file name assertions
            expect(flatly._files[0]).not.to.match(invRgx);
            expect(flatly._files[1]).not.to.match(invRgx);
            
        });

        it('should have tables that match the fixtures', function () {

            expect(flatly.getTable('names').length).to.equal(1000);
            expect(flatly.getTable('subset').length).to.equal(9);

            //Inverse assertions
            expect(flatly.getTable('names').length).not.to.equal(9);
            expect(flatly.getTable('subset').length).not.to.equal(1000);

        });
        
        
        
    });



});

