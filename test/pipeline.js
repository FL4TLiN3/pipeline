var should = require('should'),
    pipeline = require('../');

var noop = function() { console.log(arguments); };
var getNoopPipeline = function() {
    var pipeline = _pipeline('', 'GET');
    pipeline.flow(noop)
            .goes('/index.jade');
    return pipeline;
};
var iterationTask = function(payload, nextTask) {
    setTimeout(function() {
        payload['task' + payload.ct] = 'task' + payload.ct++;
        nextTask(null, payload);
    }, 100);
};
var exceptionTask = function(payload, nextTask) {
    try {
        throw new Error('some error');
    } catch (e) {
        nextTask(e, payload);
        return;
    }
};
var mapTask = function(item, callback) {
    callback(null, item);
};

describe('Pipeline', function() {
    describe('#start()', function() {
        it('should exec flows sequencially', function() {
            pipeline('', 'GET')
            .task(iterationTask)
            .task(iterationTask)
            .task(iterationTask)
            .goes()
            .ready()
            ({ct: 1}, null, function(error, payload) {
                should.not.exist(error);
                payload.should.be.eql({
                    req: { ct: 1 },
                    res: null,
                    ct: 4,
                    task1: 'task1',
                    task2: 'task2',
                    task3: 'task3'
                });
            });
        });

        it('should stop and exec callback when any step encount error', function() {
            pipeline('', 'GET')
            .task(iterationTask)
            .task(exceptionTask)
            .task(iterationTask)
            .goes()
            .ready()
            ({ct: 1}, null, function(error, payload) {
                should.exist(error);
                payload.should.be.eql({
                    req: { ct: 1 },
                    res: null,
                    ct: 2,
                    task1: 'task1'
                });
            });
        });

        it('should map successful', function() {
            pipeline('', 'GET')
            .task(iterationTask)
            .map('array', 'result', mapTask)
            .task(iterationTask)
            .goes()
            .ready()
            ({array: [1, 2, 3, 4, 5]}, null, function(error, payload) {
                should.not.exist(error);
                payload.should.be.eql({
                    req: { array: [1, 2, 3, 4, 5] },
                    res: null,
                    result: [1, 2, 3, 4, 5],
                    task1: 'task1',
                    task3: 'task3'
                });
            });
        });
    });
});
