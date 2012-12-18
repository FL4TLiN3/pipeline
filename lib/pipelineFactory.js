var Pipeline = require('./pipeline');

module.exports = function pipelineFactory(pipelinePlan) {
    Pipeline.prototype = pipelinePlan;
    return function(req, res, callback) {
        var pipeline = new Pipeline(req, res, callback);

        var Instance = function() {};
        Instance.prototype = pipeline;
        var instance = new Instance();
        for (var key in req) {
            instance[key] = req[key];
        }
        instance.start(instance);
    };
};
