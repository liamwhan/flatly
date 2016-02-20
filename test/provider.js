var expect = require('chai').expect;
var Provider = require('../core/provider');


describe('Provider', function () {
    function namedFn(one, two, three, four) {
    }

    var inlineFn = function (one, two, three, four) {
    };

    var arrowFn = (one, two, three, four) => {
    };
    var provider = new Provider();

    beforeEach(function () {
        provider = new Provider();
    });


    it('should contain the methods "use" and "provide".',
        function () {
            expect(provider).to.be.instanceof(Provider);
            expect(provider).to.have.property('use');
            expect(provider).to.have.property('provide');
            expect(provider).to.have.property('has');
            expect(provider).to.have.property('remove');


        });

    describe('#use()', function () {
        it('should return itself for chaining',
            function () {
                expect(provider.use(namedFn, 'namedFn')).to.be.instanceof(Provider);
            });


    });

    describe('#has()', function () {
        it('should return true when the name of a function that has been passed to #use()', function () {
            //inverse
            expect(provider.has('namedFn')).not.to.be.ok;
            //confirm
            expect(provider.use(namedFn, 'namedFn').has('namedFn')).to.be.ok;

        });

    });

    describe('#remove()', function () {

        beforeEach(function () {
            provider.use(namedFn, 'namedFn');
            provider.use(arrowFn, 'arrowFn');
        });

        it('should contain the fixture before #remove() is called', function () {

            expect(provider.has('namedFn')).to.be.ok;
            expect(provider.has('arrowFn')).to.be.ok;
        });

        it('should not contain the fixture after #remove() was called', function() {

            expect(provider.remove('namedFn').has('namedFn')).not.to.be.ok;
            expect(provider.remove('arrowFn').has('arrowFn')).not.to.be.ok;
        });

    });


});
/**
 * Created by Liam on 20/02/2016.
 */
