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

    var config = self._config = Ul.merge(self._config, {
        db: "engine",
        uri: null
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
    link.data(function (err, data) {
        if (err) { return link.end(err); }
        data = Ul.merge(data, {
            action: null
        });
        if (!data.action || typeof data.action !== "string") {
            return link.end(new Error("Action is mandatory."));
        }
    });
};
