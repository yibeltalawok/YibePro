'use strict'
module.exports = function (PayrollMaster) {
  let getEmployeeDetaile = async function (employeeId, date) {
    const { Employee } = PayrollMaster.app.models
    var filter = {
      include: {
        relation: 'attendances',
        scope: { where: { dateAttended: { like: date } } },
      }, 
      where: {id: employeeId}
    }

    return Promise.resolve(await Employee.find(filter))
  }

  let getPayrollMasterList = async function (date, cb) {
    const { Attendance } = PayrollMaster.app.models
    const { OverTime } = PayrollMaster.app.models
    const { WorkDay } = PayrollMaster.app.models
    const { TaxSlab } = PayrollMaster.app.models
    let salary = 3000
    await TaxSlab.find({
      where: {
        and: [
          { initial: { lte: salary } },
          { end: { gte: salary } },
        ],
      },
    }).then(res => console.log(res[0].__data.deduction));
    var data = []
    var reportMonth = date.toString().substr(0, 7)
    var workeDay = await WorkDay.find({
      where: {
        and: [
          { date: { gte: reportMonth + '-01' } },
          { date: { lte: reportMonth + '-31' } },
        ],
      },
    })
    try {
      workeDay = workeDay[0].__data.noDays
    } catch (error) {
      workeDay = 0
    }

    var filter = {
      include: ['overtime'],
      where: { date: { like: reportMonth } },
    }

    await PayrollMaster.find(filter).then((resPaMa) => {
      console.log((resPaMa));
      for (let p = 0; p < resPaMa.length; p++) {
        getEmployeeDetaile(resPaMa[p].__data.employeeId, reportMonth).then(
         async (resEmDe) => {
            // {
            //   fullName, idno, department, position, salary, responseAllow, 
            //   absentIncentive, taxableHomeAllow, nonTaxableHomeAllow, taxableProfAllow,
            //   nonTaxableProfAllow, positionalAllow, foodAllow, mobileAllow, incentiveSalary
            //   labourContribution, womanUnion, creditAssociation, costSharing, workedDays
            // }
            let idno = resEmDe[0].__data.idno
            let incentiveSalary = resEmDe[0].__data.incentiveSalary
            let fullName = resEmDe[0].__data.fullName
            let positionalAllow = resEmDe[0].__data.positionalAllow
            let position = resEmDe[0].__data.position
            let bankAccountNum = resEmDe[0].__data.bankAccountNum
            let mobileAllow = resEmDe[0].__data.mobileAllow
            let foodAllow = resEmDe[0].__data.foodAllow
            let phoneNumber = resEmDe[0].__data.phoneNumber
            let gender = resEmDe[0].__data.gender
            let joiningDate = resEmDe[0].__data.joiningDate
            let department = resEmDe[0].__data.department
            let subDept = resEmDe[0].__data.subDept
            let salary = resEmDe[0].__data.salary
            let pension = salary * 0.07
            let totalSalary = resEmDe[0].__data.totalSalary
            let overtime = resEmDe[0].__data.overtime
            let prfrm = resEmDe[0].__data.prfrm
            let discipline = resEmDe[0].__data.discipline
            let quality = resEmDe[0].__data.quality
            let pay = resEmDe[0].__data.pay
            let responseAllow = resEmDe[0].__data.responseAllow
            let homeAllow = resEmDe[0].__data.homeAllow
            let taxableHomeAllow = resEmDe[0].__data.taxableHomeAllow
            let nonTaxableHomeAllow = resEmDe[0].__data.nonTaxableHomeAllow
            let profAllow = resEmDe[0].__data.profAllow
            let taxableProfAllow = resEmDe[0].__data.taxableProfAllow
            let nonTaxableProfAllow = resEmDe[0].__data.nonTaxableProfAllow
            let absentIncentive = resEmDe[0].__data.absentIncentive
            let transportPay = resEmDe[0].__data.transportPay
            let costSharing = resEmDe[0].__data.costSharing
            let ironIncentive = resEmDe[0].__data.ironIncentive
            let labourContribution = resEmDe[0].__data.labourContribution
            let womanUnion = resEmDe[0].__data.womanUnion
            let creditAssociation = resEmDe[0].__data.creditAssociation
            let medicationDeduction = resEmDe[0].__data.medicationDeduction
            let userRoleId = resEmDe[0].__data.userRoleId

            let workedDays = 0

            //Fetch single  person total attendance in a given month attemdance data
            for (let a = 0; a < resEmDe[0].__data.attendances.length; a++) {
              workedDays += parseFloat(resEmDe[0].__data.attendances[a].slValue)
            }

            let perDaySalary = salary / workeDay
            let workedSalary = perDaySalary * workedDays

            //THis from payrollMaster
            let payback = resPaMa[p].__data.payback
            let advancedRecievable = resPaMa[p].__data.advancedRecievable
            let penality = resPaMa[p].__data.penality
            let miscPayment = resPaMa[p].__data.miscPayment

            let overTimeDays = 0
            //fetch overTimeDays
            for (let o = 0; o < resPaMa[p].__data.overtime.length; o++) {
              overTimeDays += parseFloat(resPaMa[p].__data.overtime[o].value)
            }
            // Over time payment
            let OverTimePayment = perDaySalary * overTimeDays
            // Gross earning
            let grossEarning = workedSalary + OvertimePayment + responseAllow + homeAllow + positionalAllow 
            + profAllow + absentIncentive + ironIncentive + foodAllow + mobileAllow + incentiveSalary + miscPayment + payback
            // Taxable Earnings
            let taxableEarning = workedSalary + taxableHomeAllow + taxableProfAllow
            // Income tax
            let incomeTax = await TaxSlab.find({
              where: {
                and: [
                  { initial: { lte: taxableEarning } },
                  { end: { gte: taxableEarning } },
                ],
              },
            }).then(res => ((taxableEarning * res[0].__data.deduction/ 100) - res[0].__data.extraDeduction)).catch(err => console.log(err));
           
            // Total deduction
            let totalDeduction = incomeTax + pension + advancedRecievable + labourContribution + costSharing + penality
            // Net salary
            let netSalary = grossEarning - totalDeduction


            data.push({
              fullName, idno, department, position, salary, responseAllow, 
              absentIncentive, taxableHomeAllow, nonTaxableHomeAllow, taxableProfAllow,
              nonTaxableProfAllow, positionalAllow, foodAllow, mobileAllow, incentiveSalary,
              labourContribution, womanUnion, creditAssociation, costSharing, workedDays,
              perDaySalary, workedSalary, overTimeDays, payback, advancedRecievable, penality,
              miscPayment, pension, incomeTax, taxableEarning, medicationDeduction
            })
            if (p === resPaMa.length - 1) {
              cb(null, data)
            }
          },
        )
      }
      if (resPaMa.length === 0) {
         cb(null, data)
      }
    })
  }

  PayrollMaster.financeReport = function (date, cb) {
    getPayrollMasterList(date, cb)
  }

  PayrollMaster.remoteMethod('financeReport', {
    description: 'Finance report',
    accepts: [
      {
        arg: 'date',
        type: 'string',
        required: true,
      },
    ],

    returns: {
      type: ['object'],
      root: true,
    },

    http: {
      verb: 'post',
      path: '/financeReport',
    },
  })
  PayrollMaster.deleteAll = (cb) => {
    try {
      PayrollMaster.find({}, (err, res) => {
        cb(null, res)
      })
    } catch (error) {
      throw new Error('Internal server error try again')
    }
  }
  PayrollMaster.remoteMethod('deleteAll', {
    description: 'QR code generator',
    // accepts: [],

    returns: {
      type: 'object',
      root: true,
    },

    http: {
      verb: 'delete',
      path: '/deleteAll',
    },
  })

  PayrollMaster.summarySheet = function (date, cb) {
    try {
      let da = new Date(date)
      // let d = da.getFullYear() + "-" + (da.getMonth() + 1)//.toISOString().substr(0, 7)
      let noOfSundays = 0
      let filter = { include: ['employee'] } // where: { date: { like: d } }
      let month = da.getMonth() + 1
      let year = da.getFullYear()
      let days = 0
      const { Attendance } = PayrollMaster.app.models
      const { OverTime } = PayrollMaster.app.models
      const { TaxSlab } = PayrollMaster.app.models
      if (month == new Date().getMonth() + 1) {
        days = new Date().getDate()
      } else {
        if (
          month == 1 ||
          month == 3 ||
          month == 5 ||
          month == 7 ||
          month == 8 ||
          month == 10 ||
          month == 12
        ) {
          days = 31
        } else if (month == 4 || month == 6 || month == 9 || month == 11) {
          days = 30
        } else {
          days = 28
        }
      }

      for (let j = 1; j <= days; j++) {
        let currentMonth = new Date()
        currentMonth.setMonth(parseInt(month) - 1)
        currentMonth.setDate(j)
        currentMonth.getDay() == 0 ? (noOfSundays += 1) : 'A'
      }
      PayrollMaster.find(filter, (err, res) => {
        let workingDays = []
        if (res.length > 0) {
          TaxSlab.find({}, (err, slab) => {
            for (let i = 0; i < res.length; i++) {
              workingDays[i] = noOfSundays
              getAttendance(res[i].__data.employee.id)
                .then((result) => {
                  if (result.length > 0) {
                    // if (i == 0) {
                    // console.log(result.length)
                    // }
                    for (let j = 0; j < result.length; j++) {
                      if (result[j].value == 'P') {
                        workingDays[i] += 1
                      }
                      if (result[j].value == 'Pr') {
                        workingDays[i] += 1
                      }
                      if (result[j].value == 'AL') {
                        workingDays[i] += 1
                      }
                      if (result[j].value == 'MOL') {
                        workingDays[i] += 1
                      }
                      if (result[j].value == 'HLPR') {
                        workingDays[i] += 1
                      }
                      if (result[j].value == 'HLA') {
                        workingDays[i] += 0.5
                      }
                      if (result[j].value == 'MGL') {
                        workingDays[i] += 1
                      }
                      if (result[j].value == 'ML') {
                        workingDays[i] += 1
                      }
                      if (result[j].value == 'PL') {
                        workingDays[i] += 1
                      }
                      if (result[j].value == 'SL') {
                        workingDays[i] += parseFloat(result[j].slValue)
                      }
                      if (result[j].value == 'LeM') {
                        workingDays[i] +=
                          1 -
                          (parseFloat(result[j].lateMinutes) / 480).toFixed(2)
                      }
                      if (result[j].value == 'FL') {
                        workingDays[i] += 1
                      }
                    }
                  }
                  if (i == res.length - 1) {
                    manageData(res, workingDays, slab)
                  }
                })
                .catch((e) => {
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
          getOvertime(item[i].id)
            .then((time) => {
              if (time.length > 0) {
                // console.log(time[0].__data.type)
                for (let j = 0; j < time.length; j++) {
                  if (time[j].__data.type == 'Normal Day') {
                    otHr125[i] += parseFloat(time[j].__data.value)
                  } else if (time[i].__data.type == 'Night time') {
                    otHr15[i] += parseFloat(time[j].__data.value)
                  } else if (time[j].__data.type == 'Rest Day') {
                    otHr20[i] += parseFloat(time[j].__data.value)
                  } else if (time[j].__data.type == 'Public Holly Day') {
                    otHr25[i] += parseFloat(time[j].__data.value)
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
                        192
                    // otDays[i] = (parseFloat(otHr125[i]) + parseFloat(otHr15[i]) + parseFloat(otHr20[i]) + parseFloat(otHr25[i])) / 8
                  }
                }
              }
              if (i == item.length - 1) {
                asignToTable(
                  item,
                  workingDays,
                  otHr125,
                  otHr15,
                  otHr20,
                  otHr25,
                  otBirr,
                  slab,
                )
              }
            })
            .catch((e) => {
              console.log(e)
            })
        }
      }
      const asignToTable = async function (
        item,
        workingDays,
        otHr125,
        otHr15,
        otHr20,
        otHr25,
        otBirr,
        slab,
      ) {
        // cb(null, [workingDays, otBirr, otDays, slab, item])
        let totalWorkDays = 30
        let tableValue = []
        for (let i = 0; i < item.length; i++) {
          //worked salary==========================
          let workedSalary = (
            parseFloat(
              workingDays[i] * parseFloat(item[i].__data.employee.salary),
            ) / parseFloat(totalWorkDays)
          ).toFixed(2)

          //per day salary====================================
          // otHr125=parseFloat(otHr125[i]);
          // otHr15=parseFloat(otHr15[i]);
          // otHr20=parseFloat(otHr20[i]);
          // otHr25=parseFloat(otHr25[i]);
          let perDaySalary = (
            parseFloat(item[i].__data.employee.salary) /
            parseFloat(totalWorkDays)
          ).toFixed(2)
          //misc payment==========================================
          let miscPayment = (
            parseFloat(item[i].__data.miscPayment) * parseFloat(perDaySalary)
          ).toFixed(2)

          //taxableEarning======================================
          let taxableEarning = (
            parseFloat(workedSalary) +
            parseFloat(item[i].__data.employee.taxableHomeAllow) +
            parseFloat(item[i].__data.employee.taxableProfAllow)
          ).toFixed(2)
          //income tax=========================================================
          let incomeTax = 0 //taxSlab(slab, taxableEarning);
          for (let i = 0; i < slab.length - 1; i++) {
            if (
              taxableEarning >= parseFloat(slab[i].__data.initial) &&
              taxableEarning <= parseFloat(slab[i].__data.end)
            ) {
              let tax =
                (parseFloat(slab[i].__data.deduction) * taxableEarning) / 100 -
                parseFloat(slab[i].__data.extraDeduction)
              incomeTax = tax.toFixed(2)
            }
          }
          let lastSlab = slab.length - 1

          if (taxableEarning >= parseFloat(slab[lastSlab].__data.initial)) {
            let tax =
              (parseFloat(slab[lastSlab].deduction) * taxableEarning) / 100 -
              parseFloat(slab[lastSlab].extraDeduction)
            incomeTax = tax.toFixed(2)
          }
          //total Diduction=========================================

          let salaryPerWorkDay = (
            (parseFloat(workingDays[i]) *
              parseFloat(item[i].__data.employee.salary)) /
            parseInt(totalWorkDays)
          ).toFixed(2)

          let totalDeduction = (
            parseFloat(item[i].__data.employee.salary) * 0.07 +
            parseFloat(item[i].__data.employee.salary) * 0.11 +
            (parseFloat(item[i].__data.employee.costSharing) *
              parseFloat(salaryPerWorkDay)) /
              100 +
            parseFloat(incomeTax) +
            parseFloat(salaryPerWorkDay) * 0.01
          ).toFixed(2)

          let grossSalary = 0 //   //Gross Earning============================================
          if (item[i].employee.department == 'Supervisor') {
            grossSalary = (
              parseFloat(this.salaryPerWorkDay) + parseFloat(this.otBirr[i])
            ).toFixed(2)
          } else {
            grossSalary = (
              parseFloat(salaryPerWorkDay) +
              parseFloat(otBirr[i]) +
              parseFloat(workingDays[i]) +
              parseFloat(item[i].__data.employee.ironIncentive) +
              parseFloat(item[i].__data.employee.salary) * 0.11 +
              parseFloat(item[i].__data.employee.responseAllow) +
              parseFloat(item[i].__data.employee.homeAllow) +
              parseFloat(item[i].__data.employee.transportPay)
            ).toFixed(2)
          }

          let netSalary = (
            parseFloat(grossSalary) - parseFloat(totalDeduction)
          ).toFixed(2)

          netSalary = parseFloat(netSalary) > 0 ? parseFloat(netSalary) : 0

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
            incentive: item[i].__data.employee.incentiveSalary,
            transportPay: item[i].__data.employee.transportPay,
            costSharing: (
              (parseFloat(item[i].__data.employee.costSharing) / 100) *
              parseFloat(item[i].__data.employee.salary)
            ).toFixed(2),

            otHr125: otHr125[i],
            otHr15: otHr15[i],
            otHr20: otHr20[i],
            otHr25: otHr25[i],
            otBirr: otBirr[i],
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
            sign: '',
            netSalary: netSalary,
          })
          if (tableValue.length == item.length) {
            cb(null, tableValue)
          }
        }
      }
      const getOvertime = async function (payrollId) {
        let f = {
          where: { payrollId: payrollId, month: month, year: year },
        }
        let ot = await OverTime.find(f)
        return Promise.resolve(ot)
      }
      const getAttendance = async function (empId) {
        let value = await Attendance.find({
          where: { month: month, year: year, employeeId: empId },
        })
        return Promise.resolve(value)
      }
    } catch (error) {
      throw new Error('Internal server error try again')
    }
  }

  PayrollMaster.remoteMethod('summarySheet', {
    description: 'Finance report',
    accepts: [
      {
        arg: 'date',
        type: 'string',
        required: true,
      },
    ],
    returns: {
      type: ['object'],
      root: true,
    },

    http: {
      verb: 'post',
      path: '/summarySheet',
    },
  })
}