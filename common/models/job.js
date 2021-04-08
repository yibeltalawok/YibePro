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
                "LostTime",
                "employee"
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
                var lostTime = 0;
                // console.log("=======================================")
                //     console.log(parseInt(element.__data.from.toString().split(":")[0]))
                //     console.log("=======================================")
                for(lt of element.__data.LostTime){
                    lostTime += lt.__data.totalmins
                }
                
                for(ph of element.__data.ProductionHistory){
                    var temp =ph.__data.ScannedOrderStatus.__data;
                    amountDone += parseInt(temp.to.toString()) -  parseInt(temp.from.toString()) + 1
                }

                var fromD = new Date(2011, 0, 1, parseInt(element.__data.from.toString().split(":")[0]), parseInt(element.__data.from.toString().split(":")[1]))
                var toD = new Date(2011, 0, 1, parseInt(element.__data.to.toString().split(":")[0]), parseInt(element.__data.to.toString().split(":")[1]))
                var workTime = ((toD - fromD) / 1000) / 60;
                var sam = parseInt(element.__data.operation.__data.sam.toString())
                
                var pf =  ((amountDone * sam) / (workTime - lostTime)) * 100
                performances.push({
                    amountDone: amountDone, 
                    sam: sam,
                    workingTime: workTime,
                    lotTime: lostTime,
                    performance: parseFloat(pf.toFixed(2)),
                    operationName: element.__data.operation.__data.operationName,
                    employeeName: element.__data.employee.__data.fullName,
                    employeeid: element.__data.employee.__data.id,
                    employeeGender: element.__data.employee.__data.gender,
                    employeeProfilePicture: element.__data.employee.__data.profilePicture,
                })
            }
            cb(null, performances)
        })
    }
};