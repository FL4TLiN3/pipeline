var os = require('os'),
    cp = require('child_process'),
    pipeline = require('./pipeline');

exports = module.exports = function(method, endpoint) {
    return new pipeline(method, endpoint);
}

exports.version = '0.0.1';

var workers = exports._workers = [];
for (var i = 0; i < os.cpus().length; i++) {
    workers.push(cp.fork(__dirname + '/../test.js'));
    var ts = (new Date()).getTime();
    workers[i].on("message", function(m) {
        console.log(m);
    });
    workers[i].send({ cmd: 'ready', startTime: ts });
}
