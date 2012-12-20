var  pipelineFactory = require('./pipelineFactory');

module.exports = function PipelinePlan(method, endpoint) {
    var self = this;

    self.pipeline = null;
    self.endpoint = endpoint;
    self.method = method;
    self.option = {};

    self.tasks = [];
    self.task = function(task) {
        self.tasks.push(task);
        return self;
    };

    self.map = function(propertyName, resultName, processor) {
        self.tasks.push(function(payload, nextTask) {
            var ct = payload[propertyName].length;
            payload[resultName] = [];
            var callback = function(error, result) {
                payload[resultName].push(result);
                if (--ct <= 0) nextTask(null, payload);
            };
            for (var i = 0; i < payload[propertyName].length; i++) {
                processor(payload[propertyName][i], callback);
            }
        });
        return self;
    };

    self.reduce = function() {};

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
        self.flow()(null, payload);
    };

    self.flow = function () {
        if (!self.tasks.length) {
            return self.callback();
        }
        var makeCallback = function (index) {
            var next =  (index < self.tasks.length - 1) ? makeCallback(index + 1) : self.callback;
            return function (error, payload) {
                if (error) {
                    self.callback(error, payload);
                } else {
                    process.nextTick(function () {
                        self.tasks[index].apply(null, [payload, next]);
                    });
                }
            };
        };
        return makeCallback(0);
    };

    self.waterflow = function(instance) {
        if (!self.tasks.length) {
            return self.callback();
        }
        var wrapIterator = function(iterator) {
            return function(error) {
                if (error) {
                    self.callback(error, instance);
                } else {
                    var next = iterator.next();
                    process.nextTick(function () {
                        if (next) {
                            iterator.call(instance, wrapIterator(next));
                        } else {
                            iterator.call(instance, function(error) { self.callback(error, instance); });
                        }
                    });
                }
            };
        };
        wrapIterator(self.iterator())();
    };

};
