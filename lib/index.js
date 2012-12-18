var PipelinePlan = require('./pipelinePlan');

exports = module.exports = function(method, endpoint) {
    var pipelinePlan = new PipelinePlan(method, endpoint);
    return pipelinePlan;
}

exports.version = '0.0.1';

