var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    pipeline = require('./');

var task = exports = module.exports = [];

task.running = [];

task.load = function () {
    if (!pipeline.option.taskDir) return;
    (function (dir) {
        fs.readdirSync(dir).forEach(function (item) {
            var stat = fs.statSync(path.join(dir, item));
            if (stat.isFile()) require(path.join(dir, item));
            else if (stat.isDirectory()) arguments.callee.caller(path.join(dir, item));
        });
    })(pipeline.option.taskDir);
};

task.use = function (id, fn) {
    for (var i = 0; i < task.length; i++) {
        if (task[i].id === id) return;
    }
    fn.id = id;
    task.push(fn);
};

task.run = function (taskName, payload, callback) {
    payload.cmd = 'run';
    payload._taskName = taskName;
    if (!payload._type) {
        var worker = pipeline.worker.next();
        payload._id = _.uniqueId(taskName);
        worker.send(payload);
        payload._callback = callback;
        task.running.push(payload);
    } else if (payload._type === 'map') {
        require('./map').mapRun(taskName, payload);
    }
};

