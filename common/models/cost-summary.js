'use strict';
module.exports = function (CostSummary) {
    CostSummary.getCostPerMinuteDashboard = (
        year,
        cb
    ) => {
        try {
            const { OperationalCost } = CostSummary.app.models

            let filter = {
                where: {
                    year: year
                }
            }
            CostSummary.find(filter, (err, res) => {
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
                    let uniqueMonths = [...new Map(res.map(item => [item[key], item])).values()];
                    let tempValue = uniqueMonths.map(x => {

                        colors.push(getRandomColor() + 80)
                        return {
                            id: x.id,
                            month: x.month,
                            monthPerMinute: x.costPerMinute

                        }
                    })
                    tempValue.sort(function (a, b) {
                        var m1 = new Date(a.month),
                            m2 = new Date(b.month);
                        return m1 - m2;
                    });
                    let lbls = tempValue.map(x => mon[parseInt(x.month) - 1]);

                    let mcn = tempValue.map(x => x.monthPerMinute);
                    let lineChart = {
                        datasets: [
                            {
                                data: mcn,
                                backgroundColor: colors,
                                label: "Cost per minute"
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
                                label: "Cost per minute"
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



    CostSummary.remoteMethod("getCostPerMinuteDashboard", {
        description: "getCostPerMinuteDashboard",
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
            path: "/getCostPerMinuteDashboard"
        }
    });
    CostSummary.calculateCostPerSAM = (month, year, cb) => {
        try {
            const { Orderstatus } = CostSummary.app.models
            const { OperationBulletin } = CostSummary.app.models
            const { Operation } = CostSummary.app.models
            let f = { include: ['order'], where: { month: month, year: year } }
            Orderstatus.find(f, (err, res) => {
                let style = []
                let orderId = [], production = []
                if (res.length == 0) {
                    cb(null, [])
                }
                for (let i = 0; i < res.length; i++) {
                    const index = style.indexOf(res[i].__data.order.styleName);
                    if (index == -1) {
                        style.push(res[i].__data.order.styleName);
                        orderId.push(res[i].__data.orderId);
                    }
                }
                for (let i = 0; i < res.length; i++) {
                    for (let index = 0; index < style.length; index++) {
                        if (orderId[index] == res[i].__data.orderId) {
                            if (production[index] == null) {
                                production[index] = res[i].__data.packedOut;
                            } else {
                                production[index] =
                                    parseFloat(production[index]) +
                                    parseFloat(res[i].__data.packedOut);
                            }
                        }

                    }
                    if (i == res.length - 1) {
                        calculateSam(style, production, orderId)
                    }

                }

            })
            const calculateSam = async (style, production, orderId,) => {
                let samValue = []
                for (let index = 0; index < style.length; index++) {
                    let filter = {
                        where: { orderId: orderId[index] }
                    };
                    let total = 0
                    OperationBulletin.find(filter, async function (err, res) {
                        if (res.length > 0) {
                            operationLists(res[0].__data.id).
                                then(sam => {
                                    for (let i = 0; i < sam.length; i++) {
                                        total += parseFloat(sam[i].__data.sam)
                                        if (i == sam.length - 1) {
                                            samValue[index] = total.toFixed(2)
                                            if (index == style.length - 1) {
                                                getSummary(style, production, samValue)
                                            }
                                        }
                                    }
                                }).catch(e => {
                                    console.log(e)
                            })
                        }
                    })


                }
            }
            const operationLists = async function (oprId) {
                let opr = await Operation.find({ where: { oprBltnId: oprId } })
                return Promise.resolve(opr)
            }
            const getSummary = async function (style, production, samValue) {
                let fc = { where: { month: month, year: year } }
                let totalCost = 0

                CostSummary.find(fc, async (err, res) => {
                    let costPerSam = []
                    for (let i = 0; i < res.length; i++) {
                        totalCost =
                            parseFloat(res[i].__data.directCost) + parseFloat(res[i].__data.indirectCost);
                    }
                    for (let index = 0; index < style.length; index++) {
                        costPerSam.push({
                            id: index,
                            style: style[index],
                            production: production[index],
                            sam: parseFloat(samValue[index]).toFixed(2),
                            producedSam: (
                                parseFloat(production[index]) * parseFloat(samValue[index])
                            ).toFixed(2),
                            costPerSam: (totalCost /
                                (parseFloat(production[index]) * parseFloat(samValue[index]))
                            ).toFixed(2),
                            totalCost: totalCost
                        });
                        if (index == style.length - 1) {
                            cb(null, costPerSam)
                        }

                    }

                })


            }

        }

        catch {
            throw new Error("Internal server error try again");
        }
    }
    CostSummary.remoteMethod("calculateCostPerSAM", {
        description: "Cost per SAM",
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
            path: "/calculateCostPerSAM"
        }
    });
};
