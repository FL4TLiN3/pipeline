
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

    self.iterator = function () {
        var makeCallback = function (index) {
            var fn = function (next) {
                if (self.tasks.length) {
                    var task = self.tasks[index];
                    task.call(this).call(this, next);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < self.tasks.length - 1) ? makeCallback(index + 1) : null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    self.bypass = function() {};
};
