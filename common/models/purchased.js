'use strict';
module.exports = function(Purchased) {
    Purchased.deleteAll = (cb) => {
        try {
            Purchased.find({}, (err, res) => {
                cb(null, res)
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
      }
    Purchased.remoteMethod("deleteAll", {
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
