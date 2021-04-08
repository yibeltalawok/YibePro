module.exports = function (Job) {

    // ================= Fetch Job in a specific date ======================
    var fetchJobsinaDay = async function (date) {

        var data = await Job.find({
            where: { date: { like: date } }, include: [
                {
                    relation: "ProductionHistory",
                    scope: {
                        include: "ScannedOrderStatus",
                    }
                },
                "operation",
                "LostTime"
            ]
        })
        return Promise.resolve(data);
    }

    Job.remoteMethod("fetchPerformance", {
        description: "Fech performance per a jopb",
        accepts: [
            {
                arg: "date",
                type: "String",
                required: true
            }
        ],
        returns: {
            type: [
                "object"
            ],
            root: true
        },
    })

    Job.fetchPerformance = (date, cb) => {
        
        fetchJobsinaDay(date).then(res => {
            performances  = []
            for( element of res) {
                // Calculate amount done for a specifi job
                var amountDone = 0;
                // console.log("=======================================")
                //     console.log(parseInt(element.__data.from.toString().split(":")[0]))
                //     console.log("=======================================")
                for(ph of element.__data.ProductionHistory){
                    var temp =ph.__data.ScannedOrderStatus.__data;
                    amountDone += parseInt(temp.to.toString()) -  parseInt(temp.from.toString()) + 1
                }

                var fromD = new Date(2011, 0, 1, parseInt(element.__data.from.toString().split(":")[0]), parseInt(element.__data.from.toString().split(":")[1]))
                var toD = new Date(2011, 0, 1, parseInt(element.__data.to.toString().split(":")[0]), parseInt(element.__data.to.toString().split(":")[1]))

                console.log("=======================================")
                console.log(element.__data.from.toString())
                console.log(fromD)
                console.log(element.__data.to.toString())
                console.log(toD)
                console.log(((toD - fromD) / 1000) / 60)
                console.log("=======================================")
                performances.push({
                    amountDone: amountDone, 
                    sam: element.__data.operation.__data.sam,
                    workingTime: ""
                })
            }
            cb(null, performances)
        })
    }
};