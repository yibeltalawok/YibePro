'use strict';

module.exports = function(Supplier) {
    Supplier.deleteAll = (cb) => {
        try {
            Supplier.find({}, (err, res) => {
                cb(null, res)
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
      }
      Supplier.remoteMethod("deleteAll", {
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
