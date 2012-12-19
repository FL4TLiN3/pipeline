var should = require('should'),
    _pipeline = require('../');

var noop = function() { console.log(arguments); };
var getNoopPipeline = function() {
    var pipeline = _pipeline('', 'GET');
    pipeline.flow(noop)
            .goes('/index.jade');
    return pipeline;
};

describe('Pipeline', function() {
    describe('#start()', function() {
        it('should exec flows sequencially', function() {
                var pipeline = _pipeline('', 'GET');
                var flow1 = function(next) {
                    this.flow1 = 'flow1';
                    setTimeout(function() {
                        next();
                    }, 100);
                };
                var flow2 = function(next) {
                    this.flow2 = 'flow2';
                    setTimeout(function() {
                        next();
                    }, 100);
                };
                var flow3 = function(next) {
                    this.flow3 = 'flow3';
                    setTimeout(function() {
                        next();
                    }, 100);
                };
                var callback = function(error, data) {
                    should.not.exist(error);
                    data.should.be.eql({
                        test: 'test',
                        flow1: 'flow1',
                        flow2: 'flow2',
                        flow3: 'flow3'
                    });
                };
                pipeline.flow(flow1)
                        .flow(flow2)
                        .flow(flow3)
                        .goes()
                        .ready()({test: 'test'}, {test: 'test'}, callback);
        });

        it('should stop and exec callback when any step encount error', function() {
                var pipeline = _pipeline('', 'GET');
                var flow1 = function(next) {
                    this.flow1 = 'flow1';
                    setTimeout(function() {
                        next();
                    }, 100);
                };
                var flow2 = function(next) {
                    this.flow2 = 'flow2';
                    setTimeout(function() {
                        next('error');
                    }, 100);
                };
                var flow3 = function(next) {
                    this.flow3 = 'flow3';
                    setTimeout(function() {
                        next();
                    }, 100);
                };
                var callback = function(error, data) {
                    error.should.be.eql('error');
                    data.should.be.eql({
                        test: 'test',
                        flow1: 'flow1',
                        flow2: 'flow2'
                    });
                };
                pipeline.flow(flow1)
                        .flow(flow2)
                        .flow(flow3)
                        .goes()
                        .ready()({test: 'test'}, {test: 'test'}, callback);
        });

        it('should map successful', function() {
                var pipeline = _pipeline('', 'GET');
                var flow1 = function(next) {
                    this.flow1 = 'flow1';
                    setTimeout(function() {
                        next();
                    }, 100);
                };
                var flow2 = function flow2(arg, next) {
                    this.flow2 = 'flow2';
                    this.mapResult = this.mapResult || [];
                    this.mapResult.push(arg);
                    setTimeout(function() {
                        next();
                    }, 100);
                };
                var flow3 = function(next) {
                    this.flow3 = 'flow3';
                    setTimeout(function() {
                        next();
                    }, 100);
                };
                var callback = function(error, data) {
                    should.not.exist(error);
                    data.should.be.eql({
                        test: 'test',
                        flow1: 'flow1',
                        flow2: 'flow2',
                        flow3: 'flow3',
                        mapResult: ['1', '2', '3']
                    });
                };
                pipeline.flow(flow1)
                        .map(['1', '2', '3'], flow2)
                        .flow(flow3)
                        .goes()
                        .ready()({test: 'test'}, {test: 'test'}, callback);
        });
    });
});
