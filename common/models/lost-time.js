"use strict";
const { duration } = require('moment');
var moment = require('moment');


module.exports = function (LostTime) {

  LostTime.getLostimeDashboard = (
    date, line, type,
    cb
  ) => {
    try {
      let year = new Date(date).getFullYear()

      let filter = type == "all" ? {
        where: {
          recordedtime: { like: year.toString() }
        }
      } : {
          where: {
            recordedtime: { like: year.toString() },
            linenumber: line
          }
        }
      LostTime.find(filter, (err, res) => {
        if (res.length > 0) {
          let tempValue = []
          for (let i = 0; i < res.length; i++) {
            tempValue.push({
              recordedtime: res[i].__data.recordedtime,
              month: new Date(res[i].__data.recordedtime).toISOString().substr(0, 7),
              totalmins: res[i].__data.totalmins
            })
          }
          let mon = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
          ];
          const key = "month";
          let uniqueMonths = [...new Map(tempValue.map(item => [item[key], item])).values()];
          let dashboardVal = []
          let colors = []
          let linecolors = []
          for (let i = 0; i < uniqueMonths.length; i++) {
            let totalMin = 0
            for (let j = 0; j < tempValue.length; j++) {
              if (uniqueMonths[i].month == tempValue[j].month) {
                totalMin += parseFloat(tempValue[j].totalmins)
              }
              if (j == tempValue.length - 1) {
                dashboardVal.push({
                  month: uniqueMonths[i].month,
                  monthName: mon[new Date(uniqueMonths[i].month).getMonth()],
                  totalmins: totalMin,
                })
                linecolors.push(getRandomColor() + 80)
              }

            }
          }
          dashboardVal.sort(function (a, b) {
            var m1 = new Date(a.month),
              m2 = new Date(b.month);
            return m1 - m2;
          });

          let lbls = dashboardVal.map(x => x.monthName)
          let mcn = dashboardVal.map(x => x.totalmins)
          let lineCahrt = {
            datasets: [
              {
                data: mcn,
                backgroundColor: linecolors,
                label: "Lost time"
              }
            ],
            labels: lbls
          }
          // let lbls = dashboardVal.map(x => x.monthName)
          // let mcn = dashboardVal.map(x => x.totalmins)
          // let lineCahrt =
          // {
          //   type: "line",
          //   data: {
          //     labels: lbls,
          //     datasets: [
          //       {
          //         label: "Lost time",
          //         data: mcn,
          //         fill: false,
          //         backgroundColor: [
          //           "#00ff40",
          //           "#00ffff",
          //           "#ff0000",
          //           "#ffbf00",
          //           "#00bfff",
          //           "#0040ff",
          //           "#8000ff",
          //           "#ff00ff"
          //         ],
          //         borderColor: 'rgba(153, 102, 255, 1)',
          //         borderWidth: 1
          //       }
          //     ]
          //   }
          // }
          let powerLoss = 0
          let miscellaneous = 0
          let machineBreakdown = 0
          let noWork = 0

          for (let i = 0; i < res.length; i++) {
            if (res[i].__data.reasonid == 1) {
              miscellaneous += parseFloat(res[i].__data.totalmins)
            }
            else if (res[i].__data.reasonid == 2) {
              machineBreakdown += parseFloat(res[i].__data.totalmins)
            }
            else if (res[i].__data.reasonid == 3) {
              noWork += parseFloat(res[i].__data.totalmins)
            }
            else {
              powerLoss += parseFloat(res[i].__data.totalmins)
            }

            colors.push(getRandomColor() + 80)
          }
          let reasonItem = [{ name: "Power loss", value: powerLoss },
          { name: "Machine Breakdown", value: machineBreakdown },
          { name: "No Work", value: noWork },
          { name: "Miscellaneous", value: miscellaneous }]
          let plbls = reasonItem.map(x => x.name);

          let pmcn = reasonItem.map(x => x.value);
          let pieChart = {
            datasets: [
              {
                data: pmcn,
                backgroundColor: colors,
                label: "Lost time"
              }
            ],
            labels: plbls
          }
          cb(null, [lineCahrt, pieChart])
        } else {
          cb(null, [])
        }
      })

      var getRandomColor = function () {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }
    } catch (error) {
      throw (error)
    }
  }



  LostTime.remoteMethod("getLostimeDashboard", {
    description: "getLostimeDashboard",
    accepts: [
      {
        arg: "date",
        type: "string",
        required: true
      },
      {
        arg: "line",
        type: "string",
        required: true
      },
      {
        arg: "type",
        type: "string",
        required: true
      },
    ],
    returns: {
      type: "object",
      root: true
    },

    http: {
      verb: "post",
      path: "/getLostimeDashboard"
    }
  });
  LostTime.beforeRemote("create", function (ctx, sa, next) {
    let date = new Date();
    ctx.req.body.recordedtime = date.toString();
    ctx.req.body.date = moment(date).format("YYYY-MM-DD");

    fetchIoT(ctx.req.body.iotId).then(r => {
      ctx.req.body.linenumber = r.line
      ctx.req.body.employeeId = r.employeeId

      fetchJob(r.employeeId, ctx.req.body.date).then(s => {
        ctx.req.body.jobId = s[0].__data.id
        if (ctx.req.body.reasonid == 1) ctx.req.body.reasonlabel = "Miscellaneous";
        else if (ctx.req.body.reasonid == 2) ctx.req.body.reasonlabel = "Machine Breakdown";
        else if (ctx.req.body.reasonid == 3) ctx.req.body.reasonlabel = "No Work";
        else ctx.req.body.reasonlabel = "Power Loss";
        next();
      })
        .catch(err => {
          console.log("================= Fetching Job error =====================================================")
          console.log(err)
          console.log("======================================================================")
          throw new Error("Error in fetching Fetching Job data, Please check your inputs")

        })
    }
    )
      .catch(err => {
        console.log("==================== Fetching Iot Error ==================================================")
        console.log(err)
        console.log("======================================================================")
        throw new Error("Error in fetching IoT data, Please check your inputs")

      })



    // console.log(ctx.req.body)
    // 
  });

  // Fetch the user assigned to a certain IoT device
  var fetchIoT = async function (idx) {
    const { Iot } = LostTime.app.models
    var data = await Iot.find({ where: { iotid: idx } })
    return Promise.resolve(data[0].__data);
  }

  var fetchAllIoT = async function () {
    const { Iot } = LostTime.app.models
    var data = await Iot.find({})
    return Promise.resolve(data);
  }

  // Fetch the JobID for assigned for an employee
  var fetchJob = async function (empid, dt) {

    const { Job } = LostTime.app.models
    var data = await Job.find({ where: { employeeId: empid, date: { like: dt } } })
    return Promise.resolve(data);
  }

  // Fetch Losttime for chartdata
  var fetchLostTime = async function () {
    var data = await LostTime.find({})
    return Promise.resolve(data);
  }

  //Lost time notification
  // LostTime.afterRemote("create", function (ctx, user, next) {
  //   let title =
  //     ctx.req.body.reasonid == 2
  //       ? "Machine Breakdown"
  //       : ctx.req.body.reasonid == 3
  //         ? "No Work"
  //         : "Miscellaneous";
  //   let desc =
  //     "Lost time occured. Reason: " +
  //     title +
  //     ", Op Id: " +
  //     ctx.req.body.userid +
  //     ", Machine code: SNLS002";

  //   let receiver = ctx.req.body.reasonid == 2 ? "mechanic" : "supervisor";
  //   let message = {
  //     title: title,
  //     message: desc,
  //     nDate: new Date(),
  //     receiver: receiver,
  //   };

  //   // console.log(message);
  //   // let app = require("../../server/server");
  //   const { PushNotification } = LostTime.app.models;
  //   PushNotification.create(message)
  //     .then(() => {
  //       console.log("Message stored in `PushNotification Model.`");
  //     })
  //     .catch(() => console.log("Unable to send MESSAGE"));

  //   next();
  // });

  LostTime.lineChartData = (
    numdate,
    cb
  ) => {
    console.log()

    fetchLostTime().then(s => {
      var tempar = []
      var list = []
      var res = []
      var total = 0;
      var newd = new Date()
      s.forEach(element => {

        if (((newd - element.date) / 60000 / 60 / 24) > numdate) return

        // console.log(moment(element.recordedtime).format("YYYY-MM-DD") == date)
        var idx = list.indexOf(moment(element.recordedtime).format("YYYY-MM-DD"));
        total += element.__data.totalmins;

        if (idx == -1) {
          var tempobj = {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "date": moment(element.recordedtime).format("YYYY-MM-DD"),
          }

          tempobj[element.__data.reasonid] = element.__data.totalmins
          tempar.push(tempobj)
          list.push(moment(element.recordedtime).format("YYYY-MM-DD"))
          res.push([element.__data.reasonid])

        }
        else {
          var rsidx = res[idx].indexOf(element.__data.reasonid);

          if (rsidx == -1) {
            tempar[idx][element.__data.reasonid] = element.__data.totalmins
          }

          else {
            tempar[idx][element.__data.reasonid] += element.__data.totalmins
          }
        }
      });

      // console.log(tempar)
      cb(null, tempar)
    }).catch(e => {
      console.log(e)
})

  };

  LostTime.remoteMethod("lineChartData", {
    description: "Get Line chart data for mobile application",
    returns: {
      type: [
        "object"
      ],
      root: true
    },

    accepts: [{
      arg: "numdate",
      type: "number",
    },
    ],

    http: {
      verb: "get",
      path: "/getlinechartdata"
    }
  });

  LostTime.pieChartData = (
    date,
    cb
  ) => {
    console.log()

    fetchLostTime().then(s => {
      var tempar = []
      var list = []
      var res = []
      var total = 0;
      var newd = new Date()
      s.forEach(element => {

        // console.log(((newd - element.date) / 60000 / 60 / 24))

        if (date != undefined)
          if (moment(element.recordedtime).format("YYYY-MM-DD") != date) return

        // console.log(moment(element.recordedtime).format("YYYY-MM-DD") == date)
        var idx = list.indexOf(element.__data.linenumber);
        total += element.__data.totalmins;

        if (idx == -1) {
          var tempobj = {
            "line": element.__data.linenumber,
            "tmins": element.__data.totalmins,
            "avg": 0,
          }

          tempar.push(tempobj)
          list.push(element.__data.linenumber)
        }
        else {
          tempar[idx]["tmins"] += element.__data.totalmins
        }
      });

      for (var i = 0; i < tempar.length; i++) {
        tempar[i]["avg"] = parseFloat(tempar[i]["tmins"] * 100 / total).toFixed(2)
      }
      // console.log(tempar)
      cb(null, tempar)
    }).catch(e => {
      console.log(e)
})

  };

  LostTime.remoteMethod("pieChartData", {
    description: "Get Pie chart data for mobile application",

    accepts: [{
      arg: "date",
      type: "string",
    },
    ],

    returns: {
      type: [
        "object"
      ],
      root: true
    },

    http: {
      verb: "get",
      path: "/getpiechartdata"
    }
  });

  /// remote method to prepare mobile chart data (Bar chart)

  LostTime.barChartData = (
    date,
    cb
  ) => {

    fetchLostTime().then(s => {
      var tempar = []
      var list = []
      var res = []

      s.forEach(element => {

        if (date != undefined)
          if (moment(element.recordedtime).format("YYYY-MM-DD") != date) return

        // console.log(moment(element.recordedtime).format("YYYY-MM-DD") == date)
        var idx = list.indexOf(element.__data.linenumber);

        if (idx == -1) {
          var tempobj = {
            "line": element.__data.linenumber,
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0
          }
          tempobj[element.__data.reasonid] = element.__data.totalmins
          tempar.push(tempobj)
          list.push(element.__data.linenumber)
          res.push([element.__data.reasonid])
        }
        else {

          var rsidx = res[idx].indexOf(element.__data.reasonid);

          if (rsidx == -1) {
            tempar[idx][element.__data.reasonid] = element.__data.totalmins
          }

          else {
            tempar[idx][element.__data.reasonid] += element.__data.totalmins
          }
        }

      });
      // console.log(tempar)
      cb(null, tempar)
    }).catch(e => {
      console.log(e)
})

  };


  LostTime.remoteMethod("barChartData", {
    description: "Get Bar chart data for mobile application",

    accepts: [{
      arg: "date",
      type: "string",
    },
    ],

    returns: {
      type: [
        "object"
      ],
      root: true
    },

    http: {
      verb: "get",
      path: "/getbarchartdata"
    }
  });




  LostTime.registerPowerLoss = (
    totalmins,
    cb
  ) => {
    let date = new Date();
    let recordedtime = date.toString();
    date = moment(date).format("YYYY-MM-DD");

    fetchAllIoT().then(res => {
      for (let i = 0; i < res.length; i++) {
        // console.log(res[i].__data)
        let iot = res[i].__data

        fetchJob(iot.employeeId, date).then(s => {

          LostTime.create({
            "recordedtime": recordedtime,
            "date": date,
            "linenumber": s[0].__data.line,
            "jobsId": s[0].__data.id,
            "employeeId": iot.employeeId,
            "reasonlabel": "Power Loss",
            "reasonid": 4,
            "totalmins": totalmins,
            "iotId": iot.iotid,
            "iotDeviceId": iot.id
          }).then(o => {

          }).catch(e => {
            console.log(e)
    })
        })
          .catch(err => {
            console.log("================= Fetching Job Not Found =============================")
            console.log("================= " + iot.iotid + " =============================")
            console.log(err)
            console.log("======================================================================")

          })


      }

      cb(null, {})

    }).catch(e => {
      console.log(e)
})



  };



  LostTime.remoteMethod("registerPowerLoss", {
    description: "Register Power Loss",

    accepts: [{
      arg: "totalmins",
      type: "number",
    },
    ],

    http: {
      verb: "post",
      path: "/registerpowerloss"
    }
  });

};
