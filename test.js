process.on("message", function(message) {
    workerCmds[message.cmd](message);
});

var workerCmds = {};
workerCmds.ready = function(message) {
    var delay = (new Date()).getTime() - message.startTime;
    process.send('sub process stands by for ' + delay + "ms, pid:" + process.pid);
};
