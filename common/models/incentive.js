'use strict';
module.exports = function (Incentive) {
    Incentive.calculateIncentive = (month, year, employeeId, performance, discipline, quality, cb) => {
        try {
            const { Performance } = Incentive.app.models
            const { IncentiveShare } = Incentive.app.models
            const { IncentiveSlabe } = Incentive.app.models
            const { Weightage } = Incentive.app.models
            const { CostSummary } = Incentive.app.models
            let f = { where: { month: month, year: year } }
            let perf = 0
            CostSummary.find(f, (err, cost) => {
                if (cost.length > 0) {
                    getIncentiveShare().then(result => {
                        if (result.length > 0) {
                            getWeightage().then(res => {
                                if (res.length > 0) {
                                    let filter = { where: { month: month, year: year, jobId: "5f77071ff9b7e30dd055e5ea" } }
                                    Performance.find({ filter }, (err, perfor) => {
                                        if (perfor.length > 0) {
                                            let count = 0
                                            let total = 0
                                            for (let i = 0; i < perfor.length; i++) {
                                                if (employeeId == perfor[i].employeeId) {
                                                    count += 1
                                                    total += perfor[i].value
                                                    if (i == perfor.length - 1) {
                                                        if (count == 0) {
                                                            cb(null, [{ type: "error", title: "Performance", message: "No Performance found to this employee!!" }])

                                                        }
                                                        else {
                                                            let ave = total / count
                                                            perf =
                                                                (((parseFloat(ave) / 100) *
                                                                    parseFloat(res[0].__data.performance)) /
                                                                    100 +
                                                                    ((parseFloat(discipline) / 100) *
                                                                        parseFloat(res[0].__data.discipline)) /
                                                                    100 +
                                                                    ((parseFloat(quality) / 100) *
                                                                        parseFloat(res[0].__data.quality)) /
                                                                    100) *
                                                                100;
                                                            getTheTaxSlab(cost[0].__data.costPerMinute, result, perf, res[0].__data)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            cb(null, [{ type: "error", title: "Performance", message: "No Performance found!!" }])
                                        }

                                    })

                                }
                                else {
                                    cb(null, [{ type: "error", title: "Incentive Weightage", message: "No Incentive Weightage, please create it? first!!" }])
                                }

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
            })
            const getIncentiveShare = async function () {
                let inShare = await IncentiveShare.find(f)
                return Promise.resolve(inShare)
            }
            const getWeightage = async function () {

                let weightage = await Weightage.find({})
                return Promise.resolve(weightage)
            }
            const getTheTaxSlab = async (costPerMinute, share, perf, weightage) => {
                let slabPercent = 1
                IncentiveSlabe.find({}, async (err, res) => {
                    if (res.length > 0) {
                        // for (let i = 0; i < res.length; i++) {
                        // if (
                        //     parseFloat(perf) >= parseFloat(res[i].__data.from) &&
                        //     parseFloat(perf) <= parseFloat(res[i].__data.to)
                        // ) {
                        //     slabPercent = parseFloat(res[i].__data.percent) / 100;
                        calcIncentive(costPerMinute, share, perf, res, weightage)

                        // }
                        // }
                    } else {

                        cb(null, [{ type: "error", title: "Incentive  Slab", message: "No Incentive Slab is found!!" },])
                        // calcIncentive(costPerMinute, share, perf, slabPercent)
                    }

                })
            }
            const calcIncentive = async function (costPerMinute, share, perf, slab, weightage) {
                let fi = {
                    where: {
                        month: month,
                        year: year,
                    }
                };
                Incentive.find(fi, (err, res) => {
                    if (res.length > 0) {
                        let lastVal = [{ type: "success" }, [month, year, costPerMinute], share, perf, slab, weightage, res]
                        cb(null, lastVal)

                    }
                    else {
                        cb(null, [{ type: "error", title: "Incentive", message: "No Incentive is found in this month please create it first!!" }])

                    }
                })
            }

        }

        catch {
            throw new Error("Internal server error try again");
        }

    }
    Incentive.remoteMethod("calculateIncentive", {
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
            arg: "employeeId",
            type: "string",
            required: true
        },
        {
            arg: "performance",
            type: "string",
            required: true
        },
        {
            arg: "discipline",
            type: "string",
            required: true
        },
        {
            arg: "quality",
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
            path: "/calculateIncentive"
        }
    });
};
