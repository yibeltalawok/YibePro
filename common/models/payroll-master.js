'use strict';
module.exports = function (PayrollMaster) {
  PayrollMaster.payrollCalculation = function (date, cb) {
    try {
      let da = new Date(date)
      let filter = { include: ['employee'], }
      let month = da.getMonth() + 1
      let year = da.getFullYear()
      let days = 0
      const { Attendance } = PayrollMaster.app.models
      const { OverTime } = PayrollMaster.app.models
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
      PayrollMaster.find(filter, (err, res) => {

        if (res.length > 0) {
          let item = []
          for (let i = 0; i < res.length; i++) {
            let attendance = []
            for (let j = 1; j <= days; j++) {
              let currentMonth = new Date();
              currentMonth.setMonth(parseInt(month) - 1)
              currentMonth.setDate(j)
              // currentMonth.getDay() == 0 ? noOfSundays += 1 : "A"
              attendance.push({ value: currentMonth.getDay() == 0 ? "P" : "A" })
            }
            item.push({
              idno: res[i].__data.employee.idno,
              fullName: res[i].__data.employee.fullName,
              department: res[i].__data.employee.department,
              joiningDate: res[i].__data.employee.joiningDate,
              position: res[i].__data.employee.position,
              salary: res[i].__data.employee.salary,
              id: res[i].__data.id,
              attendance: attendance,
              employeeId: res[i].__data.employee.id
            })
            if (item.length == res.length) {
              manageAttendance(item)
            }
          }

        }
        else {
          cb(null, [])
        }

      })
      const manageAttendance = async function (item) {

        for (let i = 0; i < item.length; i++) {
          getAttendance(item[i].employeeId).then((result) => {
            if (result.length > 0) {
              for (let a = 0; a < result.length; a++) {
                let d = new Date(result[a].dateAttended);

                if (d.getDate() <= days) {
                  item[i].attendance[d.getDate() - 1].value = result[a].value;
                }
              }

            }
            if (i == item.length - 1) {
              calculateAttendance(item)
              // cb(null, item)
            }

          }).catch(e => {
            console.log(e)
    })
        }

      }
      const calculateAttendance = async function (item) {
        let totalP = []
        let totalA = []
        let totalPr = []
        let totalDL = []
        let totalML = []
        let totalPL = []
        let totalAL = []
        let totalMGL = []
        let totalHLA = []
        let totalHLPr = []
        let totalSL = []
        let totalSpecialL = []
        let totalLate = []
        let totalFL = []
        let workingDays = []
        for (let i = 0; i < item.length; i++) {
          totalP[i] = 0
          totalA[i] = 0
          totalPr[i] = 0
          totalDL[i] = 0
          totalML[i] = 0
          totalPL[i] = 0
          totalAL[i] = 0
          totalMGL[i] = 0
          totalHLA[i] = 0
          totalHLPr[i] = 0
          totalSL[i] = 0
          totalSpecialL[i] = 0
          totalLate[i] = 0
          totalFL[i] = 0
          workingDays[i] = 0
          let result = item[i].attendance
          for (let j = 0; j < result.length; j++) {
            if (result[j].value == "P") {
              totalP[i] += 1
              workingDays[i] += 1;

            }
            if (result[j].value == "A") {
              totalA[i] += 1

            }
            if (result[j].value == "Pr") {
              totalPr[i] += 1
              workingDays[i] += 1;

            }
            if (result[j].value == "AL") {
              totalAL[i] += 1
              workingDays[i] += 1;

            }
            if (result[j].value == "MOL") {
              totalDL[i] += 1
              workingDays[i] += 1;

            }
            if (result[j].value == "HLPR") {
              totalHLPr[i] += 1
              workingDays[i] += 1;

            }
            if (result[j].value == "HLA") {
              totalHLA[i] += 1
              workingDays[i] += 0.5;

            }
            if (result[j].value == "MGL") {
              totalMGL[i] += 1
              workingDays[i] += 1;

            }
            if (result[j].value == "ML") {
              totalML[i] += 1
              workingDays[i] += 1;

            }
            if (result[j].value == "PL") {
              totalML[i] += 1
              workingDays[i] += 1;

            }
            if (result[j].value == "SL") {
              totalSL[i] += 1
              workingDays[i] += parseFloat(result[j].slValue);

            }
            if (result[j].value == "LeM") {
              totalLate[i] += 1
              workingDays[i] +=
                1 - (parseFloat(result[j].lateMinutes) / 480).toFixed(2);

            }
            if (result[j].value == "FL") {
              totalFL[i] = 1
              workingDays[i] += 1;

            }
            if (result[j].value == "Special L") {
              totalSpecialL[i] = 1

            }

          }
          if (i == item.length - 1) {
            manageData(item, totalP, totalA, totalPr, totalDL, totalML, totalPL, totalAL, totalMGL,
              totalHLA, totalHLPr, totalSL, totalSpecialL, totalLate, totalFL, workingDays)
          }

        }
      }

      const manageData = async function (item, totalP, totalA, totalPr, totalDL, totalML, totalPL, totalAL, totalMGL,
        totalHLA, totalHLPr, totalSL, totalSpecialL, totalLate, totalFL, workingDays) {
        let otHr125 = []
        let otHr15 = []
        let otHr20 = []
        let otHr25 = []
        let otDays = []
        for (let i = 0; i < item.length; i++) {
          otHr125[i] = 0
          otHr15[i] = 0
          otHr20[i] = 0
          otHr25[i] = 0
          otDays[i] = 0
          getOvertime(item[i].id).then((time) => {

            if (time.length > 0) {
              // console.log(time[0].__data.type)
              for (let j = 0; j < time.length; j++) {
                // console.log(time[j].__data.type)
                if (time[j].__data.type == "Normal Day") {
                  otHr125[i] += parseFloat(time[j].__data.value);
                }
                else if (time[i].__data.type == "Night time") {
                  otHr15[i] += parseFloat(time[j].__data.value)
                }
                else if (time[j].__data.type == "Rest Day") {
                  otHr20[i] += parseFloat(time[j].__data.value);
                }
                else if (time[j].__data.type == "Public Holly Day") {
                  otHr25[i] += parseFloat(time[j].__data.value);
                }
                if (time.length - 1 == j) {
                  otDays[i] = (parseFloat(otHr125[i]) + parseFloat(otHr15[i]) + parseFloat(otHr20[i]) + parseFloat(otHr25[i])) / 8

                }
              }
            }
            if (i == item.length - 1) {
              assignToTable(item, totalP, totalA, totalPr, totalDL, totalML, totalPL, totalAL, totalMGL,
                totalHLA, totalHLPr, totalSL, totalSpecialL, totalLate, totalFL, workingDays, otHr125, otHr15, otHr20, otHr25, otDays)
            }

          }).catch(e => {
            console.log(e)
    })
        }
      }
      const assignToTable = async function (item, totalP, totalA, totalPr, totalDL, totalML, totalPL, totalAL, totalMGL,
        totalHLA, totalHLPr, totalSL, totalSpecialL, totalLate, totalFL, workingDays, otHr125, otHr15, otHr20, otHr25, otDays) {

        let tableValue = []
        for (let i = 0; i < item.length; i++) {
          tableValue.push({
            idno: item[i].idno,
            fullName: item[i].fullName,
            department: item[i].department,
            joiningDate: item[i].joiningDate,
            position: item[i].position,
            salary: item[i].salary,
            totalA: totalA[i],
            totalP: totalP[i],
            totalPr: totalPr[i],
            totalDL: totalDL[i],
            totalML: totalML[i],
            totalPL: totalPL[i],
            totalMGL: totalMGL[i],
            totalSL: totalSL[i],
            totalFL: totalFL[i],
            totalSpecialL: totalSpecialL[i],
            totalAL: totalAL[i],
            totalHLPr: totalHLPr[i],
            totalHLA: totalHLA[i],
            totalLate: totalLate[i],
            workingDays: workingDays[i].toFixed(2),
            otHr125: otHr125[i],
            otHr15: otHr15[i],
            otHr20: otHr20[i],
            otHr25: otHr25[i],
            totalOtDays: otDays[i]
          });
          if (item.length - 1 == i) {
            cb(null, tableValue)
          }
        }
      }
      const getOvertime = async function (payrollId) {
        let f = {
          where: { payrollId: payrollId, month: month, year: year }
        };
        let ot = await OverTime.find(f)
        return Promise.resolve(ot)
      }
      const getAttendance = async function (empId) {

        let value = await Attendance.find({ where: { month: month, year: year, employeeId: empId } })
        return Promise.resolve(value)
      }
    }
    catch (err) {
      console.log(err)
    }
  }
  PayrollMaster.remoteMethod("payrollCalculation", {
    description: "Finance report",
    accepts: [
      {
        arg: "date",
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
      path: "/payrollCalculation"
    }
  });
  PayrollMaster.finaceReport = function (date, cb) {
    try {
      let da = new Date(date)
      // let d = da.getFullYear() + "-" + (da.getMonth() + 1)//.toISOString().substr(0, 7)
      let noOfSundays = 0
      let filter = { include: ['employee'], }// where: { date: { like: d } }
      let month = da.getMonth() + 1
      let year = da.getFullYear()
      let days = 0
      const { Attendance } = PayrollMaster.app.models
      const { OverTime } = PayrollMaster.app.models
      const { TaxSlab } = PayrollMaster.app.models
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

      for (let j = 1; j <= days; j++) {
        let currentMonth = new Date();
        currentMonth.setMonth(parseInt(month) - 1)
        currentMonth.setDate(j)
        currentMonth.getDay() == 0 ? noOfSundays += 1 : "A"
      }
      PayrollMaster.find(filter, (err, res) => {
        let workingDays = []
        if (res.length > 0) {
          TaxSlab.find({}, (err, slab) => {
            for (let i = 0; i < res.length; i++) {
              workingDays[i] = noOfSundays
              getAttendance(res[i].__data.employee.id).then((result) => {
                if (result.length > 0) {
                  // if (i == 0) {
                  // console.log(result.length)
                  // }
                  for (let j = 0; j < result.length; j++) {
                    if (result[j].value == "P") {
                      workingDays[i] += 1;

                    }
                    if (result[j].value == "Pr") {

                      workingDays[i] += 1;

                    }
                    if (result[j].value == "AL") {
                      workingDays[i] += 1;

                    }
                    if (result[j].value == "MOL") {
                      workingDays[i] += 1;

                    }
                    if (result[j].value == "HLPR") {
                      workingDays[i] += 1;

                    }
                    if (result[j].value == "HLA") {
                      workingDays[i] += 0.5;

                    }
                    if (result[j].value == "MGL") {
                      workingDays[i] += 1;

                    }
                    if (result[j].value == "ML") {
                      workingDays[i] += 1;

                    }
                    if (result[j].value == "PL") {
                      workingDays[i] += 1;

                    }
                    if (result[j].value == "SL") {
                      workingDays[i] += parseFloat(result[j].slValue);

                    }
                    if (result[j].value == "LeM") {
                      workingDays[i] +=
                        1 - (parseFloat(result[j].lateMinutes) / 480).toFixed(2);

                    }
                    if (result[j].value == "FL") {
                      workingDays[i] += 1;

                    }
                  }

                }
                if (i == res.length - 1) {
                  manageData(res, workingDays, slab)
                }
              }).catch(e => {
                console.log(e)
        })
            }
          })

        } else {
          cb(null, [])
        }

      })
      const manageData = async function (item, workingDays, slab) {
        let otHr125 = []
        let otHr15 = []
        let otHr20 = []
        let otHr25 = []
        let otBirr = []
        let otDays = []
        for (let i = 0; i < item.length; i++) {
          otHr125[i] = 0
          otHr15[i] = 0
          otHr20[i] = 0
          otHr25[i] = 0
          otBirr[i] = 0
          otDays[i] = 0
          getOvertime(item[i].id).then((time) => {

            if (time.length > 0) {
              // console.log(time[0].__data.type)
              for (let j = 0; j < time.length; j++) {
                // console.log(time[j].__data.type)
                if (time[j].__data.type == "Normal Day") {
                  otHr125[i] += parseFloat(time[j].__data.value);
                }
                else if (time[i].__data.type == "Night time") {
                  otHr15[i] += parseFloat(time[j].__data.value)
                }
                else if (time[j].__data.type == "Rest Day") {
                  otHr20[i] += parseFloat(time[j].__data.value);
                }
                else if (time[j].__data.type == "Public Holly Day") {
                  otHr25[i] += parseFloat(time[j].__data.value);
                }
                if (time.length - 1 == j) {
                  otBirr[i] =
                    (parseFloat(otHr125[i]) *
                      parseFloat(item[i].__data.employee.salary) *
                      1.25) /
                    192 +
                    (parseFloat(otHr15[i]) *
                      parseFloat(item[i].__data.employee.salary) *
                      1.5) /
                    192 +
                    (parseFloat(otHr20[i]) *
                      parseFloat(item[i].__data.employee.salary) *
                      2.0) /
                    192 +
                    (parseFloat(otHr25[i]) *
                      parseFloat(item[i].__data.employee.salary) *
                      2.5) /
                    192;
                  otDays[i] = (parseFloat(otHr125[i]) + parseFloat(otHr15[i]) + parseFloat(otHr20[i]) + parseFloat(otHr25[i])) / 8

                }
              }
            }
            if (i == item.length - 1) {
              asignToTable(item, workingDays, otBirr, otDays, slab)
            }

          }).catch(e => {
            console.log(e)
    })
        }
      }
      const asignToTable = async function (item, workingDays, otBirr, otDays, slab) {
        // cb(null, [workingDays, otBirr, otDays, slab, item])
        let totalWorkDays = 30
        let tableValue = []
        for (let i = 0; i < item.length; i++) {
          //worked salary==========================
          let workedSalary =
            (parseFloat(workingDays[i] *
              parseFloat(item[i].__data.employee.salary)) /
              parseFloat(totalWorkDays)).toFixed(2);

          //per day salary====================================
          let perDaySalary = (
            parseFloat(item[i].__data.employee.salary) /
            parseFloat(totalWorkDays)
          ).toFixed(2);
          //misc payment==========================================
          let miscPayment =
            (parseFloat(item[i].__data.miscPayment) *
              parseFloat(perDaySalary)).toFixed(2);

          //   //Gross Earning============================================
          let grossEarning =
            parseFloat(workedSalary) +
            parseFloat(otBirr[i]) +
            parseFloat(item[i].__data.employee.responseAllow) +
            parseFloat(item[i].__data.employee.homeAllow) +
            parseFloat(item[i].__data.employee.ironIncentive) +
            parseFloat(item[i].__data.employee.incentiveSalary) +
            parseFloat(miscPayment) +
            parseFloat(item[i].__data.payback);

          //taxableEarning======================================
          let taxableEarning =
            (parseFloat(workedSalary) +
              parseFloat(item[i].__data.employee.taxableHomeAllow) +
              parseFloat(item[i].__data.employee.taxableProfAllow)).toFixed(2);
          //income tax=========================================================
          let incomeTax = 0//taxSlab(slab, taxableEarning);
          for (let i = 0; i < slab.length - 1; i++) {
            if (
              taxableEarning >= parseFloat(slab[i].__data.initial) &&
              taxableEarning <= parseFloat(slab[i].__data.end)
            ) {
              let tax = (
                (parseFloat(slab[i].__data.deduction) * taxableEarning) / 100 -
                parseFloat(slab[i].__data.extraDeduction)
              );
              incomeTax = tax.toFixed(2);
            }
          }
          let lastSlab = slab.length - 1;

          if (taxableEarning >= parseFloat(slab[lastSlab].__data.initial)) {
            let tax = (
              (parseFloat(slab[lastSlab].deduction) * taxableEarning) / 100 -
              parseFloat(slab[lastSlab].extraDeduction)
            );
            incomeTax = tax.toFixed(2);
          }
          //total Diduction=========================================
          let totalDeduction =
            (//parseFloat(incomeTax[i]) +
              parseFloat(item[i].__data.employee.salary) * 0.07 +
              parseFloat(item[i].__data.advancedRecievable) +
              parseFloat(item[i].__data.employee.salary) * 0.01 +
              (parseFloat(item[i].__data.employee.costSharing) / 100) *
              parseFloat(item[i].__data.employee.salary) +
              parseFloat(item[i].__data.penality)).toFixed(2);
          let netPay = (grossEarning - totalDeduction).toFixed(2)

          tableValue.push({
            idno: item[i].__data.employee.idno,
            fullName: item[i].__data.employee.fullName,
            department: item[i].__data.employee.department,
            workeDays: totalWorkDays,
            position: item[i].__data.employee.position,
            monthlySalary: item[i].__data.employee.salary,
            perDaySalary: perDaySalary,
            workedDays: parseFloat(workingDays[i]),
            otDays: otDays[i],
            workedSalary: workedSalary,
            otPayment: otBirr[i].toFixed(2),
            responseAllow: item[i].__data.employee.responseAllow,
            homeAllow: item[i].__data.employee.homeAllow,
            nonTaxableHomeAllow: item[i].__data.employee.nonTaxableHomeAllow,
            taxableHomeAllow: item[i].__data.employee.taxableHomeAllow,
            positionAllow: item[i].__data.employee.positionalAllow,
            professionalAllow: item[i].__data.employee.profAllow,
            taxableProfessionalAllow: item[i].__data.employee.taxableProfAllow,
            nonTaxableProfessionalAllow: item[i].__data.employee
              .nonTaxableProfAllow,
            absentIncentive: item[i].__data.employee.absentIncentive,
            costSharing: ((parseFloat(item[i].__data.employee.costSharing) / 100) * parseFloat(item[i].__data.employee.salary)
            ).toFixed(2),
            ironIncentive: item[i].__data.employee.ironIncentive,
            foodAllow: item[i].__data.employee.foodAllow,
            mobileAllow: item[i].__data.employee.mobileAllow,
            incentiveAllow: item[i].__data.employee.incentiveSalary,
            miscPayment: miscPayment,
            payback: item[i].__data.payback,
            grossEarning: grossEarning.toFixed(2),
            taxableEarning: taxableEarning,
            incomeTax: incomeTax,
            pension7: (
              parseFloat(item[i].__data.employee.salary) * 0.07
            ).toFixed(2),
            pension11: (
              parseFloat(item[i].__data.employee.salary) * 0.11
            ).toFixed(2),
            pension18: (
              parseFloat(item[i].__data.employee.salary) * 0.07 +
              parseFloat(item[i].__data.employee.salary) * 0.11
            ).toFixed(2),
            advancedRecievable: item[i].__data.advancedRecievable,
            labourUnion: (
              parseFloat(item[i].__data.employee.salary) * 0.01
            ),
            womanUnion: item[i].__data.employee.womanUnion,
            creditAssociation: item[i].__data.employee.creditAssociation,
            penality: item[i].__data.penality,
            medicationDeduction: item[i].__data.employee.medicationDeduction,
            totalDeduction: totalDeduction,
            netPay: netPay > 0 ? netPay : 0,
            accountNum: item[i].__data.employee.bankAccountNum
          });
          if (tableValue.length == item.length) {
            cb(null, tableValue)
          }
        }
      }
      const getOvertime = async function (payrollId) {
        let f = {
          where: { payrollId: payrollId, month: month, year: year }
        };
        let ot = await OverTime.find(f)
        return Promise.resolve(ot)
      }
      const getAttendance = async function (empId) {

        let value = await Attendance.find({ where: { month: month, year: year, employeeId: empId } })
        return Promise.resolve(value)
      }
    } catch (error) {
      throw new Error("Internal server error try again");
    }
  }

  PayrollMaster.remoteMethod("finaceReport", {
    description: "Finance report",
    accepts: [
      {
        arg: "date",
        type: "string",
        required: true
      },
      // {
      //   arg: "type",
      //   type: "string",
      //   required: true
      // },
      // {
      //   arg: "month",
      //   type: "string",
      //   required: true
      // },
      // {
      //   arg: "year",
      //   type: "string",
      //   required: true
      // },

    ],

    returns: {
      type: ["object"],
      root: true
    },

    http: {
      verb: "post",
      path: "/finaceReport"
    }
  });
  PayrollMaster.deleteAll = (cb) => {
    try {
      PayrollMaster.find({}, (err, res) => {
        cb(null, res)
      })
    } catch (error) {
      throw new Error("Internal server error try again");
    }
  }
  PayrollMaster.remoteMethod("deleteAll", {
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
  
    PayrollMaster.summarySheet = function (date, cb) {
       try {
         let da = new Date(date)
         // let d = da.getFullYear() + "-" + (da.getMonth() + 1)//.toISOString().substr(0, 7)
         let noOfSundays = 0
         let filter = { include: ['employee'], }// where: { date: { like: d } }
         let month = da.getMonth() + 1
         let year = da.getFullYear()
         let days = 0
         const { Attendance } = PayrollMaster.app.models
         const { OverTime } = PayrollMaster.app.models
         const { TaxSlab } = PayrollMaster.app.models
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
         
         for (let j = 1; j <= days; j++) {
           let currentMonth = new Date();
           currentMonth.setMonth(parseInt(month) - 1)
           currentMonth.setDate(j)
           currentMonth.getDay() == 0 ? noOfSundays += 1 : "A"
         }
         PayrollMaster.find(filter, (err, res) => {
           let workingDays = []
           if (res.length > 0) {
             TaxSlab.find({}, (err, slab) => {
               for (let i = 0; i < res.length; i++) {
                 workingDays[i] = noOfSundays
                 getAttendance(res[i].__data.employee.id).then((result) => {
                   if (result.length > 0) {
                     // if (i == 0) {
                     // console.log(result.length)
                     // }
                     for (let j = 0; j < result.length; j++) {
                       if (result[j].value == "P") {
                         workingDays[i] += 1;
   
                       }
                       if (result[j].value == "Pr") {
   
                         workingDays[i] += 1;
   
                       }
                       if (result[j].value == "AL") {
                         workingDays[i] += 1;
   
                       }
                       if (result[j].value == "MOL") {
                         workingDays[i] += 1;
   
                       }
                       if (result[j].value == "HLPR") {
                         workingDays[i] += 1;
   
                       }
                       if (result[j].value == "HLA") {
                         workingDays[i] += 0.5;
   
                       }
                       if (result[j].value == "MGL") {
                         workingDays[i] += 1;
   
                       }
                       if (result[j].value == "ML") {
                         workingDays[i] += 1;
   
                       }
                       if (result[j].value == "PL") {
                         workingDays[i] += 1;
   
                       }
                       if (result[j].value == "SL") {
                         workingDays[i] += parseFloat(result[j].slValue);
   
                       }
                       if (result[j].value == "LeM") {
                         workingDays[i] +=
                           1 - (parseFloat(result[j].lateMinutes) / 480).toFixed(2);
   
                       }
                       if (result[j].value == "FL") {
                         workingDays[i] += 1;
   
                       }
                     }
   
                   }
                   if (i == res.length - 1) {
                     manageData(res, workingDays, slab)
                   }
                 }).catch(e => {
                  console.log(e)
          })
               }
             })
   
           } else {
             cb(null, [])
           }
   
         })
         const manageData = async function (item, workingDays, slab) {
           let otHr125 = []
           let otHr15 = []
           let otHr20 = []
           let otHr25 = []
           let otBirr = []
           for (let i = 0; i < item.length; i++) {
             otHr125[i] = 0
             otHr15[i] = 0
             otHr20[i] = 0
             otHr25[i] = 0
             otBirr[i] = 0
             getOvertime(item[i].id).then((time) => {
               if (time.length > 0) {
                 // console.log(time[0].__data.type)
                 for (let j = 0; j < time.length; j++) {
                   if (time[j].__data.type == "Normal Day") {
                     otHr125[i] += parseFloat(time[j].__data.value);
                   }
                   else if (time[i].__data.type == "Night time") {
                     otHr15[i] += parseFloat(time[j].__data.value)
                   }
                   else if (time[j].__data.type == "Rest Day") {
                     otHr20[i] += parseFloat(time[j].__data.value);
                   }
                   else if (time[j].__data.type == "Public Holly Day") {
                     otHr25[i] += parseFloat(time[j].__data.value);
                   }
                   if (time.length - 1 == j) {
                     otBirr[i] =
                       (parseFloat(otHr125[i]) *
                         parseFloat(item[i].__data.employee.salary) *
                         1.25) /
                       192 +
                       (parseFloat(otHr15[i]) *
                         parseFloat(item[i].__data.employee.salary) *
                         1.5) /
                       192 +
                       (parseFloat(otHr20[i]) *
                         parseFloat(item[i].__data.employee.salary) *
                         2.0) /
                       192 +
                       (parseFloat(otHr25[i]) *
                         parseFloat(item[i].__data.employee.salary) *
                         2.5) /
                       192;
                    // otDays[i] = (parseFloat(otHr125[i]) + parseFloat(otHr15[i]) + parseFloat(otHr20[i]) + parseFloat(otHr25[i])) / 8
   
                   }
                 }
               }
               if (i == item.length - 1) {
                 asignToTable(item, workingDays,otHr125,otHr15,otHr20,otHr25,otBirr,slab)
               }
   
             }).catch(e => {
              console.log(e)
      })
           }
         }
         const asignToTable = async function (item, workingDays,otHr125,otHr15,otHr20,otHr25,otBirr,slab) {
           // cb(null, [workingDays, otBirr, otDays, slab, item])
           let totalWorkDays = 30
           let tableValue = []
           for (let i = 0; i < item.length; i++) {
             //worked salary==========================
             let workedSalary =
               (parseFloat(workingDays[i] *
                 parseFloat(item[i].__data.employee.salary)) /
                 parseFloat(totalWorkDays)).toFixed(2);
   
             //per day salary====================================
             // otHr125=parseFloat(otHr125[i]);
             // otHr15=parseFloat(otHr15[i]);
             // otHr20=parseFloat(otHr20[i]);
             // otHr25=parseFloat(otHr25[i]);
             let perDaySalary = (
               parseFloat(item[i].__data.employee.salary) /
               parseFloat(totalWorkDays)
             ).toFixed(2);
             //misc payment==========================================
             let miscPayment =
               (parseFloat(item[i].__data.miscPayment) *
                 parseFloat(perDaySalary)).toFixed(2);
   
           


   
             //taxableEarning======================================
             let taxableEarning =
               (parseFloat(workedSalary) +
                 parseFloat(item[i].__data.employee.taxableHomeAllow) +
                 parseFloat(item[i].__data.employee.taxableProfAllow)).toFixed(2);
             //income tax=========================================================
             let incomeTax = 0//taxSlab(slab, taxableEarning);
             for (let i = 0; i < slab.length - 1; i++) {
               if (
                 taxableEarning >= parseFloat(slab[i].__data.initial) &&
                 taxableEarning <= parseFloat(slab[i].__data.end)
               ) {
                 let tax = (
                   (parseFloat(slab[i].__data.deduction) * taxableEarning) / 100 -
                   parseFloat(slab[i].__data.extraDeduction)
                 );
                 incomeTax = tax.toFixed(2);
               }
             }
             let lastSlab = slab.length - 1;
   
             if (taxableEarning >= parseFloat(slab[lastSlab].__data.initial)) {
               let tax = (
                 (parseFloat(slab[lastSlab].deduction) * taxableEarning) / 100 -
                 parseFloat(slab[lastSlab].extraDeduction)
               );
               incomeTax = tax.toFixed(2);
             }
             //total Diduction=========================================





           let  salaryPerWorkDay = (
               (parseFloat(workingDays[i]) *
                   parseFloat(item[i].__data.employee.salary)) /
               parseInt(totalWorkDays)
           ).toFixed(2);

            let   totalDeduction = (
                 parseFloat(item[i].__data.employee.salary) * 0.07 +
                 parseFloat(item[i].__data.employee.salary) * 0.11 +
                 (parseFloat(item[i].__data.employee.costSharing) *
                     parseFloat(salaryPerWorkDay)) /
                 100 +
                 parseFloat(incomeTax) +
                 parseFloat(salaryPerWorkDay) * 0.01
             ).toFixed(2);

 let grossSalary =0  //   //Gross Earning============================================
   if (item[i].employee.department == "Supervisor") {
     grossSalary= (
           parseFloat(this.salaryPerWorkDay) + parseFloat(this.otBirr[i])
       ).toFixed(2);
       
        }
    else {
     grossSalary= (
       parseFloat(salaryPerWorkDay) +
       parseFloat(otBirr[i]) +
       parseFloat(workingDays[i]) +
       parseFloat(item[i].__data.employee.ironIncentive) +
       parseFloat(item[i].__data.employee.salary) * 0.11 +
       parseFloat(item[i].__data.employee.responseAllow) +
       parseFloat(item[i].__data.employee.homeAllow) +
       parseFloat(item[i].__data.employee.transportPay)
   ).toFixed(2); 
    }

   
            let netSalary = (
              parseFloat(grossSalary) - parseFloat(totalDeduction)
            ).toFixed(2);

            netSalary=
              parseFloat(netSalary) > 0 ? parseFloat(netSalary) : 0;

             let netPay = (grossSalary - totalDeduction).toFixed(2)
             tableValue.push({
               idno: item[i].__data.employee.idno,
               id: item[i].__data.employee.id,
               fullName: item[i].__data.employee.fullName,
               department: item[i].__data.employee.department,
               subDept: item[i].__data.employee.subDept,
               salary: item[i].__data.employee.salary,
               ironIncentive: item[i].__data.employee.ironIncentive,
               miscPayment: miscPayment,
               incentive:item[i].__data.employee.incentiveSalary,
               transportPay: item[i].__data.employee.transportPay,
               costSharing: ((parseFloat(item[i].__data.employee.costSharing) / 100) * parseFloat(item[i].__data.employee.salary)
               ).toFixed(2),

                   otHr125:otHr125[i],
                   otHr15:otHr15[i],
                   otHr20:otHr20[i],
                   otHr25:otHr25[i],
                   otBirr:otBirr[i],
               absentIncentive: item[i].__data.employee.absentIncentive,
               absent: 0,
               incomeTax: incomeTax,
               pensionContribution: (
                 parseFloat(item[i].__data.employee.salary) * 0.07
               ).toFixed(2),
               pensionDeduction: (
                 parseFloat(item[i].__data.employee.salary) * 0.11
               ).toFixed(2),
                payback: item[i].__data.payback,
                totalDeduction: totalDeduction,
                grossSalary: grossSalary,          
                netPay: netPay > 0 ? netPay : 0,
                sign: "",
                netSalary:netSalary
             });
             if (tableValue.length == item.length) {
               cb(null, tableValue)
             }
           }
         }
         const getOvertime = async function (payrollId) {
           let f = {
             where: { payrollId: payrollId, month: month, year: year }
           };
           let ot = await OverTime.find(f)
           return Promise.resolve(ot)
         }
         const getAttendance = async function (empId) {
   
           let value = await Attendance.find({ where: { month: month, year: year, employeeId: empId } })
           return Promise.resolve(value)
         }
       } catch (error) {
         throw new Error("Internal server error try again");
       }
     }
   
     PayrollMaster.remoteMethod("summarySheet", {
       description: "Finance report",
       accepts: [
         {
           arg: "date",
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
         path: "/summarySheet"
       }
     }); 

};

