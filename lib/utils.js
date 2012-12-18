var _ = require('underscore');

exports.merge = function() {
    var object = {};
    _.each(arguments, function(arg) {
        if (_.isObject(arg)) {
            _.each(arg, function(val, key) {
                this[key] = val;
            }, this);
        }
    }, object);
    return object;
}
