var  pipelineFactory = require('./pipelineFactory');

module.exports = function PipelinePlan(method, endpoint) {
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
