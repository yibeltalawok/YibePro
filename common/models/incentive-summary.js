'use strict';

const incentive = require("./incentive");

module.exports = function (Incentivesummary) {

    Incentivesummary.returnIncentiveSummary = (month, year, line, cb) => {
        try {
            let filter = { where: { month: month, year: year, line: line }, include: { 'jobs': ['employee'] } }
            const { Performance } = Incentivesummary.app.models
            const { Employee } = Incentivesummary.app.models
            const { IncentiveShare } = Incentivesummary.app.models
            const { Incentive } = Incentivesummary.app.models
            const { IncentiveSlabe } = Incentivesummary.app.models
            const { Weightage } = Incentivesummary.app.models
            const { CostSummary } = Incentivesummary.app.models
            let employeeId = []
            let performance = []

            Performance.find(filter, (err, res) => {
                if (res.length > 0) {
                    for (let i = 0; i < res.length; i++) {
                        const indexp = employeeId.indexOf(res[i].__data.employeeId);
                        if (indexp == -1) {
                            employeeId.push(res[i].__data.employeeId);
                        }
                    }
                    for (let j = 0; j < employeeId.length; j++) {
                        let count = 0, totalPerformance = 0
                        for (let i = 0; i < res.length; i++) {
                            if (employeeId[j] == res[i].__data.employeeId) {
                                count += 1
                                totalPerformance = totalPerformance + parseFloat(res[i].__data.value)

                            }
                            if (i == res.length - 1) {
                                performance.push(totalPerformance / count)
                            }


                        }
                        if (employeeId.length == performance.length) {
                            getCostSummary().then(result => {
                                if (result.length > 0) {
                                    getIncentiveShare().then(share => {

                                        if (share.length > 0) {
                                            getWeightage().then(weightage => {
                                                getEmployees(employeeId, performance, weightage, share, result[0].__data.costPerMinute)
                                            }).catch(e => {
                                                console.log(e)
                                        })
                                        }
                                        else {
                                            cb(null, [{ type: "error", title: "Incentive share", message: "No Incentive share for this month please create it? first!!" }])


                                        }
                                    }).catch(e => {
                                        console.log(e)
                                })

                                }
                                else {

                                    cb(null, [{ type: "error", title: "Cost Summary", message: "No cost Summary is found in this month please create it first!!" }])
                                }
                            }).catch(e => {
                                console.log(e)
                        })

                        }
                    }
                }
                else {
                    cb(null, [{ type: "error", title: "No employee", message: "No Employee is found!!" }])
                }
            })

            const getWeightage = async () => {

                let weightage = await Weightage.find({})
                return Promise.resolve(weightage[0].__data)
            }
            const getEmployees = (employeeId, performance, weightage, share, costPerMinute) => {
                let summary = []
                for (let i = 0; i < employeeId.length; i++) {
                    let filter = { where: { id: employeeId[i] } }
                    Employee.find(filter, (err, res) => {
                        for (let j = 0; j < res.length; j++) {
                            let perf = weightage == null ? performance[i] : (parseFloat(performance[i]) / 100) * (parseFloat(weightage.performance) / 100)
                            let disc = weightage == null ? 0 : (parseFloat(res[j].__data.discipline) / 100) * (parseFloat(weightage.discipline) / 100)
                            let quality = weightage == null ? 0 : (parseFloat(res[j].__data.quality) / 100) * (parseFloat(weightage.quality) / 100)
                            summary.push({
                                id: employeeId[i],
                                fullName: res[j].__data.fullName,
                                idno: res[j].__data.idno,
                                performance: (perf * 100).toFixed(2),
                                discipline: (disc * 100).toFixed(2),
                                quality: (quality * 100).toFixed(2),
                                cummulative: ((perf + disc + quality) * 100).toFixed(2)
                            })
                            if (summary.length == employeeId.length) {
                                getIncentive(summary, performance, share, costPerMinute)
                            }
                        }
                    })

                }

            }
            const getIncentiveShare = async function () {
                let f = { where: { month: month, year: year } }
                let inShare = await IncentiveShare.find(f)
                return Promise.resolve(inShare)
            }
            const getCostSummary = async function () {
                let f = { where: { month: month, year: year } }
                let summary = await CostSummary.find(f)
                return Promise.resolve(summary)
            }
            const getIncentive = async function (summary, performance, share, costPerMinute) {
                let filter = { where: { month: month, year: year, lineNo: line } }
                Incentive.find(filter, (err, res) => {
                    let indexs = []
                    let incentive = []
                    if (res.length > 0) {
                        for (let j = 0; j < res.length; j++) {
                            for (let a = 0; a < summary.length; a++) {
                                for (let i = 0; i < res[j].__data.employeeId.length; i++) {
                                    if (res[j].__data.employeeId[i] == summary[a].id) {
                                        const index = indexs.indexOf(j);
                                        if (index == -1) {
                                            indexs.push(j);
                                        }
                                        break
                                    }
                                }
                            }
                        }
                        for (let b = 0; b < indexs.length; b++) {
                            incentive.push(res[indexs[b]].__data)
                            if (b == indexs.length - 1) {
                                calculateIncentive(incentive, summary, performance, share, costPerMinute)
                            }
                        }
                    }
                    else {
                        cb(null, [{ type: "error", title: "No Incentive", message: "No Incentive is found!!" }])
                    }

                })
            }
            const calculateIncentive = (incentiveItem, summary, performance, share, costPerMinute) => {
                IncentiveSlabe.find({}, (err, res) => {
                    if (res.length > 0) {
                        let performanceTemp = []
                        performanceTemp.push(summary, incentiveItem, performance, share, [costPerMinute], res)
                        cb(null, performanceTemp)

                    }
                    else {
                        cb(null, [{ type: "error", title: "Incentive  Slab", message: "No Incentive Slab is found!!" },])

                    }
                })
            }
        } catch (error) {

        }
    }
    Incentivesummary.remoteMethod("returnIncentiveSummary", {
        description: "Calculate Incentive",
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
        {
            arg: "line",
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
            path: "/returnIncentiveSummary"
        }
    });
};
