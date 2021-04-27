'use strict';

module.exports = function (Performance) {
    Performance.calculatePerformance = (cb) => {
        try {
            const { Job } = Performance.app.models
            const { LostTime } = Performance.app.models
            let date = new Date().toISOString().substring(0, 10)
            let jobFilter = {
                include: ["employee", "operation"],
                where: {
                    date: {
                        like: date
                    }
                }
            };

            Job.find(jobFilter, async function (err, res) {

                let perf = []
                for (let i = 0; i < res.length; i++) {
                    let sTime = res[i].__data.from.split(":");
                    let eTime = res[i].__data.to.split(":");
                    let startHr = parseInt(sTime[0]);
                    let startMin = parseInt(sTime[1]);
                    let endHr = parseInt(eTime[0]);
                    let endMin = parseInt(eTime[1]);
                    let min, hr;
                    hr = endHr >= startHr ? endHr - startHr : 12 - startHr + endHr;
                    if (startMin < endMin) {
                        min = endMin - startMin;
                    } else {
                        min = 60 - startMin + endMin;
                        hr--;
                    }
                    hr = hr < 0 ? 11 : hr;
                    let totalMinute = hr * 60 + min;

                    lostTime(res[i].__data.id).then(losted => {
                        let performance =
                            (parseFloat(res[i].__data.amountDone) *
                                parseFloat(res[i].__data.operation.sam) *
                                100) /
                            (parseFloat(totalMinute) - parseFloat(losted));

                        let efficency = (parseFloat(res[i].__data.amountDone) *
                            parseFloat(res[i].__data.operation.sam) *
                            100) /
                            parseFloat(totalMinute)

                        perf.push({
                            from: res[i].__data.from,
                            to: res[i].__data.to,
                            operatorId: res[i].__data.employeeId,
                            operatorName: res[i].__data.employee.fullName,
                            line: res[i].__data.line,
                            operationName: res[i].__data.operation.operationName,
                            done: res[i].__data.amountDone,
                            lostTime: losted,
                            totalMinute: totalMinute,
                            efficency: Math.floor(efficency * 100) / 100,
                            value: Math.floor(performance * 100) / 100,
                            id: res[i].__data.id
                        });
                        if (perf.length == res.length)
                            cb(null, perf)
                    }).catch(err => { console.log(err) })
                }



            })
            const lostTime = async function (jobId) {
                let totalMinute = 0
                let lost = await LostTime.find({ where: { jobsId: jobId } })
                for (let i = 0; i < lost.length; i++) {
                    totalMinute = totalMinute + lost[i].__data.totalmins

                }
                return Promise.resolve(totalMinute)
            }


        }
        // }
        catch {
            throw new Error("Internal server error try again");
        }
    }
    Performance.remoteMethod("calculatePerformance", {
        description: "Parformance calculation",
        accepts: [],

        returns: {
            type: ["object"],
            root: true
        },

        http: {
            verb: "post",
            path: "/calculatePerformance"
        }
    });
    Performance.createSummary = (month, year, cb) => {
        try {

            const { Employee } = Performance.app.models

            let filter = {
                include: { 'jobs': ['employee'] },
                where: {
                    month: month,
                    year: year,
                }
            };
            Performance.find(filter, (err, res) => {
                if (res.length > 0) {
                    let emp = []
                    let average = []
                    let employees = []
                    for (let i = 0; i < res.length; i++) {
                        if (res[i].__data.jobs.employeeId) {
                            const indexp = emp.indexOf(res[i].__data.jobs.employeeId);
                            if (indexp == -1) {
                                emp.push(res[i].__data.jobs.employeeId);
                            }
                        }
                    }
                    for (let i = 0; i < emp.length; i++) {
                        let temp = 0, count = 0
                        for (let j = 0; j < res.length; j++) {
                            if (emp[i] == res[j].__data.jobs.employeeId) {
                                count += 1

                                temp += parseFloat(res[j].__data.value)
                            }

                        }
                        average.push(temp / count)

                    }
                    for (let i = 0; i < emp.length; i++) {
                        getEmployee(emp[i]).then(employee => {

                            employees.push({
                                idno: employee.idno,
                                fullName: employee.fullName,
                                department: employee.department,
                                subDept: employee.subDept,
                                avePerformance: average[i]
                            })

                            // console.log(employees)
                            if (employees.length == emp.length) {

                                cb(null, employees)
                            }
                        }).catch(e => {
                            console.log(e)
                        })

                    }
                }
                else {
                    cb(null, [])
                }
                // cb(null, manageUI(average, emp))

            })
            const manageUI = async function (average, empId) {
                let employees = []
                for (let i = 0; i < empId.length; i++) {
                    getEmployee(empId[i]).then(employee => {
                        employees.push({
                            fullName: employee.fullName,
                            department: employee.department,
                            subDept: employee.subDept,
                            avePerformance: average[i]
                        })
                        if (i == empId.length) {
                            return employees
                        }
                    }).catch(e => {
                        console.log(e)
                    })

                }

            }
            const getEmployee = async function (employeeId) {
                let filter = {
                    where: { id: employeeId }
                }
                let emp = await Employee.find(filter);
                // console.log(emp[0].__data)
                return Promise.resolve(emp[0].__data)
            }
        }

        catch {
            throw new Error("Internal server error try again");
        }
    }
    Performance.remoteMethod("createSummary", {
        description: "Parformance Summary",
        accepts: [{
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
            path: "/createSummary"
        }
    });


    Performance.yearlyPerformance = (year, cb) => {
        year = year + "-01-01";

        var filter = { include: ['Employee'], order: 'date ASC', where: { date: { gte: year } } };
        Performance.find(filter).then(res => {
            var data = [];
            for (let i = 0; i < res.length; i++) {
                var date = res[i].date;
                var average = res[i].average;
                var id = res[i].id;
                var topValue = res[i].topValue;
                var fullName = res[i].__data.Employee.fullName;
                var department = res[i].__data.Employee.department;
                var gender = res[i].__data.Employee.gender;
                var phoneNumber = res[i].__data.Employee.phoneNumber

                data.push({ date, average, id, topValue, fullName, department, gender, phoneNumber });
            }

            cb(null, data);
        });
    }


    Performance.remoteMethod("yearlyPerformance", {
        description: "Yearly performance",

        accepts: { type: "string", arg: "year", required: true },
        returns: { type: "object", root: true },

        http: { verb: 'get', path: "/yearlyPerformance" }
    });
};
