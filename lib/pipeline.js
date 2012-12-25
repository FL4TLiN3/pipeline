var _ = require('underscore'),
    utils = require('./utils');

module.exports = function(method, endpoint) {
    var self = this;

    self.pipeline = null;
    self.endpoint = endpoint;
    self.method = method;
    self.option = {};

    self.tasks = [];

    /*
     * pipeline.task(fs.readdir, ['dirname']);
     */
    self.task = function(task) {
        self.tasks.push(task);
        return self;
    };

    self.map = function(propertyName, resultName, task) {
        self.tasks.push(function(payload, nextTask) {
            payload[resultName] = [];
            var ct = payload[propertyName].length;
            var callback = function(error, result) {
                payload[resultName].push(result);
                if (--ct <= 0) nextTask(null, payload);
            };
            for (var i = 0; i < payload[propertyName].length; i++) {
                task(payload[propertyName][i], callback);
            }
        });
        return self;
    };

    self.parallel = function(tasks) {
        self.tasks.push(function(payload, nextTask) {
            var ct = tasks.length;
            var callback = function(error, object) {
                payload = utils.merge(payload, object);
                if (--ct <= 0) nextTask(null, payload);
            };
            for (var i = 0; i < tasks.length; i++) {
                tasks[i](payload, callback);
            }
        });
        return self;
    };

    self.pathToView;
    self.goes = function(pathToView) {
        self.pathToView = pathToView;
        return self;
    };

    self.ready = function(child, option) {
        self.child = child;
        self.option = option || {};
        return self.start;
    };

    self.start = function(req, res, callback) {
        var payload = {};
        payload.req = req;
        payload.res = res;
        for (var key in req) {
            payload[key] = req[key];
        }
        self.callback = callback;
        self.waterflow()(null, payload);
    };

    self.waterflow = function () {
        if (!self.tasks.length) {
            return self.callback();
        }
        var flow = function (index) {
            var next = (index < self.tasks.length - 1) ? flow(index + 1) : self.callback;
            return function (error, payload) {
                if (error) {
                    self.callback(error, payload);
                } else {
                    apply(payload, index, next);
                }
            };
        };
        var apply = function(payload, index, next) {
            var pipeline = require('./');
            if (_.isFunction(self.tasks[index])) {
                self.tasks[index].apply(null, [payload, next]);
            } else if (_.isString(self.tasks[index])) {
                pipeline.run(self.tasks[index], payload, next);
            }
        };
        return flow(0);
    };
};
