var os = require('os'),
    cp = require('child_process'),
    _ = require('underscore'),
    pipeline = require('./pipeline');

exports = module.exports = function(method, endpoint) {
    exports.startWorker();
    return new pipeline(method, endpoint);
}

exports.version = '0.0.1';

exports.workerSize = os.cpus().length;
exports.workerCt = 0;
exports.workers = [];
exports.startWorker = function() {
    if (exports.workers.length) return;
    var dispatchMsg = function(message) {
        if (_.isString(message)) {
            console.log(message);
        } else if (_.isObject(message)) {
            if (!message._id) return;
            for (var i = 0; i < exports.runningTasks.length; i++) {
                if (exports.runningTasks[i]._id === message._id) {
                    exports.runningTasks[i]._callback(null, message);
                    exports.runningTasks.splice(i, 1);
                }
            }
        }
    };
    for (var i = 0; i < exports.workerSize; i++) {
        exports.workers.push(cp.fork(__dirname + '/../test.js'));
        var ts = (new Date()).getTime();
        exports.workers[i].on("message", dispatchMsg);
        exports.workers[i].send({ cmd: 'ready', startTime: ts });
    }
};


exports.tasks = [];
exports.use = function(id, fn) {
    for (var i = 0; i < exports.tasks.length; i++) {
        if (exports.tasks[i].id === id) return;
    }
    fn.id = id;
    exports.tasks.push(fn);
};

exports.runningTasks = [];
exports.run = function(task, payload, callback) {
    var worker = exports.workers[exports.workerCt++ % exports.workerSize];
    payload.cmd = 'run';
    payload._task = task;
    payload._id = _.uniqueId(task);
    worker.send(payload);
    payload._callback = callback;
    exports.runningTasks.push(payload);
};
