exports.init = function () {
    var self = this;
    var config = self._config;
};

exports.req = function (ev, req) {
    var self = this;
    self.link("request", function (err, response) {
        self.emit("response", null, { err: err, res: response });
    }).send(null, req);
};
