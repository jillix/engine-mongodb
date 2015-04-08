// Dependencies
var Mongo = require("mongodb");
var MongoClient = Mongo.MongoClient;
var Ul = require("ul");

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

    console.log(config.uri);
    MongoClient.connect(config.uri, function(err, db) {
        if (err) {
            return console.error(err);
        }
        self.db = db;
    });
};

exports.request = function (link) {
    var self = this;
    var conf = self._config;

    link.data(function (err, data) {
        if (err) { return link.end(err); }
        data = Ul.merge(data, {
            action: null
        });
        if (!data.action || typeof data.action !== "string") {
            return link.end(new Error("Action is mandatory."));
        }

        var action = conf.actions[data.action];
        if (typeof action !== "object") {
            return link.end(new Error("Invalid action."));
        }

        action = Ul.merge(action, {
            col: null,
            method: "find"
        });

        if (typeof action.col !== "string") {
            return link.end(new Error("Collection should be a string."));
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
            return link.end(new Error("Arguments should be an array."));
        }

        var func = collection[data.m];
        if (typeof func !== "function") {
            return link.end(new Error("Method doesn't exist."));
        }

        data.args.push(function (err, data, stats) {
            link.end.apply(link, arguments);
        });

        func.apply(collection, data.args);
    });
};
