var pipeline = require('./lib/');
require('./test/task/');

process.on("message", function(message) {
    workerCmds[message.cmd](message);
});

var workerCmds = {};
workerCmds.ready = function(message) {
    var delay = (new Date()).getTime() - message.startTime;
    process.send('worker standby for ' + delay + "ms, pid:" + process.pid);
};

workerCmds.run = function(payload) {
    var callback = function(error, payload) {
        process.send(payload);
    };
    for (var i = 0; i < pipeline.tasks.length; i++) {
        if (pipeline.tasks[i].id === payload._task) {
            pipeline.tasks[i](payload, callback);
        }
    }
};
