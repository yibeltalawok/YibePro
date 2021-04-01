"use strict";

module.exports = function(OperationBulletin) {

    OperationBulletin.deleteAll = (cb) => {
        try {
            OperationBulletin.find({}, (err, res) => {
                cb(null, res)
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }
    OperationBulletin.remoteMethod("deleteAll", {
        description: "QR code generator",
        // accepts: [],

        returns: {
            type: "object",
            root: true
        },

        http: {
            verb: "delete",
            path: "/deleteAll"

        }
    })

};
