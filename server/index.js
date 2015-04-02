// Dependencies
var Mongo = require("mongodb");
var MongoClient = Mongo.MongoClient;
var Ul = require("ul");

// Constants
const FLOW_LINKS = {
    REQUEST: {
        IN: "request",
        OUT: "request"
    }
};

exports.init = function () {
    var self = this;

    Object.keys(FLOW_LINKS).forEach(function (c) {
        self._access[FLOW_LINKS[c].IN] = true;
        self.on(FLOW_LINKS[c].IN, engine.flow(self, [{
            call: FLOW_LINKS[c].OUT
        }]));
    });

    var config = self._config = Ul.merge(self._config, {
        db: "engine",
        uri: null,
        actions: {}
    });

    if (!config.uri) {
        config.uri = "mongodb://localhost:27017/" + config.db;
    }

    MongoClient.connect(config.uri, function(err, db) {
        if (err) { return callback(err); }
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
            query: {},
            options: {},
            data: {}
        });

        if (typeof action.col !== "string") {
            return link.end(new Error("Collection should be a string."));
        }

        var collection = self.db.collection(action.col);

        data = Ul.merge(data, {
            m: "find",
            args: []
        });

        var func = collection[data.m];
        if (typeof func !== "function") {
            return link.end(new Error("Method doesn't exist."));
        }

        data.args.push(link.end.bind(link));
        func.apply(collection, data.args);
    });
};
