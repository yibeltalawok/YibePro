'use strict';

module.exports = function (CostPerSamHistory) {
    CostPerSamHistory.getCostPerSamDashboard = (
        year,
        cb
    ) => {
        try {
            const { OperationalCost } = CostPerSamHistory.app.models

            let filter = {
                where: {
                    year: year
                }
            }
            CostPerSamHistory.find(filter, (err, res) => {
                if (res.length > 0) {
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
                    let colors = []
                    let tempValue = []
                    let uniqueMonths = [...new Map(res.map(item => [item[key], item])).values()];
                    for (let i = 0; i < uniqueMonths.length; i++) {
                        tempValue.push({
                            id: uniqueMonths[i].__data.id,

                            month: uniqueMonths[i].__data.month,
                            costPerSam: uniqueMonths[i].__data.costPerSam
                        })

                        colors.push(getRandomColor() + 80)

                    }
                    // let tempValue = uniqueMonths.map(x => {

                    //     colors.push(getRandomColor() + 80)
                    //     return {

                    //     }
                    // })
                    tempValue.sort(function (a, b) {
                        var m1 = new Date(a.month),
                            m2 = new Date(b.month);
                        return m1 - m2;
                    });
                    let lbls = tempValue.map(x => mon[parseInt(x.month) - 1]);

                    let mcn = tempValue.map(x => x.costPerSam);
                    let lineChart = {
                        datasets: [
                            {
                                data: mcn,
                                backgroundColor: colors,
                                label: "Cost per SAM"
                            }
                        ],
                        labels: lbls
                    }
                    getOperationalCost(lineChart)
                } else {
                    getOperationalCost({
                        datasets: [
                            {
                                data: [],
                                backgroundColor: [],
                                label: "Cost per SAM"
                            }
                        ],
                        labels: []
                    })
                }
            })
            const getOperationalCost = function (lineChart) {
                OperationalCost.find({}, (err, res) => {
                    if (res.length > 0) {
                        let directCost = 0
                        let indirectCost = 0
                        let overHeadCost = 0
                        let piecolors = []

                        const key = "year";
                        let uniqueyear = [...new Map(res.map(item => [item[key], item])).values()];

                        for (let j = 0; j < res.length; j++) {
                            if (res[j].__data.year == year) {
                                if (res[j].__data.type == "Direct Cost") {
                                    directCost += parseFloat(res[j].__data.amount)
                                }
                                if (res[j].__data.type == "Indirect Cost") {
                                    indirectCost += parseFloat(res[j].__data.amount)
                                }
                                if (res[j].__data.type == "Over Head cost") {
                                    overHeadCost += parseFloat(res[j].__data.amount)
                                }
                            }
                        }
                        let totalCost = directCost + indirectCost + overHeadCost
                        let costType = [{
                            type: "Direct",
                            value: (directCost * 100 / totalCost).toFixed(2)
                        }, {
                            type: "Indirect",
                            value: (indirectCost * 100 / totalCost).toFixed(2)
                        }, {
                            type: "Over Head",
                            value: (overHeadCost * 100 / totalCost).toFixed(2)
                        }]
                        for (let k = 0; k < costType.length; k++) {
                            piecolors.push(getRandomColor() + 80)
                        }
                        let lbls = costType.map(x => x.type);

                        let mcn = costType.map(x => x.value);


                        let pieCahrt = {
                            datasets: [
                                {
                                    data: mcn,
                                    backgroundColor: piecolors,
                                    label: "Cost per minute"
                                }
                            ],
                            labels: lbls
                        }
                        let years = []
                        for (let l = 0; l < uniqueyear.length; l++) {
                            years.push(uniqueyear[l].__data.year)
                        }
                        cb(null, [lineChart, pieCahrt, years])
                    }
                    else {
                        cb(null, [lineChart])
                    }
                })
            }
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



    CostPerSamHistory.remoteMethod("getCostPerSamDashboard", {
        description: "getCostPerSamDashboard",
        accepts:
        {
            arg: "year",
            type: "string",
            required: true
        },
        returns: {
            type: "object",
            root: true
        },

        http: {
            verb: "post",
            path: "/getCostPerSamDashboard"
        }
    });
};
