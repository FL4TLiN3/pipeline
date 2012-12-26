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
    pipeline.task.get(payload._taskName)(payload, function(error, payload) {
        process.send(payload);
    });
};
