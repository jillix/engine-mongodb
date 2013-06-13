/*
 *  Insert something in databse
 */
exports.insert = function(link) {

    if (!link.data) {
        link.send(400, { status: "Missing data" });
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(400, err);
            return;
        }

        M.database.open(ds, function(err, db) {

            if (err) {
                link.send(400, err);
                return;
            }

            db.collection(ds.collection, function(err, collection) {

                if (err) {
                    link.send(400, err);
                    return;
                }

                var data = link.data || {};
                var docs = data.criteria || {};
                var options = data.options || {};

                // nothing to insert
                if (["{}", "[]"].indexOf(JSON.strinigfy(docs) !== -1) {
                    link.send(200, []);
                    return;
                }

                collection.insert(docs, options, function(err, docsInserted) {

                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, docsInserted);
                });
            });
        });
    });
};

/*
 *  Removes documents from database
 */
exports.remove = function(link) {

    if (!link.data) {
        link.send(400, { status: "Missing data" });
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(400, err);
            return;
        }

        M.database.open(ds, function(err, db) {

            if (err) {
                link.send(400, err);
                return;
            }

            db.collection(ds.collection, function(err, collection) {

                if (err) {
                    link.send(400, err);
                    return;
                }

                var data = link.data || {};
                var criteria = data.criteria || {};
                var update = data.update || {};
                var options = data.options || {};

                collection.update(criteria, update, options, function(err, results) {

                    if (err) {
                        link.send(400, err);
                        return;
                    }

                    link.send(200, { status: "OK" });
                });
            });
        });
    });
};
