
module.exports = function (Attendance) {
  var getTotalEmployeeInSngleDepartment = async function (department) {
    const { Employee } = Attendance.app.models;
    var filter = { where: { department: department } };
    var total = await Employee.find(filter);
    total = total.length;

    return Promise.resolve(total);
  }

  var getAbsent = function (data) {
    var organized = [];
    for (let i = 0; i < data.length; i++) {
      var absent = data[i].totalEmployee - data[i].present;
      organized.push({ department: data[i].department, totalEmployee: data[i].totalEmployee, present: data[i].present, absent: absent })
    }

    return organized;
  }

  Attendance.getDashboardAttendanceStartEndDate = (startDate, endDate, cb) => {
    var data = [];
    var filter = { include: ['employee'], where: { and: [{ dateAttended: { gte: startDate } }, { dateAttended: { lte: endDate } }] } };
    Attendance.find(filter).then(res => {
      for (let i = 0; i < res.length; i++) {
        var existTempdata = 0;
        for (let d = 0; d < data.length; d++) {
          if (data[d][0] === res[i].employee.department) {
            data[d][2] = data[d][2] + 1;
            existTempdata = 1;
            if (i === (res.length - 1))
              cb(null, getAbsent(data));
            break;
          }
        }
        if (existTempdata === 0) {
          getTotalEmployeeInSngleDepartment(res[i].__data.employee.department).then(totalEmployee => {
            data.push({ department: res[i].__data.employee.department, totalEmployee: totalEmployee, present: 1 });

            if (i === (res.length - 1))
              cb(null, getAbsent(data));
          });
        }
      }
    });
  }
  Attendance.remoteMethod("getDashboardAttendanceStartEndDate", {
    description: "Dashboard employee attendance using start and end date",
    accepts: [{ arg: "startDate", type: "string", required: true }, { arg: "endDate", type: "string", required: true },],
    returns: { type: "object", root: true },

    http: {
      verb: "get",
      path: "/getDashboardAttendanceStartEndDate"
    }
  });

  Attendance.getReasonDashboard = (
    date, department, type,
    cb
  ) => {
    try {
      var year = new Date(date).getFullYear()
      let attFilter = {
        include: ['employee'],
        where: {
          year: year,
          value: { neq: "P" },
          vlaue: { neq: "A" },
        }
      };
      Attendance.find(attFilter, (err, result) => {
        if (result.length > 0) {
          let totalPr = 0
          let totalDL = 0
          let totalML = 0
          let totalPL = 0
          let totalAL = 0
          let totalMGL = 0
          let totalHLA = 0
          let totalHLPr = 0
          let totalSL = 0
          let totalSpecialL = 0
          let totalLate = 0
          let totalFL = 0
          let res = []
          if (type == 'all') {
            res = result
          }
          else {
            for (let i = 0; i < result.length; i++) {

              if (result[i].__data.employee.__data.department == department) {
                res.push(result[i])
              }
            }
          }
          for (let i = 0; i < res.length; i++) {
            if (res[i].__data.value == "Pr") {
              totalPr += 1

            }
            if (res[i].__data.value == "AL") {
              totalAL += 1

            }
            if (res[i].__data.value == "MOL") {
              totalDL += 1

            }
            if (res[i].__data.value == "HLPR") {
              totalHLPr += 1

            }
            if (res[i].__data.value == "HLA") {
              totalHLA += 1

            }
            if (res[i].__data.value == "MGL") {
              totalMGL += 1

            }
            if (res[i].__data.value == "ML") {
              totalML += 1

            }
            if (res[i].__data.value == "PL") {
              totalML += 1

            }
            if (res[i].__data.value == "SL") {
              totalSL += 1

            }
            if (res[i].__data.value == "LeM") {
              totalLate += 1

            }
            if (res[i].__data.value == "FL") {
              totalFL = 1

            }
            if (res[i].__data.value == "Special L") {
              totalSpecialL = 1

            }

          }
          let resasons = [
            { name: "Pr", value: ((totalPr / res.length) * 100).toFixed(2), },
            { name: "DL", value: (totalDL / res.length * 100).toFixed(2), },
            { name: "ML", value: (totalML / res.length * 100).toFixed(2), },
            { name: "PL", value: (totalPL / res.length * 100).toFixed(2), },
            { name: "AL", value: (totalAL / res.length * 100).toFixed(2), },
            { name: "MGL", value: (totalMGL / res.length * 100).toFixed(2), },
            { name: "HLA", value: (totalHLA / res.length * 100).toFixed(2), },
            { name: "HLPr", value: (totalHLPr / res.length * 100).toFixed(2), },
            { name: "SL", value: (totalSL / res.length * 100).toFixed(2), },
            { name: "Special L", value: (totalSpecialL / res.length * 100).toFixed(2), },
            { name: "Let min", value: (totalLate / res.length * 100).toFixed(2), },
            { name: "FL", value: (totalFL / res.length * 100).toFixed(2), }
          ]
          let colors = []
          for (let j = 0; j < resasons.length; j++) {
            colors.push(getRandomColor() + 80)
          }

          let lbls = resasons.map(x => x.name);

          let mcn = resasons.map(x => x.value);


          let pieCahrt = {
            datasets: [
              {
                data: mcn,
                backgroundColor: colors,
                label: "Attendace"
              }
            ],
            labels: lbls
          }
          cb(null, pieCahrt)
        }
        else {
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



  Attendance.remoteMethod("getReasonDashboard", {
    description: "getReasonDashboard",
    accepts: [
      {
        arg: "date",
        type: "string",
      },
      {
        arg: "department",
        type: "string",
      },
      {
        arg: "type",
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
      verb: "post",
      path: "/getReasonDashboard"
    }
  });
  Attendance.getDashboardAttendance = (
    date, department, type,
    cb
  ) => {
    try {
      let filter = type == "all" ? { include: ['userRole'] } :
        { include: ['userRole'], where: { department: department } }
      const { Employee } = Attendance.app.models
      Employee.find(filter, (err, res) => {
        //TODO reduce 2 iterations to 1 
        if (res.length > 0) {
          let roles = []
          console.log(res[0].__data.userRole.__data.name)
          for (let i = 0; i < res.length; i++) {
            roles.push(res[i].__data.userRole.__data.name)
          }
          let attObjs = roles.reduce((acc, val) => {
            acc[val] = acc[val] === undefined ? 1 : (acc[val] += 1);
            return acc;
          }, {});

          let roleNamesFromEmployees = Object.keys(attObjs);
          let roleValuesFromEmployees = Object.values(attObjs);
          getAttendance(roleNamesFromEmployees, roleValuesFromEmployees)
        }
        else {
          cb(null, [])
        }
      })
      const getAttendance = function (roleNamesFromEmployees, roleValuesFromEmployees) {

        var green = function (presentEmp) {
          var colors = []
          for (var i in presentEmp) {
            colors.push('rgba(20, 150, 50, 0.2)')
          }
          return colors
        }

        var greenborderColor = function (presentEmp) {
          var colors = []
          for (var i in presentEmp) {
            colors.push('rgba(20,150,50,1)')
          }
          return colors
        }

        var red = function (presentEmp) {
          var colors = []
          for (var i in presentEmp) {
            colors.push('rgba(255, 0, 64, 0.2)')
          }
          return colors
        }

        var redborderColor = function (presentEmp) {
          var colors = []
          for (var i in presentEmp) {
            colors.push('rgba(255, 0, 64, 1)')
          }
          return colors
        }


        var today = new Date(date).toISOString().substr(0, 10)
        let attFilter = {
          include: {
            employee: ["userRole"]
          },
          where: {
            dateAttended: { like: today }
          }
        };
        Attendance.find(attFilter, (err, res) => {
          if (res.length > 0) {
            let attRoles = []
            for (let i = 0; i < res.length; i++) {
              try {
                attRoles.push(res[i].__data.employee.__data.userRole.__data.name)
              }
              catch {

              }
            }
            let attObjs = attRoles.reduce((acc, val) => {

              acc[val] = acc[val] === undefined ? 1 : (acc[val] += 1);
              return acc;
            }, {});
            let roleNamesFromAttendances = Object.keys(attObjs);
            let roleValuesFromAttendances = Object.values(attObjs);

            let presentEmp = [];
            let aEmployeeValues = []
            let found = false;
            for (let i = 0; i < roleNamesFromEmployees.length; i++) {
              found = false;
              for (let j = 0; j < roleNamesFromAttendances.length; j++) {
                if (
                  roleNamesFromEmployees[i] == roleNamesFromAttendances[j]
                ) {
                  found = true;
                  presentEmp[i] = roleValuesFromAttendances[j];
                  aEmployeeValues[i] =
                    roleValuesFromEmployees[i] - roleValuesFromAttendances[j];
                }
              }
              if (!found) {
                presentEmp[i] = 0;
                aEmployeeValues[i] = roleValuesFromEmployees[i];
              }
            }


            // let callb = {
            //   categories: roleNamesFromEmployees,
            //   roleValuesFromEmployee: roleValuesFromEmployees,
            //   series: [
            //     {
            //       name: "PRESENT",
            //       data: presentEmp
            //     },

            //     {
            //       name: "ABSENT",
            //       data: aEmployeeValues
            //     }
            //   ]
            // }




            cb(null, {
              labels: roleNamesFromEmployees,
              datasets: [{
                label: 'Present',
                data: presentEmp,
                backgroundColor: green(presentEmp),
                borderColor: greenborderColor(),
                borderWidth: 2
              },
              {
                label: 'Absent',
                data: aEmployeeValues,
                backgroundColor: red(presentEmp),
                borderColor: redborderColor(),
                borderWidth: 1
              }
              ]
            })

          }
          else {


            var zero = function () {
              var zeros = []
              for (var i in roleValuesFromEmployees) {
                zeros.push(0)
              }
              return zeros
            }

            cb(null, {
              labels: roleNamesFromEmployees,
              datasets: [{
                label: 'Present',
                data: zero(),
                backgroundColor: green(roleValuesFromEmployees),
                borderColor: greenborderColor(),
                borderWidth: 2
              },
              {
                label: 'Absent',
                data: roleValuesFromEmployees,
                backgroundColor: red(roleValuesFromEmployees),
                borderColor: redborderColor(),
                borderWidth: 1
              }
              ]
            })


          }
        })
      }
    } catch (error) {
      throw (error)
    }
  }



  Attendance.remoteMethod("getDashboardAttendance", {
    description: "getDashboardAttendance",
    accepts: [
      {
        arg: "date",
        type: "string"
      }, {
        arg: "department",
        type: "string"
      }, {
        arg: "type",
        type: "string"
      }
    ],
    returns: {
      type: [
        "object"
      ],
      root: true
    },

    http: {
      verb: "post",
      path: "/getDashboardAttendance"
    }
  });
  Attendance.deleteAll = (cb) => {
    try {
      Employee.find({}, (err, res) => {
        cb(null, res)
      })
    } catch (error) {
      throw new Error("Internal server error try again");
    }
  }
  Attendance.remoteMethod("deleteAll", {
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
  });

};
