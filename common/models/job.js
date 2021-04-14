module.exports = function (Job) {

    // ================= Fetch Job in a specific date ======================
    var fetchJobsinaDay = async function (date) {

        var data = await Job.find({
            where: { date: { like: date } },
            include: [
              {
                ProductionHistory : ["ScannedOrderStatus"]
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

    Job.remoteMethod("lineEfficiency", {
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
  
    Job.lineEfficiency = (date, cb) => {
        
        fetchJobsinaDay(date).then(res => {
            start = []
            final  = []
            for( element of res) {
              var line = element.__data.line;
              var amountDone = 0;
  
              // Calculate amount done for a specific job
              for(ph of element.__data.ProductionHistory){
                  var temp = ph.__data.ScannedOrderStatus.__data;
                  amountDone += parseInt(temp.to.toString()) -  parseInt(temp.from.toString()) + 1
              }
  
              // Calculate Working time for a specific job
              var fromD = new Date(2011, 0, 1, parseInt(element.__data.from.toString().split(":")[0]), parseInt(element.__data.from.toString().split(":")[1]))
              var toD = new Date(2011, 0, 1, parseInt(element.__data.to.toString().split(":")[0]), parseInt(element.__data.to.toString().split(":")[1]))
              var workTime = ((toD - fromD) / 1000) / 60;
  
              // Calculate Sam for a specific job
              var sam = parseInt(element.__data.operation.__data.sam.toString())
              
              var idx = start.indexOf(line);
              if (idx == -1) {
                // Pushing to the main list
                final.push({
                    line,
                    date,
                    totalad: amountDone, 
                    totalsam: sam,
                    totalwhr: workTime,
                    efficiency: 0,
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
              item.efficiency += parseFloat(ef.toFixed(2)); 
            })
            cb(null, final) // Final callback
        })
    }

    let fetchYesterDayJobs = async function(dt){
        let res = await Job.find({where: {date: {like: dt}}});
        return Promise.resolve(res);
    }

    let fetchEmployeeData = async function(empid){
        const { Employee } = Job.app.models;
        let emps = await Employee.find({where: { id: empid }, include: ["attendances"]});
        // console.log(emps)

        // for (let i = 0; i < emps.length; i++) {
        //     console.log(emps[i].fullName)
        //     let att = emps[i].attendances;
        //     console.log(att)
        // }

        return Promise.resolve(emps);
    }

    Job.jobAutoAssign = (cb) =>{
        
        // get yesterday's date.
        let today = new Date();
        let yday = new Date(today);
        yday.setDate(yday.getDate() - 1);
        let yesterday = new Date(yday).toISOString().substr(0, 10);

        console.log("Today's date: " + today.toISOString().substr(0, 10));
        console.log("Yesterday's data: " + yesterday);

        // First, fetch jobs of yesterday.
        fetchYesterDayJobs(yesterday).then(res =>{
            // console.log(res)
            for (let i = 0; i < res.length; i++) {
                let empId = res[i].employeeId
                let opId = res[i].operationId
                // console.log(opId)
    
                // for each job, get the employee assigned with attendance included.

                // For every employee check if he/she is present for today using employee id.
                fetchEmployeeData(empId).then(rs =>{
                    
                    for(let j = 0; j < rs.length; j++){
                        let fullname = rs[j].__data.fullName;
                        let attendance = rs[j].__data.attendances;

                        

                        for (let k = 0; k < attendance.length; k++) {
                            // console.log(attendance[k].value)
                            if(attendance[k].value == 'P'){
                                console.log("The employee is present! You can assign a job.")
                            }
                            else{
                                console.log("The employee is not present!")
                            }
                        }
                        // let attValue = att.__data.value;
                        // console.log(att)
                    }
                })
                // fetchOperation(opId)
    
            }
        })
        
    }

    Job.remoteMethod("jobAutoAssign", {
        description: "Automatically assing a job to an employee based on the last job he/she completed.",
        accepts: [
            // {
            // arg: "employees",
            // type: "array",
            // allowArrays: true,
            // required: true
            // },
        ],
    
        returns: {
          type: "object",
          root: true
        },
        http: {
          verb: "get",
          path: "/jobAutoAssign"
        }
    
    });
};