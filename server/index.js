// Dependencies
var Mongo = require("mongodb");
var MongoClient = Mongo.MongoClient;
var Ul = require("ul");

/*!
 * init
 *
 * @name init
 * @function
 */
exports.init = function () {
    var self = this;

    var config = self._config = Ul.merge(self._config, {
        db: "engine",
        uri: null,
        actions: {}
    });

    if (!config.uri) {
        config.uri = "mongodb://localhost:27017/" + config.db;
    }

    MongoClient.connect(config.uri, function(err, db) {
        if (err) {
            return console.error(err);
        }
        self.db = db;
    });
};

exports.request = function (link) {
    var self = this;
    link.data(function (err, data) {
        if (err) { return link.end(err); }
        self.sRequest(data, function (err, res) {
            if (typeof res.toArray === "function") {
                return res.toArray(function (err, docs) {
                    link.end(err, err ? null : { res: docs  });
                });
            }
            return link.end(err, res);
        });
    });
};

exports.sRequest = function (data, callback) {

    var self = this;
    var args = arguments;

    if (!self.db) {
        return setTimeout(function () {
            self.sRequest.apply(self, args);
        }, 100);
    }

    var conf = self._config;

    data = Ul.merge(data, {
        action: null
    });

    if (!data.action || typeof data.action !== "string") {
        return callback(new Error("Action is mandatory."));
    }

    var action = conf.actions[data.action];
    if (typeof action !== "object") {
        return callback(new Error("Invalid action."));
    }

    action = Ul.merge(action, {
        col: null,
        method: "find"
    });

    if (typeof action.col !== "string") {
        return callback(new Error("Collection should be a string."));
    }

    var collection = self.db.collection(action.col);

    data = Ul.merge(data, {
        m: action.method || "find",
        args: []
    });

    if (data.args.constructor === Object) {
        var obj = data.args;
        data.args = [];
        Object.keys(obj).forEach(function (c) {
            c = parseInt(c);
            if (isNaN(c)) {
                return;
            }
            data.args[c] = obj[c];
        });
        data.args = data.args.filter(function (c) {
            return c;
        });
    }

    if (data.args.constructor !== Array) {
        return callback(new Error("Arguments should be an array."));
    }

    var func = collection[data.m];
    if (typeof func !== "function") {
        return callback(new Error("Method doesn't exist."));
    }

    data.args.push(callback);
    func.apply(collection, data.args);
};
