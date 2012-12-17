
exports = module.exports = pipelineFactory;

exports.version = '0.0.1';

function pipelineFactory(method, endpoint) {
    var NewPipeline = function() {};
    NewPipeline.prototype = new Pipeline(method, endpoint);
    return new NewPipeline();
};

function Pipeline(method, endpoint) {
    var self = this;

    self.child = null;
    self.endpoint = endpoint;
    self.method = method;
    self.req = self.res = self.next = null;
    self.option = {};

    self.flows = [];
    self.flow = function(intersection) {
        self.flows.push(intersection);
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
        return function(req, res, next) {
            self.req = req;
            self.res = res;
            self.next = next;
            for (var key in req) {
                self.child[key] = req[key];
            }
            self.start();
        };
    };

    self.start = function() {
        if (!self.flows.length) {
            return self.next();
        }
        var wrapIterator = function(iterator) {
            return function(error) {
                if (error) {
                    self.next(error);
                    self.next = function () {};
                } else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    } else {
                        args.push(self.next);
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
};
