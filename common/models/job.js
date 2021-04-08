module.exports = function (Job) {

    // ================= Fetch Job in a specific date ======================
    var fetchJobsinaDay = async function (date) {

        var data = await Job.find({
            where: { date: { like: date } },
            include: [
              {
                ProductionHistory : ["ScannedOrderStatus"]
              },
              "operation"
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
               
                var amountDone = 0;
                var lostTime = 0;
                // Calculate losttime for a specifi job
                for(lt of element.__data.LostTime){
                    lostTime += lt.__data.totalmins
                }

                 // Calculate amount done for a specifi job
                for(ph of element.__data.ProductionHistory){
                    var temp =ph.__data.ScannedOrderStatus.__data;
                    amountDone += parseInt(temp.to.toString()) -  parseInt(temp.from.toString()) + 1
                }

                 // Calculate Working time for a specifi job
                var fromD = new Date(2011, 0, 1, parseInt(element.__data.from.toString().split(":")[0]), parseInt(element.__data.from.toString().split(":")[1]))
                var toD = new Date(2011, 0, 1, parseInt(element.__data.to.toString().split(":")[0]), parseInt(element.__data.to.toString().split(":")[1]))
                var workTime = ((toD - fromD) / 1000) / 60;

                 // Calculate Sam for a specifi job
                var sam = parseInt(element.__data.operation.__data.sam.toString())
                
                 // Calculate Performance for a specifi job
                var pf =  ((amountDone * sam) / (workTime - lostTime)) * 100

                 // Pushing to the main list
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
            cb(null, performances) // Final callback
        })
    }

    Job.remoteMethod("lineEfficency", {
        description: "Line efficency",
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
        }
    })
  
    Job.lineEfficency = (date, cb) => {
        
        fetchJobsinaDay(date).then(res => {
            start = []
            final  = []
            for( element of res) {
              var line = element.__data.line;
              var amountDone = 0;
              console.log(element.__data.operation);
  
                // Calculate amount done for a specific job
              for(ph of element.__data.ProductionHistory){
                  var temp = ph.__data;
                  
                  amountDone += parseInt(temp.to.toString()) -  parseInt(temp.from.toString()) + 1
              }
  
                // Calculate Working time for a specific job
              var fromD = new Date(2011, 0, 1, parseInt(element.__data.from.toString().split(":")[0]), parseInt(element.__data.from.toString().split(":")[1]))
              var toD = new Date(2011, 0, 1, parseInt(element.__data.to.toString().split(":")[0]), parseInt(element.__data.to.toString().split(":")[1]))
              var workTime = ((toD - fromD) / 1000) / 60;
  
                // Calculate Sam for a specific job
              var sam = parseInt(element.__data.operation.__data.sam.toString())
              
                // Calculate Performance for a specific job
              //var ef =  ((amountDone * sam) / (workTime - lostTime)) * 100
              var idx = start.indexOf(line);
              if (idx == -1) {
                // Pushing to the main list
                final.push({
                    line,
                    date,
                    totalad: amountDone, 
                    totalsam: sam,
                    totalwhr: workTime,
                    efficency: 0,
                    //performance: parseFloat(ef.toFixed(2)),
                })
                start.push(line);
              } else {
                final[idx].totalad += amountDone;
                final[idx].totalsam += sam;
                final[idx].totalwhr += workTime;
              }
              
            }
            final.forEach(item => {
              var ef =  ((item.totalad * item.totalsam) / (item.totalwhr)) * 100
              item.efficency += parseFloat(ef.toFixed(2)); 
            })
            cb(null, final) // Final callback
        })
    }
};