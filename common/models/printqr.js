'use strict';

var fs = require('fs');
var QRCode = require('qrcode')
const { jsPDF } = require("jspdf"); // will automatically load the node version
const { userInfo } = require('os');

module.exports = function (Printqr) {


  Printqr.listfiles = async (
  ) => {

    var filelist = fs.readdirSync('uploads/packingprint/');
    return {
      status: "success",
      files: filelist
    };
  };

  Printqr.remoteMethod("listfiles", {
    description: "List files with QR codes",

    returns: {
      type: "object",
      root: true
    },

    http: {
      verb: "get",
      path: "/listfiles"
    }
  });


  Printqr.printInventoryItemsQrcode = async (
    value,
    name
  ) => {

    try {

      var doc = new jsPDF({ orientation: "landscape" })
      doc.setFontSize(8)
      var posx = 0;
      var posy = 0;

      value.forEach(element => {
        
        QRCode.toDataURL(JSON.stringify({id: element.id, type: "item"}), async function (err, url) {
          if (posx == 11) {
            posx = 0
            posy++
          }
          if (posy == 6) {
            doc.addPage()
            posx = 0
            posy = 0
          }
          preparePDF(25 * posx + 13, 32 * posy + 12, url, element)
          await doc.save("uploads/qrtoprint/" + name + ".pdf")
          posx++
        })
      });

    }
    catch {
      throw new Error("Internal server error try again");
    }

    var preparePDF = async function (x, y, url, val) {
      doc.rect(x, y, 20, 27)
      doc.text(x + 5, y + 3, val.itemNumber)
      doc.addImage(url, 'JPEG', x + 1, y + 4.5, 18, 18)

    };

    return {
      status: "success",
      filename: name + ".pdf"
    };
  };

  Printqr.remoteMethod("printInventoryItemsQrcode", {
    description: "QR code generator",
    accepts: [{
      arg: "value",
      type: [
        "object"
      ],
      required: true
    },

    {
      arg: "name",
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
      path: "/printInventoryItemsQrcode"
    }
  });



  Printqr.printQrCode = async (
    value,
    name
  ) => {

    try {

      var doc = new jsPDF({ orientation: "landscape" })
      doc.setFontSize(8)
      var posx = 0;
      var posy = 0;

      value.forEach(element => {
        QRCode.toDataURL(JSON.stringify(element.qr), async function (err, url) {
          if (posx == 11) {
            posx = 0
            posy++
          }
          if (posy == 6) {
            doc.addPage()
            posx = 0
            posy = 0
          }
          preparePDF(25 * posx + 13, 32 * posy + 12, url, element)
          await doc.save("uploads/qrtoprint/" + name + ".pdf")
          posx++
        })
      });

    }
    catch {
      throw new Error("Internal server error try again");
    }

    var preparePDF = async function (x, y, url, val) {
      doc.rect(x, y, 20, 27)
      doc.text(x + 2, y + 3, val.partName)
      doc.text(x + 16 - val.size.length, y + 3, val.size)
      doc.text(x + 2, y + 25, val.color)
      doc.text(x + 16 - val.bundleNo.toString().length, y + 25, val.bundleNo.toString())
      doc.addImage(url, 'JPEG', x + 1, y + 4.5, 18, 18)

    };

    return {
      status: "success",
      filename: name + ".pdf"
    };
  };

  Printqr.remoteMethod("printQrCode", {
    description: "QR code generator",
    accepts: [{
      arg: "value",
      type: [
        "object"
      ],
      required: true
    },

    {
      arg: "name",
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
      path: "/printqrcode"
    }
  });
  //Ordev status Qr code

  Printqr.printOSQrCode = async (
    value,
    name
  ) => {

    try {

      var doc = new jsPDF({ orientation: "landscape" })
      doc.setFontSize(8)
      var posx = 0;
      var posy = 0;

      value.forEach(element => {
        QRCode.toDataURL(JSON.stringify(element.qr), async function (err, url) {
          if (posx == 11) {
            posx = 0
            posy++
          }
          if (posy == 6) {
            doc.addPage()
            posx = 0
            posy = 0
          }
          preparePDF(25 * posx + 13, 32 * posy + 12, url, element)
          await doc.save("uploads/qrtoprint/" + name + ".pdf")
          posx++
        })
      });

    }
    catch {
      throw new Error("Internal server error try again");
    }

    var preparePDF = async function (x, y, url, val) {
      doc.rect(x, y, 20, 27)
      doc.text(x + 2, y + 3, val.styleName)
      doc.text(x + 16 - val.size.length, y + 3, val.size)
      doc.text(x + 2, y + 25, val.color)
      doc.text(x + 16 - val.bundleNo.toString().length, y + 25, val.bundleNo.toString())
      doc.addImage(url, 'JPEG', x + 1, y + 4.5, 18, 18)

    };

    return {
      status: "success",
      filename: name + ".pdf"
    };
  };

  Printqr.remoteMethod("printOSQrCode", {
    description: "QR code generator",
    accepts: [{
      arg: "value",
      type: [
        "object"
      ],
      required: true
    },

    {
      arg: "name",
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
      path: "/printosqrcode"
    }
  });

  //Production  Qr code

  Printqr.printProductionQrCode = async (
    value,
    name
  ) => {

    try {

      var doc = new jsPDF({ orientation: "landscape" })
      doc.setFontSize(8)
      var posx = 0;
      var posy = 0;
      var bundleNumber = value[0].bundleNo
      value.forEach(element => {
        QRCode.toDataURL(JSON.stringify(element.qr), async function (err, url) {
          if (posx == 10) {
            posx = 0
            posy++
          }
          if (bundleNumber != element.bundleNo) {
            posx = 0
            posy++
            bundleNumber = element.bundleNo
          }
          if (posy == 5) {
            doc.addPage()
            posx = 0
            posy = 0
          }
          preparePDF(29 * posx + 4, 41 * posy + 4, url, element)
          await doc.save("uploads/qrtoprint/" + name + ".pdf")
          posx++
        })
      });

    }
    catch {
      throw new Error("Internal server error try again");
    }

    var preparePDF = async function (x, y, url, val) {
      doc.rect(x, y, 28, 40)
      doc.addImage(url, 'JPEG', x + 0.3, y + 0.3, 27, 27)
      doc.text(x + 3, y + 29, val.partName)
      doc.text(x + 10 - val.bundleNo.toString().length, y + 34, "B.N: " + val.bundleNo.toString())
      doc.text(x + 8, y + 38, val.color + ",")
      doc.text(x + 11 + val.color.length, y + 38, val.size)

    };

    return {
      status: "success",
      filename: name + ".pdf"
    };
  };

  Printqr.remoteMethod("printProductionQrCode", {
    description: "QR code generator",
    accepts: [{
      arg: "value",
      type: [
        "object"
      ],
      required: true
    },

    {
      arg: "name",
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
      path: "/printproductionqrcode"
    }
  });



  //attendance settelment
  Printqr.getAttendance = function (
    value,
    type,
    month, year,
    cb
  ) {


    try {
      const { Employee } = Printqr.app.models;
      const { Attendance } = Printqr.app.models;
      const { Job } = Printqr.app.models;
      if (type == 'date') {
        let persentEmp = [];

        value = new Date(value).toISOString().substr(0, 10)

        let attFilter = {
          include: ["employee"],
          where: { dateAttended: { like: value } }
        };

        Attendance.find(attFilter, function (err, res) {
          for (let i = 0; i < res.length; i++) {
            if (res[i].__data.employeeId) {
              const indexp = persentEmp.indexOf(res[i].__data.employeeId);
              if (indexp == -1) {
                persentEmp.push(res[i].__data.employeeId);
              }
            }
          }
          mapWithEmployee(persentEmp);

        })
      }

      else if (type == 'employee') {

        Employee.find({ where: { id: value } }, async function (err, res) {
          var attended = []
          findLine(res[0].__data.id).then(line => {
            // console.log(line)
            attended.push({
              idno: res[0].__data.idno,
              fullName: res[0].__data.fullName,
              department: res[0].__data.department,
              subDept: res[0].__data.subDept,
              joiningDate: res[0].__data.joiningDate,
              salary: res[0].__data.salary,
              line: line,
              id: res[0].__data.id
            });
            manageUI(attended)
          }).catch(e => {
            console.log(e)
    })






        })

      } else if (type == 'department') {

        Employee.find({ where: { department: value } }, function (err, res) {
          let attended = []
          let cbArr = []
          for (let i = 0; i < res.length; i++) {
            attended.push({
              idno: res[i].__data.idno,
              fullName: res[i].__data.fullName,
              department: res[i].__data.department,
              subDept: res[i].__data.subDept,
              joiningDate: res[i].__data.joiningDate,
              salary: res[i].__data.salary,
              id: res[i].__data.id
            });
          }
          for (let i = 0; i < attended.length; i++) {
            findLine(attended[i].id).then(line => {
              cbArr.push({
                idno: attended[i].idno,
                fullName: attended[i].fullName,
                department: attended[i].department,
                subDept: attended[i].subDept,
                joiningDate: attended[i].joiningDate,
                salary: attended[i].salary,
                line: line,
                id: attended[i].id,
              });
              // console.log(line)
              if (cbArr.length == attended.length) {
                // cb(null, 
                manageUI(cbArr)//)
              }

            }).catch(e => {
              console.log(e)
      });

          }
        })
      }
      else if (type == 'subDept') {
        Employee.find({ where: { subDept: value } }, function (err, res) {
          let attended = []
          let cbArr = []
          for (let i = 0; i < res.length; i++) {
            attended.push({
              idno: res[i].__data.idno,
              fullName: res[i].__data.fullName,
              department: res[i].__data.department,
              subDept: res[i].__data.subDept,
              joiningDate: res[i].__data.joiningDate,
              salary: res[i].__data.salary,
              id: res[i].__data.id
            });
          }
          for (let i = 0; i < attended.length; i++) {
            findLine(attended[i].id).then(line => {
              cbArr.push({
                idno: attended[i].idno,
                fullName: attended[i].fullName,
                department: attended[i].department,
                subDept: attended[i].subDept,
                joiningDate: attended[i].joiningDate,
                salary: attended[i].salary,
                line: line,
                id: attended[i].id,
              });
              // console.log(line)
              if (cbArr.length == attended.length) {
                // cb(null, 
                manageUI(cbArr)//)
              }

            }).catch(e => {
              console.log(e)
      });

          }
          // cb(null, manageUI(attended))
        })
      }
      else if (type == 'all') {
        Employee.find(function (err, res) {
          let attended = []
          let cbArr = []
          for (let i = 0; i < res.length; i++) {
            attended.push({
              idno: res[i].__data.idno,
              fullName: res[i].__data.fullName,
              department: res[i].__data.department,
              subDept: res[i].__data.subDept,
              joiningDate: res[i].__data.joiningDate,
              salary: res[i].__data.salary,
              id: res[i].__data.id
            });
          }
          for (let i = 0; i < attended.length; i++) {
            findLine(attended[i].id).then(line => {
              cbArr.push({
                idno: attended[i].idno,
                fullName: attended[i].fullName,
                department: attended[i].department,
                subDept: attended[i].subDept,
                joiningDate: attended[i].joiningDate,
                salary: attended[i].salary,
                line: line,
                id: attended[i].id,
              });
              // console.log(line)
              if (cbArr.length == attended.length) {
                // cb(null, 
                manageUI(cbArr)//)
              }

            }).catch(e => {
              console.log(e)
      });

          }
          // cb(null, manageUI(attended))
        })
      }

      var mapWithEmployee = async function (persentEmp) {
        let attended = []
        let cbArr = []
        Employee.find({}, function (err, res) {
          for (let i = 0; i < res.length; i++) {
            let isP = false
            for (let j = 0; j < persentEmp.length; j++) {
              if (persentEmp[j].toString() === res[i].__data.id.toString()) {
                isP = true
              }

            }
            if (!isP) {
              attended.push({
                idno: res[i].__data.idno,
                fullName: res[i].__data.fullName,
                department: res[i].__data.department,
                subDept: res[i].__data.subDept,
                joiningDate: res[i].__data.joiningDate,
                salary: res[i].__data.salary,
                id: res[i].__data.id,
              });
            }
          }
          for (let i = 0; i < attended.length; i++) {
            findLine(attended[i].id).then(line => {
              cbArr.push({
                idno: attended[i].idno,
                fullName: attended[i].fullName,
                department: attended[i].department,
                subDept: attended[i].subDept,
                joiningDate: attended[i].joiningDate,
                salary: attended[i].salary,
                line: line,
                id: attended[i].id,
              });
              // console.log(line)
              if (cbArr.length == attended.length) {
                // cb(null,
                manageUI(cbArr)//)
              }

            }).catch(e => {
              console.log(e)
      });

          }

        })
      }

      var manageUI = function (attended) {
        let attendEmp = []
        let days = 0
        if (month == new Date().getMonth() + 1) {
          days = new Date().getDate()
        }
        else {
          if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
            days = 31
          } else if (month == 4 || month == 6 || month == 9 || month == 11) {
            days = 30
          }
          else { days = 28 }
        }
        for (let a = 0; a < attended.length; a++) {
          let tempAttend = [];

          for (let j = 1; j <= days; j++) {
            let date = new Date();
            date.setMonth(parseInt(month) - 1)
            date.setDate(j)
            // console.log(date)
            date.setDate(j);
            tempAttend.push({
              dateAttended: date,
              month: date.getMonth() + 1,
              year: date.getFullYear(),
              value: date.getDay() == 0 ? "P" : "A",
              type: "create",
              color: date.getDay() == 0 ? "green" : "red",
              lateMinutes: 0,
              slValue: "1",
              employeeId: attended[a].id
            });
          }
          attendEmp.push({
            idno: attended[a].idno,
            fullName: attended[a].fullName,
            department: attended[a].department,
            subDept: attended[a].subDept,
            salary: attended[a].salary,
            line: attended[a].line,
            attendance: tempAttend,
            id: attended[a].id

          });


        }
        checkAttendance(attendEmp, days)
        // return attendEmp
      }
      const checkAttendance = async function (attendEmp, days) {
        let attendance = attendEmp
        for (let i = 0; i < attendEmp.length; i++) {
          getAttended(attendEmp[i].id).then(result => {
            // cb(null, result)
            if (result.length > 0) {
              for (let j = 0; j < result.length; j++) {
                let d = new Date(result[j].dateAttended);
                if (d.getDate() <= days) {
                  attendance[i].attendance[d.getDate() - 1].value = result[j].value;
                  attendance[i].attendance[d.getDate() - 1].type = "update";
                  attendance[i].attendance[d.getDate() - 1].id = result[j].id;
                  attendance[i].attendance[d.getDate() - 1].lateMinutes = result[j].lateMinutes
                  attendance[i].attendance[d.getDate() - 1].slValue = result[j].slValue
                  attendance[i].attendance[d.getDate() - 1].color = setColor(result[j].value)
                }
                else {
                  attendance[i].attendance.push({
                    dateAttended: d,
                    month: d.getMonth() + 1,
                    year: d.getFullYear(),
                    value: result[j].value,
                    type: "update",
                    color: setColor(result[j].value),
                    lateMinutes: result[j].lateMinutes,
                    slValue: result[j].slValue,
                    employeeId: result[j].employeeId,
                    id: result[j].id
                  });
                }


              }
            }
            if (attendEmp.length - 1 == i) {
              cb(null, attendance)
            }
            else if (attendEmp.length - 1 == i) {
              cb(null, attendance)
            }
          }).catch(e => {
            console.log(e)
    })

        }
      }
      const getAttended = async function (empId) {
        let value = await Attendance.find({ where: { month: month, year: year, employeeId: empId } })

        return Promise.resolve(value)
      }
      const setColor = function (value) {
        if (value == "P") {
          return "#4bf542"
        }
        else if (value == "A") {
          return "#f28979"
        }
        else if (value == "Pr") {
          return "#FF90EE90"
        }
        else if (value == "AL") {
          return "#5bf5e0"
        }
        else if (value == "MOL") {
          return "grey"
        } else if (value == "HLPR") {
          return "brown"
        }
        else if (value == "HLA") {
          return 'yellow'
        }
        else if (value == "ML") {

          return "primary"
        }
        else if (value == 'PL') {
          return 'blue'
        }

        else if (value == "SL") {
          return 'indigo'
        }

        else if (value == "MGL") {
          return 'lime'
        }
        else if (value == "LeM") {
          return "orange"
        }
        else if (value == "FL") {
          return "purple"
        }
        else if (value == "Special L") {
          return "pink"
        }
        else {
          return 'tomato'
        }

      }
      const findLine = async function (emId) {
        let d = new Date()
        let y = new Date(d)
        let line = "Not attended for long"
        let f = { where: { employeeId: emId, date: { like: y.toISOString().substring(0, 10) } } }
        let res = await Job.find(f)
        if (res.length > 0) {
          line = res[0].__data.line
        }
        else {

          y.getDay() == 1 ? y.setDate(y.getDate() - 2) : y.setDate(y.getDate() - 1)
          let f = { where: { employeeId: emId, date: { like: y.toISOString().substring(0, 10) } } }
          let res = await Job.find(f)
          if (res.length > 0) {
            line = res[0].__data.line
          }
          else {
            y.getDay() == 1 ? y.setDate(y.getDate() - 2) : y.setDate(y.getDate() - 1)
            let f = { where: { employeeId: emId, date: { like: y.toISOString().substring(0, 10) } } }
            let res = await Job.find(f)
            if (res.length > 0) {
              line = res[0].__data.line
            }
            else {
              y.getDay() == 1 ? y.setDate(y.getDate() - 2) : y.setDate(y.getDate() - 1)
              let f = { where: { employeeId: emId, date: { like: y.toISOString().substring(0, 10) } } }
              let res = await Job.find(f)
              if (res.length > 0) {
                line = res[0].__data.line
              }
            }

          }
        }
        return Promise.resolve(line)

      }
    }
    catch {
      throw new Error("Internal server error try again");
    }

    // return {
    //   status: "success",
    //   filename: "testsssss"
    // };
  };

  Printqr.remoteMethod("getAttendance", {
    description: "Attendance settelment",
    accepts: [{
      arg: "value",
      type: "string",
      required: true
    },
    {
      arg: "type",
      type: "string",
      required: true
    },
    {
      arg: "month",
      type: "string",
      required: true
    },
    {
      arg: "year",
      type: "string",
      required: true
    },

    ],

    returns: {
      type: ["object"],
      root: true
    },

    http: {
      verb: "post",
      path: "/getAttendance"
    }
  });

};
