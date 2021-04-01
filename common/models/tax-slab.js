'use strict';

module.exports = function (TaxSlab) {

    TaxSlab.payrollInfo = function (date, payrollId, cb) {
        try {
            const { PayrollMaster, WorkDay, Attendance, OverTime } = TaxSlab.app.models

            let filter = { include: ['employee'], where: { id: payrollId } }
            let d = new Date(date)
            let month = d.getMonth() + 1
            let year = d.getFullYear()
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
            TaxSlab.find({}, (err, slab) => {
                if (slab.length > 0) {
                    WorkDay.find({ where: { month: d.getMonth() + 1 } }, (err, res) => {
                        let totalDays = res.length > 0 ? res[0].__data.noDays : 30
                        PayrollMaster.find(filter, (err, res) => {
                            let items = []
                            let temp = res[0].__data

                            items.push({
                                date: temp.date,
                                idno: temp.employee.idno,
                                fullName: temp.employee.fullName,
                                gender: temp.employee.gender,
                                joiningDate: temp.employee.joiningDate,
                                department: temp.employee.department,
                                subDept: temp.employee.subDept,
                                salary: temp.employee.salary,
                                salaryPerWorkDay: "0",
                                grossSalary: "0",
                                attBonus: "0",
                                dailyRate: (parseFloat(temp.employee.salary) / parseFloat(totalDays)).toFixed(2),
                                perHrRate: (parseFloat(temp.employee.salary) / 192).toFixed(2),
                                transportPay: temp.employee.transportPay,
                                labourUnion: (parseFloat(temp.employee.salary) * 0.01).toFixed(2),
                                ironIncentive: temp.employee.ironIncentive,
                                pensionDeduction: (parseFloat(temp.employee.salary) * 0.07).toFixed(2),
                                pensionContribution: (parseFloat(temp.employee.salary) * 0.11).toFixed(2),
                                costSharing: temp.employee.costSharing,
                                responseAllow: temp.employee.responseAllow,
                                homeAllow: temp.employee.homeAllow,
                                incentiveSalary: temp.employee.incentiveSalary,
                                taxIncome: "0",
                                incomeTaxDeduction: "0",
                                absentIncentive: temp.employee.absentIncentive,
                                totaWorkDay: totalDays,
                                employeeId: temp.employee.id,
                                attendance: [],
                                workingDays: "0",
                                otHr: [],
                                otDay: "0",
                                otBirr: [],
                                otTotalBirr: "0",
                                remainingAl: temp.remainingAl,
                                miscPayment: temp.miscPayment,
                                miscBirr: "0",
                                taxDeduction: "0",
                                totalDeduction: "0",
                                netPayment: "0",
                                payback: temp.payback,
                                netSalary: "0",
                                id: temp.id,
                                employeeId: temp.employeeId
                            })
                            getAttendance(temp.employee.id).then((result) => {
                                let attendance = []
                                let atDate = new Date()
                                atDate.setMonth(parseInt(month) - 1)
                                for (let i = 1; i <= days; i++) {
                                    atDate.setDate(i)
                                    attendance.push({
                                        value: atDate.getDay() == "0" ? "P" : "A",
                                        slValue: '1',
                                        lateMinutes: '0'
                                    })

                                }
                                // cb(null, attendance[0].value)
                                if (result.length > 0) {
                                    for (let j = 0; j < result.length; j++) {
                                        let d = new Date(result[j].dateAttended);

                                        if (d.getDate() <= days) {
                                            attendance[d.getDate() - 1].value = result[j].__data.value;
                                            attendance[d.getDate() - 1].slValue = result[j].__data.slValue
                                            attendance[d.getDate() - 1].lateMinutes = result[j].__data.lateMinutes
                                        }

                                    }
                                }
                                calculateAttendance(attendance, items, slab)
                                // cb(null, attendance)
                            }).catch(e => {
                                console.log(e)
                        })
                        })
                    })
                }
                else {
                    cb(null, [{ type: 'error', message: "Please Register Tax Slab first" }])
                }
            })
            const calculateAttendance = function (attendance, items, slab) {
                let totalP = 0
                let totalA = 0
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
                let workingDays = 0
                for (let i = 0; i < attendance.length; i++) {
                    if (attendance[i].value == "P") {
                        totalP += 1
                        workingDays += 1;

                    }
                    if (attendance[i].value == "A") {
                        totalA += 1
                    }
                    if (attendance[i].value == "Pr") {
                        totalPr += 1
                        workingDays += 1;

                    }
                    if (attendance[i].value == "AL") {
                        totalAL += 1
                        workingDays += 1;

                    }
                    if (attendance[i].value == "MOL") {
                        totalDL += 1
                        workingDays += 1;

                    }
                    if (attendance[i].value == "HLPR") {
                        totalHLPr += 1
                        workingDays += 1;

                    }
                    if (attendance[i].value == "HLA") {
                        totalHLA += 1
                        workingDays += 0.5;

                    }
                    if (attendance[i].value == "MGL") {
                        totalMGL += 1
                        workingDays += 1;

                    }
                    if (attendance[i].value == "ML") {
                        totalML += 1
                        workingDays += 1;

                    }
                    if (attendance[i].value == "PL") {
                        totalPL += 1
                        workingDays += 1;

                    }
                    if (attendance[i].value == "SL") {
                        totalSL += 1
                        workingDays += parseFloat(attendance[i].slValue);

                    }
                    if (attendance[i].value == "LeM") {
                        totalLate += 1
                        workingDays +=
                            1 - (parseFloat(attendance[i].lateMinutes) / 480).toFixed(2);

                    }
                    if (attendance[i].value == "FL") {
                        totalFL += 1
                        workingDays += 1;

                    }
                    if (attendance[i].value == "Special L") {
                        totalSpecialL = 1

                    }
                }
                items[0].attendance = [{
                    totalP: totalP, totalA: totalA, totalPr: totalPr,
                    totalDL: totalDL, totalML: totalML, totalPL: totalPL,
                    totalAL: totalAL, totalMGL: totalMGL,
                    totalHLA: totalHLA, totalHLPr: totalHLPr, totalSL: totalSL,
                    totalSpecialL: totalSpecialL,
                    totalLate: totalLate, totalFL: totalFL,
                    workingDays: workingDays
                }]

                items[0].workingDays = workingDays
                let otHr125 = 0
                let otHr15 = 0
                let otHr20 = 0
                let otHr25 = 0
                let otDays = 0
                getOvertime(payrollId).then((time) => {
                    if (time.length > 0) {
                        // console.log(time[0].__data.type)
                        for (let j = 0; j < time.length; j++) {
                            // console.log(time[j].__data.type)
                            if (time[j].__data.type == "Normal Day") {
                                otHr125 += parseFloat(time[j].__data.value);
                            }
                            else if (time[j].__data.type == "Night time") {
                                otHr15 += parseFloat(time[j].__data.value)
                            }
                            else if (time[j].__data.type == "Rest Day") {
                                otHr20 += parseFloat(time[j].__data.value);
                            }
                            else if (time[j].__data.type == "Public Holly Day") {
                                otHr25 += parseFloat(time[j].__data.value);
                            }
                            if (time.length - 1 == j) {
                                otDays = (parseFloat(otHr125) + parseFloat(otHr15) + parseFloat(otHr20) + parseFloat(otHr25)) / 8

                            }
                        }
                    }
                    items[0].otHr = [{
                        otHr125: otHr125, otHr15: otHr15,
                        otHr20: otHr20, otHr25: otHr25,
                    }]
                    items[0].otDay = otDays
                    items[0].otBirr = [{
                        otHr125: parseFloat(otHr125) * parseFloat(items[0].perHrRate) * 1.25,
                        otHr15: parseFloat(otHr15) * parseFloat(items[0].perHrRate) * 1.5,
                        otHr20: parseFloat(otHr20) * parseFloat(items[0].perHrRate) * 2,
                        otHr25: parseFloat(otHr25) * parseFloat(items[0].perHrRate) * 2.5,
                        total: ((parseFloat(otHr125) * 1.25 + parseFloat(otHr15) * 1.5 + parseFloat(otHr20) * 2 +
                            parseFloat(otHr25) * 2.5) * parseFloat(items[0].perHrRate)).toFixed(2)
                    }]
                    items[0].otTotalBirr = (parseFloat(otHr125) * 1.25 + parseFloat(otHr15) * 1.5 + parseFloat(otHr20) * 2 +
                        parseFloat(otHr25) * 2.5) * parseFloat(items[0].perHrRate)
                    if (items[0].absentIncentive == "Yes") {
                        items[0].attBonus = days == parseFloat(items[0].workingDays) ? 75 : 0;
                    }
                    manageData(items, slab)
                }).catch(e => {
                    console.log(e)
            })
            }
            const manageData = function (items, slab) {

                items[0].salaryPerWorkDay = (parseFloat(items[0].salary) * parseFloat(items[0].workingDays) / parseInt(items[0].totaWorkDay)).toFixed(2)


                items[0].grossSalary = (parseFloat(items[0].salaryPerWorkDay) +
                    parseFloat(items[0].otTotalBirr) +
                    parseFloat(items[0].attBonus) +
                    parseFloat(items[0].ironIncentive) +
                    parseFloat(items[0].salary) * 0.11 +
                    parseFloat(items[0].responseAllow) +
                    parseFloat(items[0].homeAllow) +
                    parseFloat(items[0].transportPay)).toFixed(2);
                let repAllow = parseFloat(items[0].responseAllow) > 500 ? parseFloat(items[0].responseAllow) - 500 : 0
                let homAllow = parseFloat(items[0].homeAllow) - 0.1 * parseFloat(items[0].salaryPerWorkDay) > 0 ?
                    parseFloat(items[0].homeAllow) -
                    0.1 * parseFloat(items[0].salaryPerWorkDay) : 0
                items[0].taxIncome =
                    parseFloat(items[0].salaryPerWorkDay) +
                    parseFloat(items[0].ironIncentive) +
                    parseFloat(items[0].otTotalBirr) +
                    parseFloat(items[0].attBonus) +
                    parseFloat(items[0].incentiveSalary) +
                    parseFloat(items[0].payback) +
                    parseFloat(repAllow);
                if (items[0].department != "GM") {
                    items[0].taxIncome = parseFloat(items[0].taxIncome) + parseFloat(homAllow)
                }
                items[0].taxIncome = parseFloat(items[0].taxIncome).toFixed(2)

                items[0].incomeTaxDeduction = getTax(slab, items[0].taxIncome)
                items[0].totalDeduction = (
                    parseFloat(items[0].salary) * 0.07 +
                    parseFloat(items[0].salary) * 0.11 +
                    (parseFloat(items[0].costSharing) * items[0].salaryPerWorkDay) /
                    100 +
                    parseFloat(items[0].incomeTaxDeduction) +
                    parseFloat(items[0].salaryPerWorkDay) * 0.01
                ).toFixed(2);
                items[0].miscBirr = (
                    parseFloat(items[0].dailyRate) * parseFloat(items[0].miscPayment)
                ).toFixed(2);
                items[0].taxDeduction = getTax(slab, items[0].miscBirr)
                items[0].netPayment = (parseFloat(items[0].miscBirr) - parseFloat(items[0].taxDeduction)).toFixed(2);

                items[0].netSalary = (items[0].grossSalary - items[0].totalDeduction).toFixed(2);
                cb(null, [{ type: "success", item: items[0] }])
            }
            const getTax = function (slab, payment) {
                for (let i = 0; i < slab.length - 1; i++) {
                    if (
                        parseFloat(payment) >= parseFloat(slab[i].__data.initial) &&
                        parseFloat(payment) <= parseFloat(slab[i].__data.end)
                    ) {
                        let tax = (
                            (parseFloat(slab[i].__data.deduction) * parseFloat(payment)) / 100 -
                            parseFloat(slab[i].__data.extraDeduction)
                        );
                        return tax.toFixed(2);
                    }
                }
                let lastSlab = slab.length - 1;

                if (parseFloat(payment) >= parseFloat(slab[lastSlab].__data.initial)) {
                    let tax = (
                        (parseFloat(slab[lastSlab].deduction) * parseFloat(payment)) / 100 -
                        parseFloat(slab[lastSlab].extraDeduction)
                    );
                    return tax.toFixed(2);
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

    TaxSlab.remoteMethod("payrollInfo", {
        description: "Payroll info",
        accepts: [
            {
                arg: "date",
                type: "string",
                required: true
            },
            {
                arg: "payrollId",
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
            path: "/payrollInfo"
        }
    });
};
