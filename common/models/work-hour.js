'use strict';

module.exports = function (WorkHour) {//WorkHour

  WorkHour.workindMins = (
    date,
    cb
  ) => {
    try {
      WorkHour.find({ where: { day: date } }, function (err, res) {
        var hourDiff = 0
        if (res.length > 0) {
          for (var i = 0; i < res.length; i++) {
            var timeStart = new Date("01/01/2007 " + res[i].__data.from).getHours();
            var timeEnd = new Date("01/01/2007 " + res[i].__data.to).getHours();

            hourDiff += timeEnd - timeStart;

          }

          cb(null, (hourDiff * 60).toString())
        }
        else {
          cb(null, "0")
        }

      })
    }

    catch {
      cb("Something went wrong", null)
    }

  };

  WorkHour.remoteMethod("workindMins", {
    description: "List files with QR codes",
    accepts: [{
      arg: "date",
      type: "string",
      required: true
    },
    ],
    returns: {
      type: "string",
      root: true
    },

    http: {
      verb: "get",
      path: "/workindmins"
    }
  });
};
