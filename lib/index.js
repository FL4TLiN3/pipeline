/**
 * Module dependencies.
 */
var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    Pipeline = require('./pipeline');

/**
 * pipeline constractor.
 *
 * Options:
 *
 *   - `compileDebug` when `false` debugging code is stripped from the compiled template
 *   - `client` when `true` the helper functions `escape()` etc will reference `jade.escape()`
 *      for use with the Jade client-side runtime.js
 *
 * @param {String} str
 * @param {Options} options
 * @return {Function}
 * @api public
 */
var pipeline = exports = module.exports = function () {
    pipeline.worker.start();
    return new Pipeline();
};

/**
 * Library version.
 */
pipeline.version = '0.0.1';

pipeline.option = {};
pipeline.set = function (key, value) {
    pipeline.option[key] = value;
};
pipeline.get = function (key) {
    return pipeline.option[key];
};

pipeline.worker = require('./worker.js');

pipeline.task = require('./task.js');

