var pipeline = require('../../lib/');

pipeline.use('iterationTask', function(payload, nextTask) {
    setTimeout(function() {
        payload.ct += 1;
        nextTask(null, payload);
    }, 1000);
});
