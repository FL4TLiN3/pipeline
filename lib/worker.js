var cp = require('child_process'),
    os = require('os'),
    _ = require('underscore'),
    pipeline = require('./');

var worker = exports = module.exports = [];

worker.limit = os.cpus().length;

worker.current = 0;

worker.count = 0;

worker.start = function () {
    if (worker.length) return;
    for (var i = 0; i < worker.limit; i++) {
        worker.push(cp.fork(__dirname + '/workerClient.js'));
        worker[i].on("message", function (message) {
            if (_.isString(message)) {
                console.log(message);
            } else if (_.isObject(message)) {
                if (!message._id) return;
                for (var i = 0; i < pipeline.task.running.length; i++) {
                    if (pipeline.task.running[i]._id !== message._id) continue;
                    pipeline.task.running[i]._callback(null, message);
                    pipeline.task.running.splice(i, 1);
                }
            }
        });
        worker[i].send({
            cmd: 'ready',
            startTime: (new Date()).getTime(),
            option: pipeline.option
        });
        worker.current++;
    }
};

worker.next = function() {
    return worker[worker.count++ % worker.current];
};
