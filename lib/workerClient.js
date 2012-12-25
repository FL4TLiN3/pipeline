var pipeline = require('./');

var client = {};

process.on("message", function(message) {
    client[message.cmd](message);
});

client.ready = function(message) {
    var option = message.option;
    for (var key in option) {
        pipeline.set(key, option[key]);
    }
    pipeline.task.load();
    var delay = (new Date()).getTime() - message.startTime;
    process.send('worker standby for ' + delay + "ms, pid:" + process.pid);
};

client.run = function(payload) {
    var task = null;
    for (var i = 0; i < pipeline.task.length; i++) {
        if (pipeline.task[i].id === payload._taskName) {
            task = pipeline.task[i];
            break;
        }
    }
    if (!task) return;
    task(payload, function(error, payload) {
        process.send(payload);
    });
};
