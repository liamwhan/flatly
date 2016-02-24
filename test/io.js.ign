var chai = require('chai');
var io = require('../core/io');
chai.should();

describe('io#getAll()', function () {
    const path = '../schema/';
    const opts = {src: path, format: 'JSON'};
    var testCase;

    before(function () {
        testCase = io.getAll(opts);
    });

    it('should be an array', function () {
        testCase.should.be.an.array;
    });

    it('should contain the correct files from the path supplied', function () {
        var expectedResults = [
            '../schema/Indicators.json',
            '../schema/Sections_GH_Home.json'
        ];

        testCase.should.have.length(2);
        expectedResults.forEach(function(file) {
            testCase.should.include(file);
        });
    })

});