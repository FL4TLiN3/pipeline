var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    pipeline = require('./');

var task = exports = module.exports = [];

task.SERIAL = 0;
task.MAP = 1;
task.PARALLEL = 2;

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

task.use = function (name, fn) {
    for (var i = 0; i < task.length; i++) {
        if (task[i].name === name) return;
    }
    fn._name = name;
    task.push(fn);
};

task.get = function (name) {
    for (var i = 0; i < task.length; i++) {
        if (task[i]._name === name) return task[i];
    }
};

