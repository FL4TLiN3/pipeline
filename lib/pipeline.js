var _ = require('underscore'),
    utils = require('./utils');

module.exports = function () {
    var self = this;

    self.tasks = [];

    self.task = function (task) {
        self.tasks.push(task);
        return self;
    };

    self.map = function (propertyName, resultName, task) {
        //self.tasks.push(function (payload, nextTask) {
            //payload[resultName] = [];
            //var ct = payload[propertyName].length;
            //var callback = function (error, result) {
                //payload[resultName].push(result);
                //if (--ct <= 0) nextTask(null, payload);
            //};
            //for (var i = 0; i < payload[propertyName].length; i++) {
                //var pipeline = require('./');
                //if (_.isFunction(task)) {
                    //task.apply(null, [payload[propertyName][i], callback]);
                //} else if (_.isString(task)) {
                    //payload.cmd = 'run';
                    //payload._taskName = self.tasks[index];
                    //payload._id = _.uniqueId(taskName);
                    //payload._callback = next;

                    //payload._type = 'map';
                    //payload._propertyName = propertyName;
                    //payload._index = i;
                    //pipeline.task.run(task, payload, callback);
                //}
            //}
        //});

        if (_.isFunction(task)) {
            self.tasks.push(function (payload, nextTask) {
                var ct = payload[propertyName].length;
                payload[resultName] = [];
                payload[propertyName].forEach(function (item) {
                    task.call(null, item, function (error, result) {
                        payload[resultName].push(result);
                        if (--ct <= 0) nextTask(null, payload);
                    });
                });
            });
        } else if (_.isString(task)) {
        }
        return self;
    };

    self.parallel = function (tasks) {
        self.tasks.push(function (payload, nextTask) {
            var ct = tasks.length;
            var callback = function (error, object) {
                payload = utils.merge(payload, object);
                if (--ct <= 0) nextTask(null, payload);
            };
            for (var i = 0; i < tasks.length; i++) {
                var pipeline = require('./');
                if (_.isFunction(tasks[i])) {
                    tasks[i].apply(null, [payload, callback]);
                } else if (_.isString(tasks[i])) {
                    pipeline.task.run(tasks[i], payload, callback);
                }
            }
        });
        return self;
    };

    self.pathToView;
    self.goes = function (pathToView) {
        self.pathToView = pathToView;
        return self;
    };

    //TODO ready to be middleware
    self.ready = function () {
        return self.start;
    };

    self.start = function (req, res, callback) {
        var payload = {};
        payload.req = req;
        payload.res = res;
        for (var key in req) {
            payload[key] = req[key];
        }
        self.callback = callback;
        self.waterflow()(null, payload);
    };

    var apply = function (payload, index, next) {
        var pipeline = require('./');
        if (_.isFunction(self.tasks[index])) {
            self.tasks[index].apply(null, [payload, next]);
        } else if (_.isString(self.tasks[index])) {
            pipeline.worker.run(self.tasks[index], payload, pipeline.task.SERIAL, next);
        }
    };

    self.waterflow = function () {
        return (function (index) {
            var next = (index < self.tasks.length - 1) ? arguments.callee(index + 1) : self.callback;
            return function (error, payload) {
                if (error) {
                    self.callback(error, payload);
                } else {
                    apply(payload, index, next);
                }
            };
        })(0);
    };
};
