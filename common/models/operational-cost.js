'use strict';

module.exports = function (OperationalCost) {

    OperationalCost.getCostDashboard = (
        date, cb
    ) => {
        try {
            let year = new Date(date).getFullYear()

            let filter = {
                where: {
                    year: year
                }
            }
            OperationalCost.find(filter, (err, res) => {
                if (res.length > 0) {
                    let directCost = 0
                    let indirectCost = 0
                    let overHeadCost = 0
                    for (let j = 0; j < res.length; j++) {
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

                    let plbls = costType.map(x => x.type);

                    let pmcn = costType.map(x => x.value);


                    let pieCahrt =
                    {
                        type: "pie",
                        data: {
                            labels: plbls,
                            datasets: [
                                {
                                    label: "Lost time",
                                    data: pmcn,
                                    fill: false,
                                    backgroundColor: [
                                        "#00ff40",
                                        "#00ffff",
                                        "#ff0000",
                                        "#ffbf00",
                                        "#00bfff",
                                        "#0040ff",
                                        "#8000ff",
                                        "#ff00ff"
                                    ],
                                    borderColor: 'rgba(153, 102, 255, 1)',
                                    borderWidth: 1
                                }
                            ]
                        }
                    }
                    cb(null, pieCahrt)
                } else {
                    cb(null, [])
                }
            })
        } catch (error) {
            throw (error)
        }
    }



    OperationalCost.remoteMethod("getCostDashboard", {
        description: "getCostDashboard",
        accepts: [
            {
                arg: "date",
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
            path: "/getCostDashboard"
        }
    });


    OperationalCost.deleteAll = (cb) => {
        try {
            OperationalCost.find({}, (err, res) => {
                cb(null, res)
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }
    OperationalCost.remoteMethod("deleteAll", {
        description: "Delete all opperational cost",

        returns: {
            type: "object",
            root: true
        },

        http: {
            verb: "delete",
            path: "/deleteAll"

        }
    })

    var fetchOpCost = async function(fromdate, todate){
       var data = await OperationalCost.find(
            {
            where: {and:[{date:{gte: fromdate}}, {date: {lte: todate}}]}
        })

        return Promise.resolve(data)
    }

    OperationalCost.getOperationCostSummary = (fromdate, todate, cb) => {
        try {
            
            fetchOpCost(fromdate, todate).then(res => {
                // cb(null, res)
                var idcost = 0.0;
                var dcost = 0.0;
                if(res.length > 0){
                    for(var opcost of res){
                        if(opcost.__data.type == 'Indirect Cost'){
                            idcost += parseFloat(opcost.__data.amount)
                        }
                        else {
                            dcost += parseFloat(opcost.__data.amount)
                        }
                    }
                    cb(null, {
                        directCost: dcost,
                        indirectCost: idcost,
                        totalCost: dcost + idcost
                    })
                } else {
                    cb(null, {
                        directCost: 0,
                        indirectCost: 0,
                        totalCost: 0
                    })
                }
            })

        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }

    OperationalCost.remoteMethod("getOperationCostSummary", {
        description: "Get operational cost per date range",

        returns: {
            type: ["object"],
            root: true
        },

        accepts: [
            {
                arg: "fromdate",
                type: "string",
                required: true
            },
            {
                arg: "todate",
                type: "string",
                required: true
            },
        ],

        http: {
            verb: "post",
            path: "/getOperationCostSummary"

        }
    })


};
