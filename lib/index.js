
exports = module.exports = function(method, endpoint) {
    var pipelinePlan = new PipelinePlan(method, endpoint);
    return pipelinePlan;
}

exports.version = '0.0.1';

var pipelineFactory = function(pipelinePlan) {
    function Pipeline(req, res, callback) {
        var self = this;
        self.req = req;
        self.res = res;
        self.callback = callback;

        self.start = function() {
            if (!self.flows.length) {
                return self.callback();
            }
            var wrapIterator = function(iterator) {
                return function(error) {
                    if (error) {
                        self.callback(error);
                        self.callback = function () {};
                    } else {
                        var args = Array.prototype.slice.call(arguments, 1);
                        var next = iterator.next();
                        if (next) {
                            args.push(wrapIterator(next));
                        } else {
                            args.push(self.callback);
                        }
                        process.nextTick(function () {
                            iterator.apply(null, args);
                        });
                    }
                };
            };
            wrapIterator(self.iterator())();
        };

        self.iterator = function () {
            var makeCallback = function (index) {
                var fn = function () {
                    if (self.flows.length) {
                        self.flows[index].apply(null, arguments);
                    }
                    return fn.next();
                };
                fn.next = function () {
                    return (index < self.flows.length - 1) ? makeCallback(index + 1): null;
                };
                return fn;
            };
            return makeCallback(0);
        };

        self.bypass = function() {};
    };
    Pipeline.prototype = pipelinePlan;

    return function(req, res, callback) {
        var pipeline = new Pipeline(req, res, callback);

        var Instance = function() {};
        Instance.prototype = pipeline;
        var instance = new Instance();
        for (var key in req) {
            instance[key] = req[key];
        }
        console.log(instance.__proto__.__proto__);
        instance.start();
    };
};

function PipelinePlan(method, endpoint) {
    var self = this;

    self.pipeline = null;
    self.endpoint = endpoint;
    self.method = method;
    self.option = {};

    self.flows = [];
    self.flow = function(intersection) {
        self.flows.push(intersection);
        return self;
    };

    self.map = function() {};
    self.reduce = function() {};

    self.pathToView;
    self.goes = function(pathToView) {
        self.pathToView = pathToView;
        return self;
    };

    self.ready = function(child, option) {
        self.child = child;
        self.option = option || {};
        return pipelineFactory(self);
    };

};
