'use strict';

module.exports = function (CostPerSamHistory) {

    
    CostPerSamHistory.getCostPerSamDashboard = (
        year,
        cb
    ) => {
        try {


            
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

    var fetchBundleHistoryDoneInAMonth = async function(date) {
        var filter = {
            where: {
                date: {
                    like: date
                },
                newStatus: 'so',
            },
            include: [{
                relation: "ScannedOrderStatus",
                scope: {
                    include: {
                        relation: "Order",
                        scope: {
                            include: "operationBulletins"
                        }
                    }
                }
            }]
        }

        var { BundleHistory } = CostPerSamHistory.app.models;
        var data = BundleHistory.find(filter);
        return Promise.resolve(data)
    }

    // var fetchOpTotalMins = async function(opid, dt){
    //     var {OperationBulletin} = CostPerSamHistory.app.models;
    //     // console.log(opid + " " + dt)
    //      var data = await OperationBulletin.totalMinutesProduced(opid.toString(),dt.toString())
    //     return Promise.resolve(data)
    // }


    CostPerSamHistory.getCostPerSamWithDateRange = (
        year,
        month,
        cb
    ) => {
        try {
            var opbulletins = []
            fetchBundleHistoryDoneInAMonth(year+"-"+month).then(res => { 

                // console.log(res[0].__data.ScannedOrderStatus.__data.Order.__data.operationBulletins)
                for(var element of res){
                    var opid = element.__data.ScannedOrderStatus.__data.Order.__data.operationBulletins.__data.id.toString()
                    var idx = opbulletins.indexOf(opid)
                    if(idx == -1) opbulletins.push(opid)
                }

                cb(null, opbulletins)

                // fetchOpTotalMins(opbulletins[0], year+"-"+month).then( res => {
                //     console.log(res)
                // })
                
            })
            
        } catch (error) {
            throw (error)
        }
    }



    CostPerSamHistory.remoteMethod("getCostPerSamWithDateRange", {
        description: "get CostPerSam with in Date Range",
        accepts:[
            {
                arg: "year",
                type: "string",
                required: true
            },
            {
                arg: "month",
                type: "string",
                required: true
            }
        ]
        ,
        returns: {
            type: "object",
            root: true
        },

        http: {
            verb: "post",
            path: "/getCostPerSamWithDateRange"
        }
    });


};
