var _ = require('underscore'),
    pipeline = require('./');

var exports = module.exports = [];

exports.map = function (instance, propertyName, resultName, task) {
    instance.tasks.push(function (payload, nextTask) {
        payload[resultName] = [];
        var ct = payload[propertyName].length;
        var callback = function (error, result) {
            payload[resultName].push(result);
            if (--ct <= 0) nextTask(null, payload);
        };
        for (var i = 0; i < payload[propertyName].length; i++) {
            var pipeline = require('./');
            if (_.isFunction(task)) {
                task.apply(null, [payload[propertyName][i], callback]);
            } else if (_.isString(task)) {
                payload._type = 'map';
                payload._propertyName = propertyName;
                payload._index = i;
                pipeline.task.run(task, payload, callback);
            }
        }
    });
    return instance;
};

exports.mapRun = function (taskName, payload) {
    payload[payload._propertyName].forEach(function (item) {
        var worker = pipeline.worker.next();
        payload._id = _.uniqueId(taskName);
        worker.send(payload);
        payload._callback = callback;
        task.running.push(payload);
    });
};
