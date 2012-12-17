var _pipeline = require('../');

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
});

describe('Pipeline', function() {
    describe('#ready()', function() {
        it('should return pipeline middleware', function() {
            var pipeline = getNoopPipeline();
            var middleware = pipeline.ready(pipeline);
            middleware.should.be.exist;
        });
    });

    //describe('#pipelineFactory()', function() {
        //it('should be return empty object', function() {
            //var pipelineFactory = getNoopPipeline().ready();
            //console.log(pipelineFactory());
            //pipelineFactory().should.be.eql({});
        //});
    //});

    describe('#start()', function() {
        //it('should set request parameter', function() {
            //var pipeline = getNoopPipeline();
            //var pipelineFactory = pipeline.ready();
            //var callback = function(error, data) {
                //console.log(data);
                //should.not.be.exist(error);
            //};
            //pipelineFactory({test: 'test'}, {test: 'test'}, callback);
        //});

        it('should exec flows sequencially', function() {
                var pipeline = _pipeline('', 'GET');
                var flow1 = function(next) {
                    next(null, 'flow1');
                };
                var flow2 = function(args, next) {
                    console.log(args);
                    next(null, 'flow2');
                };
                var flow3 = function(args, next) {
                    console.log(args);
                    next(null, 'flow3');
                };
                var callback = function(error, data) {
                    console.log('callback');
                };
                pipeline.flow(flow1)
                        .flow(flow2)
                        .flow(flow3)
                        .goes()
                        .ready()({test: 'test'}, {test: 'test'}, callback);
        });
    });
});
