var expect = require('chai').expect;
var Inject = require('../core/injector');


describe('Injector', function () {
    it('decorate each function passed in with an array of dependency names',
        function () {
            function namedFn(one, two, three, four) {}

            var arrowFn = (one, two, three, four) => {
            };

            //Negate before decoration
            expect(namedFn).not.to.have.property('deps');
            expect(namedFn.deps).to.be.undefined;
            expect(arrowFn).not.to.have.property('deps');
            expect(arrowFn.deps).to.be.undefined;

            namedFn = Inject(namedFn);
            arrowFn = Inject(arrowFn);

            expect(namedFn).to.be.a.function;
            expect(namedFn).to.have.property('deps');
            expect(namedFn.deps).to.include.members(['one','two','three','four']);
            expect(arrowFn).to.be.a.function;
            expect(arrowFn).to.have.property('deps');
            expect(arrowFn.deps).to.include.members(['one','two','three','four']);


        });



});