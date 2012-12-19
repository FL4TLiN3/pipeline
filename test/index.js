var should = require('should'),
    _pipeline = require('../');

var noop = function() { console.log(arguments); };
var getNoopPipeline = function() {
    var pipeline = _pipeline('', 'GET');
    pipeline.flow(noop)
            .goes('/index.jade');
    return pipeline;
};

describe('_pipeline', function() {
    describe('#constructor()', function() {
        it('should be return object which prototype is PipelinePlan', function() {
            var pipeline = getNoopPipeline();
            pipeline.__proto__.constructor.name.should.be.equal("PipelinePlan");
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

