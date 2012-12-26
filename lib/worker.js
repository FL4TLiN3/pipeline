var cp = require('child_process'),
    os = require('os'),
    _ = require('underscore'),
    pipeline = require('./');

var workers = exports = module.exports = [];

var runningTasks = workers.runningTasks = [];

runningTasks.popById= function (id) {
    for (var i = 0; i < runningTasks.length; i++) {
        if (runningTasks[i].id === id) return runningTasks.splice(i, 1)[0];
    }
};

workers.limit = os.cpus().length;

workers.pointer = 0;

workers.start = function () {
    if (workers.length) return;
    for (var i = 0; i < workers.limit; i++) fork();
};

var fork = function () {
    var forked = cp.fork(__dirname + '/workerClient.js');
    forked.on("message", onMessage);
    forked.send({
        cmd: 'ready',
        startTime: (new Date()).getTime(),
        option: pipeline.option
    });
    workers.push(forked);
};

var onMessage = function (message) {
    if (_.isString(message)) {
        console.log(message);
    } else if (_.isObject(message)) {
        runningTasks.popById(message._id).callback(null, message);
    }
};

workers.run = function (taskName, payload, type, callback) {
    payload.cmd = 'run';
    payload._id = _.uniqueId(taskName);
    payload._type = type;
    payload._taskName = taskName;
    workers.next().send(payload);
    runningTasks.push({
        id: payload._id,
        type: payload._type,
        callback: callback
    });
};

workers.next = function () {
    return workers[++workers.pointer % workers.length];
};
