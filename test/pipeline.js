var path = require('path'),
    should = require('should'),
    pipeline = require('../'),
    tasks = require('./task/');

pipeline.set('taskDir', path.join(__dirname, 'task'));

var noop = function() { console.log(arguments); };
var getNoopPipeline = function() {
    var pipeline = _pipeline();
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
    callback(null, item + 1);
};
var parallelTask1 = function(payload, callback) {
    callback(null, { result1: 'foo' });
};
var parallelTask2 = function(payload, callback) {
    callback(null, { result2: 'bar' });
};

describe('Pipeline', function() {
    describe('#start()', function() {
        it('should exec flows sequencially', function() {
            pipeline()
            .task(tasks.iterationTask)
            .task(tasks.iterationTask)
            .task(tasks.iterationTask)
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
            pipeline()
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

        it('should run as multithread', function() {
            pipeline()
            .task('iterationTask')
            .task('iterationTask')
            .task('iterationTask')
            .goes()
            .ready()
            ({ct: 1}, null, function(error, payload) {
                should.not.exist(error);
                payload.ct.should.be.eql(4);
            });
        });
    });

    describe('#map()', function() {
        it('should apply passed function as mapper', function() {
            pipeline()
            .task(iterationTask)
            .map('array', 'result', mapTask)
            .task(iterationTask)
            .goes()
            .ready()
            ({ct: 1, array: [1, 2, 3, 4, 5]}, null, function(error, payload) {
                should.not.exist(error);
                payload.should.be.eql({
                    req: { ct: 1, array: [1, 2, 3, 4, 5] },
                    res: null,
                    array: [1, 2, 3, 4, 5],
                    result: [2, 3, 4, 5, 6],
                    ct: 3,
                    task1: 'task1',
                    task2: 'task2'
                });
            });
        });

        it('should apply passed function as mapper as multithread', function() {
            pipeline()
            .task(iterationTask)
            .map('array', 'result', 'mapTask')
            .task(iterationTask)
            .goes()
            .ready()
            ({ct: 1, array: [1, 2, 3, 4, 5]}, null, function(error, payload) {
                should.not.exist(error);
            });
        });
    });

    describe('#parallel()', function() {
        it('should apply passed functions as parallel tasks', function() {
            pipeline()
            .task(iterationTask)
            .parallel([parallelTask1, parallelTask2])
            .task(iterationTask)
            .goes()
            .ready()
            ({ct: 1}, null, function(error, payload) {
                should.not.exist(error);
                payload.should.be.eql({
                    req: { ct: 1 },
                    res: null,
                    result1: 'foo',
                    result2: 'bar',
                    ct: 3,
                    task1: 'task1',
                    task2: 'task2'
                });
            });
        });
    });
});
