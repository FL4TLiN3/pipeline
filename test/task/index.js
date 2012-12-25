var pipeline = require('../../lib/');

pipeline.task.use('iterationTask', function(payload, nextTask) {
    setTimeout(function() {
        payload.ct += 1;
        nextTask(null, payload);
    }, 1000);
});

pipeline.task.use('mapTask', function(payload, callback) {
    payload.item += 1;
    callback(null, payload);
});
