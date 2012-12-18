
module.exports = function Pipeline(req, res, callback) {
    var self = this;
    self.req = req;
    self.res = res;
    self.callback = callback;

    self.start = function(instance) {
        if (!self.flows.length) {
            return self.callback();
        }
        var wrapIterator = function(iterator) {
            return function(error) {
                console.log(instance);
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
                        iterator.apply(null, instance);
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
