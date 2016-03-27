var chai = require('chai');
var chaiParam = require('chai-param');
var expect = chai.expect;
var param = chaiParam.param;

//Path resolution helpers for Tests
global.root = require('path').resolve(__dirname);
global.parent = require('path').dirname(__filename);


chaiParam.config.improveMessages = true;

chai.use(chaiParam);

var Flatly = require('../lib/flatly').Flatly;
var path = require('path');


describe('Flatly', function () {
    var flatly = new Flatly();

    beforeEach(function () {
        flatly = new Flatly();
    });

    describe("#use({src: string, name: string}) && #getTable(tblName)", function () {

        beforeEach(function () {
            flatly.use({src: "./fixtures/", name: 'fixtures'});
        });

        it("should load the files names.json and subset.json from the fixtures directory", function () {
            
            var rgx = /(names|subset)\.json/;
            var invRgx = /(invalid)\.json/;

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

        it('should have added metadata to each row', function () {

            //Pick a random item between 0 and rows.length and test
            var i1 = parseInt(Math.random() * (flatly.getTable('names').length));
            var i2 = parseInt(Math.random() * (flatly.getTable('subset').length));

            expect(flatly.getTable('names')[i1]).to.have.any.keys(['flatly__', 'name']);
            expect(flatly.getTable('subset')[i2]).to.have.any.keys(['flatly__', 'name']);


        });
        
        
    });

    describe('#insert()', function () {

        beforeEach(function () {
            flatly.use({src: "./fixtures/", name: 'fixtures'});
        });
        
        it('should add a row to the table specified', function () {

            expect(flatly.getTable('subset').length).to.equal(9);
            expect(flatly.insert({name: "Liam Whan"}, "subset"));
            expect(flatly.getTable('subset').length).to.equal(10);
            expect(flatly.getTable('subset').length).not.to.equal(9);

        });

        it('should return an instance of itself for chaining', function () {
            expect(flatly.insert({name: "Liam Whan"}, "subset")).to.be.instanceOf(Flatly);
            expect(flatly.insert({name: "Leroy Brown"}, "subset")).not.to.be.instanceOf(Array);
        });
        
    });

    describe('#save()', function () {
        var subset = require('./fixtures/subset.json');
        var names = require('./fixtures/names.json');

        beforeEach(function () {
            
            flatly.use({src: "./fixtures/", name: 'fixtures'});
            flatly.insert({name: "Liam Whan"}, "subset");
            
        });

        after(function () {
            
            var fs = require('fs');
            var glob = require('glob');

            var backups = glob.sync("./test/fixtures/**/*.bak");

            backups.forEach(function (file) {
                
                fs.unlinkSync(file);
            });

            
        });

        afterEach(function () {
            
            var fs = require('fs');
            var glob = require('glob');

            var newfiles = glob.sync("./test/fixtures/**/!(names|subset).json");

            newfiles.forEach(function (file) {
                
                fs.unlinkSync(file);
            });

            //replace overwritten files with originals
            fs.writeFileSync('./test/fixtures/subset.json', JSON.stringify(subset, null, 2));
            fs.writeFileSync('./test/fixtures/names.json', JSON.stringify(names, null, 2));
            

        });
        
        it('should create a new file in the target folder when saved with overwrite: false', function () {
            var glob = require('glob');
            expect(glob.sync("./test/fixtures/**/*.json").length).to.equal(2);
            flatly.save('subset', false);
            expect(glob.sync("./test/fixtures/**/*.json").length).to.equal(3);
            
        });

        it('should not create a new JSON file in the target folder when saved with overwrite: true, but should create a .bak file and the original file should have an additional row', function () {
            var glob = require('glob');
            expect(glob.sync("./test/fixtures/**/*.json").length).to.equal(2);
            flatly.save('subset', true);
            expect(glob.sync("./test/fixtures/**/*.json").length).to.equal(2);
            expect(glob.sync("./test/fixtures/**/*.bak").length).to.equal(1);
            expect(flatly.getTable('subset').length).not.to.equal(subset.length);

        });


    });
    
    describe('#update()', function() {
        
        it("should change the value of a given row according to the predicate")
        
    })


});

