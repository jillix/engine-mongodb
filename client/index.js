/**
 * req
 * Runs a MongoDB request.
 *
 * @name req
 * @function
 * @param {Event} ev The event object.
 * @param {Object} req The request object which will be sent to the server.
 */
exports.req = function (ev, req) {
    var self = this;
    self.link("request", function (err, response) {
        if (err) {
            self.emit("res_error_" + req.action, { err: err });
        } else {
            self.emit("res_success_" + req.action, response);
        }
        self.emit("response", null, { err: err, res: response });
    }).send(null, req);
};
