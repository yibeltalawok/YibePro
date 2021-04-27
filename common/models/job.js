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
                var sam = parseFloat(element.__data.operation.__data.sam.toString())
                
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
                    department: element.__data.employee.__data.department,
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
                    totalad: 0, 
                    totalsam: sam,
                    totalwhr: workTime,
                    efficiency: 0,
                })
                start.push(line);
              } else {
                final[idx].totalsam += sam;
                final[idx].totalwhr += workTime;
              }
              
            }
           
            cb(null, final) // Final callback
        })
    }

    let fetchYesterDayJobs = async function(dt){
        let res = await Job.find({where: {date: {like: dt}}});
        return Promise.resolve(res);
    }

    let fetchEmployeeData = async function(empid, today){
        const { Employee } = Job.app.models;
        let emps = await Employee.find({
            where: { id: empid }, 
            include:{
                relation: 'attendances',
                scope: {
                    where: {dateAttended: {like: today}} // only select order with id 5
                }
            },
        });

        return Promise.resolve(emps);
    }

    let fetchTodayJobs = async function(dt, empId){
        let jobs = await Job.find({where: {and: [{date: {like: dt}}, {employeeId: empId}]} });
        return Promise.resolve(jobs);
    }

    let assignJob = async function(data){
        await Job.create(data).then(() =>{
            console.log("Successfully assigned.")
        })
    }

    Job.jobAutoAssign = (dt, cb) =>{

        // let job = {};
        
        // get yesterday's date.
        let date = new Date();
        let yday = new Date(date);
        yday.setDate(yday.getDate() - 1);
        let yesterday = new Date(yday).toISOString().substr(0, 10);

        let prevDate = dt;

        let today =  date.toISOString().substr(0, 10)

        // console.log("Today's date: " + today);
        // console.log("Yesterday's data: " + yesterday);

        // First, fetch jobs of yesterday.
        fetchYesterDayJobs(prevDate).then(res =>{
            // console.log(res)
            for (let i = 0; i < res.length; i++) {
                let empId = res[i].employeeId;
                let opYesterday = res[i].operationId;
                let line = res[i].line;
                let from = res[i].from;
                let to = res[i].to;

                // console.log(res[i].employeeId + " =====> "+res[i].operationId)

                let job = {
                    date: today,
                    line: line,
                    from: from,
                    to: to,
                    status: true,
                    mp: '2',
                    progress: 'assigned',
                    pref: '0',
                    done: '0',
                    employeeId: empId,
                    operationId: opYesterday,
                    amountDone: '0',
                    whichLine: 'newLine',
                                        
                }

                // console.log(job)
    
                // for each job, get the employee assigned, with attendance included.
                fetchEmployeeData(res[i].employeeId, today).then(rs =>{
                    // console.log(rs)
                    for(let j = 0; j < rs.length; j++){
                        let fullname = rs[j].__data.fullName;
                        let attendance = rs[j].__data.attendances;

                        // console.log(rs[j].__data.fullName + "========yester day" + res[i].operationId);

                        // console.log(fullname);
                        // console.log(attendance);

                        // For every employee check if he/she is present for today using employee id.
                        for (let k = 0; k < attendance.length; k++) {
                            if(attendance[k].value == 'P'){

                                // to assign a job, first check if the employee is already assigned that operation.
                                // so, fetch today's jobs filtered by the employee id.
                                // compare yesterday's jobs operation id with today's jobs.
                                fetchTodayJobs(today, empId).then(jobs =>{
                                    // console.log(jobs)
                                    if(jobs.length == 0){

                                        // if there are no jobs assigned today, assign the employee to yesterday's operation.
                                        assignJob(job);
                                    }
                                    else{
                                        for (let m = 0; m < jobs.length; m++) {
                                            var similar = false;
                                            var opToday = jobs[m].operationId;
                                            // console.log("Today's Operation Id: " + opToday);
                                            // console.log("Yesterdays Operation: " + opYesterday);

                                            // console.log(rs[j].__data.fullName + " = today ----" + jobs[m].operationId);
                                            // console.log(rs[j].__data.fullName + " = yester day-----"+ res[i].operationId);
                                            if(res[i].operationId.toString() == jobs[m].operationId.toString()){
                                                // console.log(res[i].operationId + "== "+ jobs[m].operationId);
                                                console.log(rs[j].__data.fullName + " is already assigned.");
                                                break;
                                            }
                                            // if(similar){
                                            //     break;
                                            // }
                                            else if(res[i].operationId.toString() != jobs[m].operationId.toString() ){
                                                // console.log(res[i].operationId + " is not equalt to: "+jobs[m].operationId);
                                                // console.log("Ready to be assigned");
                                                assignJob(job);
                                            }
                                            
                                        }
                                    }
                                })
                                // cb(null, true);
                            }
                            else{
                                
                                console.log(rs[j].__data.fullName + " is absent.");
                                // cb(null, false);
                                
                            }

                            
                            
                        }
                        
                        // console.log(fullname +": has been assigned an operation with id: " + opYesterday);
                    }

                    
                })
    
            }
            cb(null, true);
        })
        
    }

    Job.remoteMethod("jobAutoAssign", {
        description: "Automatically assing a job to an employee based on the last job he/she completed.",
        accepts: [
            {
            arg: "date",
            type: "string",
            allowArrays: true,
            required: true
            },
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