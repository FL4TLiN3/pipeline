var _pipeline = require('../');

var noop = function() {};
var getNoopPipeline = function() {
    var pipeline = _pipeline('', 'GET');
    pipeline.flow(noop)
            .goes('/index.jade');
    return pipeline;
};

describe('_pipeline', function() {
    describe('#constructor()', function() {
        it('should be return empty object', function() {
            var pipeline = getNoopPipeline();
            pipeline.should.be.eql({});
        });

        it('should be return object which prototype is Pipeline', function() {
            var pipeline = getNoopPipeline();
            pipeline.__proto__.constructor.name.should.be.equal("Pipeline");
        });

        it('should have version "0.0.1"', function() {
            _pipeline.version.should.equal('0.0.1');
        });
    });
});

describe('Pipeline', function() {
    describe('#ready()', function() {
        it('should return pipeline middleware', function() {
            var pipeline = getNoopPipeline();
            var middleware = pipeline.ready(pipeline);
            middleware.should.be.exist;
        });
    });

    describe('#start()', function() {
        it('should set request parameter', function() {
            var pipeline = getNoopPipeline();
            pipeline.ready(pipeline)({test: 'test'}, {test: 'test'});
            pipeline.test.should.be.equal("test");
        });

        it('should exec flows sequencially', function() {
                var pipeline = _pipeline('', 'GET');
                var flow1 = function(next) {
                    console.log('flow1');
                    next(null, 'test');
                };
                var flow2 = function(arguments, next) {
                    console.log('flow2');
                    next(null);
                };
                var flow3 = function(next) {
                    console.log('flow3');
                    next(null);
                };
                var callback = function(error, data) {
                    console.log('callback');
                };
                pipeline.flow(flow1)
                        .flow(flow2)
                        .flow(flow3)
                        .goes()
                        .ready(pipeline)({test: 'test'}, {test: 'test'}, callback);
        });
    });
});
