'use strict';

module.exports = function (Productionhistory) {
  //getHourlyProductionReport
  var getHourlyProductionReportDetaile = async function (date, hour, empIdDist, orderIdDist) {
    var result = [];
    var bundleList = [];
    var totalDone = 0;
    var filter = { include: ['Employee', 'ScannedOrderStatus', 'Job', 'Order', 'Operation'], where: { date: { like: date }, to: { gte: hour }, employeeId: empIdDist, orderId: orderIdDist } };
    var res = await Productionhistory.find(filter);

    for (let i = 0; i < res.length; i++) {
      if (i === 0)
        result.push(res[i].__data.Order.styleName + " (#" + res[i].__data.Order.orderNumber + ")");

      var bundleQua = parseInt(res[i].__data.ScannedOrderStatus.to) - parseInt(res[i].__data.ScannedOrderStatus.from) + 1;;
      var bundleNo = res[i].__data.ScannedOrderStatus.bndlnum;
      totalDone += bundleQua;

      bundleList.push("#" + bundleNo + "-Q" + bundleQua);

      if (i === (res.length - 1)) {
        result.push(bundleList);
        result.push(totalDone);
      }
    }

    return Promise.resolve(result);
  }

  var getHourlyProductionReportSub = async function (date, hour, empList, empIdDist, orderIdDist, data) {
    for (var e = 0; e < empIdDist.length; e++) {
      var orderInOneEmp = "";
      var bundleInOneEmp = "";
      var totalDone = "";
      for (var o = 0; o < orderIdDist.length; o++) {
        var orderInOneEmpTemp = "";
        var bundleInOneEmpTemp = "";
        var totalDoneTemp = "";
        await getHourlyProductionReportDetaile(date, hour, empIdDist[e], orderIdDist[o]).then(result => {
          if (result.length > 0) {
            orderInOneEmpTemp += result[0];
            bundleInOneEmpTemp += result[1];
            totalDoneTemp += result[2];
          }
        });
        if (orderInOneEmp.length > 0 && orderInOneEmpTemp.length > 0) {
          orderInOneEmp += "___" + orderInOneEmpTemp;
          bundleInOneEmp += "___" + bundleInOneEmpTemp;
          totalDone += "___" + totalDoneTemp;
        } else {
          orderInOneEmp += orderInOneEmpTemp;
          bundleInOneEmp += bundleInOneEmpTemp;
          totalDone += totalDoneTemp;
        }
      }

      data.push({ fullname: empList[e].fullname, line: empList[e].lineBundle, operation: empList[e].operation, section: empList[e].section, orders: orderInOneEmp, bundles: bundleInOneEmp, totalDone: totalDone });
    }
    return Promise.resolve(data);
  }

  Productionhistory.getHourlyProductionReport = (date, hour, cb) => {
    var data = [];
    var empList = [];

    var empIdDist = [];
    var orderIdDist = [];
    var bundleIdDistInOrder = [];

    var empExist = 0;
    var ordExist = 0;
    var bunExist = 0;

    //I don't know whay, but add double qote at the end of hour
    if (hour.charAt(0) === '0')
      hour = hour.charAt(1);
    else
      hour = hour.charAt(0) + "" + hour.charAt(1);

    hour = parseFloat(hour);

    var filter = { include: ['Employee', 'ScannedOrderStatus', 'Job', 'Order', 'Operation'], where: { date: { like: date }, to: { gte: hour } } };
    Productionhistory.find(filter).then(res => {
      for (var i = 0; i < res.length; i++) {
        //Distinict employee finder
        for (var k = 0; k < empIdDist.length; k++) {
          if (res[i].employeeId === empIdDist[k]) {
            empExist = 1;
            break;
          } else empExist = 0;
        }

        if (empExist === 0) {
          empIdDist.push(res[i].employeeId);
          var fullname = res[i].__data.Employee.fullName;
          var lineBundle = res[i].__data.Job.line;
          var operation = res[i].__data.Operation.operationName;
          var section = res[i].__data.Operation.section;

          empList.push({ fullname, lineBundle, operation, section });
        }

        //Distinict order finder
        for (k = 0; k < orderIdDist.length; k++) {
          if (res[i].orderId === orderIdDist[k]) {
            ordExist = 1;
            break;
          } else ordExist = 0;
        }

        if (ordExist == 0) orderIdDist.push(res[i].orderId);

        //Distinict bundle finder
        for (k = 0; k < bundleIdDistInOrder.length; k++) {
          if (res[i].scannedOrderStatusId === bundleIdDistInOrder[k]) {
            bunExist = 1;
            break;
          } else bunExist = 0;
        }
        if (bunExist == 0) bundleIdDistInOrder.push(res[i].scannedOrderStatusId);

      }


      getHourlyProductionReportSub(date, hour, empList, empIdDist, orderIdDist, data).then(data => {
        cb(null, data);
      });
    });
  }

  Productionhistory.remoteMethod("getHourlyProductionReport", {
    description: "Get hourly production report in specific date",
    accepts: [
      { arg: "date", type: "string" },
      { arg: "hour", type: "string" },
    ],
    returns: {
      type: "object",
      root: true
    },
    http: {
      verb: "get",
      path: "/getHourlyProductionReport"
    }
  });



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
