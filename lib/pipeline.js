
module.exports = function Pipeline(req, res, callback) {
    var self = this;
    self.req = req;
    self.res = res;
    self.callback = callback;

    var _map = function(array, fn, context, callback) {
        var ct = array.length;
        var next = function() {
            if (--ct <= 0) callback(null, context);
        };
        for (var key in array) {
            fn.call(context, array[key], next);
        }
    };

    self.start = function(instance) {
        if (!self.flows.length) {
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

    self.iterator = function () {
        var makeCallback = function (index) {
            var fn = function (next) {
                if (self.flows.length) {
                    var flow = self.flows[index];
                    switch (flow.type) {
                        case 'flow':
                            flow.call(this, next);
                            break;
                        case 'map':
                            _map(flow.array, flow, this, next);
                            break;
                    }
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < self.flows.length - 1) ? makeCallback(index + 1) : null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    self.bypass = function() {};
};
