'use strict';

module.exports = function (Productionhistory) {


    Productionhistory.deleteAll = (cb) => {
        try {
            Productionhistory.find({}, (err, res) => {
            cb(null, res)
          })
        } catch (error) {
          throw new Error("Internal server error try again");
        }
      }
      Productionhistory.remoteMethod("deleteAll", {
        description: "Delete all Productionhistory",
        // accepts: [],
        returns: {
          type: "object",
          root: true
        },
        http: {
          verb: "delete",
          path: "/deleteAll"
        }
      });


};
