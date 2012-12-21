var should = require('should'),
    _pipeline = require('../');

var noop = function() { console.log(arguments); };
var getNoopPipeline = function() {
    var pipeline = _pipeline('', 'GET');
    pipeline.task(noop)
            .goes('/index.jade');
    return pipeline;
};

describe('_pipeline', function() {
    describe('#constructor()', function() {
        it('should be return object', function() {
            var pipeline = getNoopPipeline();
            pipeline.should.be.exist;
        });

        it('should have version "0.0.1"', function() {
            _pipeline.version.should.equal('0.0.1');
        });
    });

    describe('#ready()', function() {
        it('should return pipeline middleware', function() {
            var pipeline = getNoopPipeline();
            var middleware = pipeline.ready(pipeline);
            middleware.should.be.exist;
        });
    });
});

