var QRCode = require('qrcode')
const { jsPDF } = require("jspdf");
module.exports = function (Employee) {

    Employee.deleteEmployee = (employeeId, cb) => {
        try {
            const { PayrollMaster } = Employee.app.models
            const { Attendance } = Employee.app.models
            const { Overtime } = Employee.app.models
            const { Job } = Employee.app.models
            let filter = { where: { employeeId: employeeId } }
            PayrollMaster.find(filter, (err, res) => {
                if (res.length > 0) {
                    for (let i = 0; i < res.length; i++) {
                        PayrollMaster.destroyById(res[i].__data.id)
                        if (res.length - 1 == i) { deleteFromAttendance() }
                    }
                }
                else {
                    deleteFromAttendance()
                }
            })
            const deleteFromAttendance = async function () {
                Attendance.find(filter, (err, res) => {
                    if (res.length > 0) {
                        for (let i = 0; i < res.length; i++) {
                            Attendance.destroyById(res[i].__data.id)
                            if (i == res.length - 1) {
                                deleteFromJob()
                            }
                        }
                    }
                    else {
                        deleteFromJob()
                    }
                })
            }
            const deleteFromJob = () => {
                Job.find(filter, (err, res) => {
                    if (res.length > 0) {
                        for (let i = 0; i < res.length; i++) {
                            Job.destroyById(res[i].__data.id)
                            if (i == res.length - 1) {
                                deleteTheEmployee()
                            }
                        }
                    }
                    else {
                        deleteTheEmployee()
                    }
                })
            }
            const deleteTheEmployee = () => {
                Employee.destroyById(employeeId)

            }
        } catch (error) {
            console.log(error)
        }
    }
    Employee.remoteMethod("deleteEmployee", {
        description: "QR code generator",
        accepts: [{
            arg: "employeeId",
            type: "string",
            required: true
        }
        ],

        returns: {
            type: "object",
            root: true
        },

        http: {
            verb: "post",
            path: "/deleteEmployee"
        }
    });
    //QR Codeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
    Employee.printQrCode = async (
        value,
        name
    ) => {
        try {

            var doc = new jsPDF({ orientation: "landscape" })
            doc.setFontSize(8)
            var posx = 0;
            var posy = 0;

            value.forEach(element => {
                QRCode.toDataURL(JSON.stringify(element.qr), async function (err, url) {
                    if (posx == 11) {
                        posx = 0
                        posy++
                    }
                    if (posy == 6) {
                        doc.addPage()
                        posx = 0
                        posy = 0
                    }
                    preparePDF(25 * posx + 13, 32 * posy + 12, url, element)
                    await doc.save("uploads/qrtoprint/" + name + ".pdf")
                    posx++
                })
            });

        }
        catch {
            throw new Error("Internal server error try again");
        }

        var preparePDF = async function (x, y, url, val) {
            doc.rect(x, y, 20, 27)
            doc.text(x + 2, y + 3, val.idno)
            doc.addImage(url, 'JPEG', x + 1, y + 4.5, 18, 18)

        };

        return {
            status: "success",
            filename: name + ".pdf"
        };
    };
    Employee.remoteMethod("printQrCode", {
        description: "QR code generator",
        accepts: [{
            arg: "value",
            type: [
                "object"
            ],
            required: true
        },

        {
            arg: "name",
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
            path: "/printqrcode"
        }
    });
    Employee.deleteAll = (cb) => {
        try {
            Employee.find({}, (err, res) => {
                cb(null, res)
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }

    Employee.countEmployee=(date,cb)=>{
        try {

            const {Attendance}=Employee.app.models
            const {Orderstatus}=Employee.app.models
            const {CostSummary}=Employee.app.models
            // const {LostTime}=Employee.app.models
            // const {Performance}=Employee.app.models
            // const {efficiency}=Employee.app.models
            // const {CostPerSamHistory}=Employee.app.models
            
            let Year = new Date(date).getFullYear()
            Employee.find({}, (err, res) => {
                //          count=0
                //   for(let i=0;i<res.length;i++)
                //   {
                // count+=count
                //   }
                let d = new Date(date).toISOString().substr(0,10)  
                Attendance.find({where:{dateAttended:{like:d}}},(er,attendace)=>{
                getOrderStatus(res.length,res.length-attendace.length,d)
                
                })
            })

            const getOrderStatus  = async function(totalEmp,totalA,dat) {
                Orderstatus.find({date:{like:dat}},(er,os)=>{
                    if(os.length>0) {
                        let totalCutOut=0
                        let totalSewOut=0
                        let totalFinishingOut=0
                        for(let i= 0;i<os.length;i++){
                            totalCutOut+=parseFloat(os[i].__data.totalCutOut)
                            totalSewOut+=parseFloat(os[i].__data.totalCutOut)
                            totalFinishingOut +=parseFloat(os[i].__data.totalFinishingOut) 
                            if(i==os.length-1){
                                getCostSummary(totalEmp,totalA,totalCutOut,totalSewOut,totalFinishingOut)
                            }   
                        }
                    }

                    else{
                        getCostSummary( totalEmp,totalA,0,0,0)
                    
                    }
                    //console.log(res.length)

                })
            }

            const getCostSummary  = async function(totalEmp,totalA,totalCutOut,totalSewOut,totalFinishingOut,Year) {
    
                CostSummary.find({year:Year},(er,os)=>{
                    if(os.length>0) {
                        let totalcost=0
                        let directCost=0
                        let inDirectCost=0
                        for (let i = 0; i < os.length; i++) {
                            directCost +=parseFloat(os[i].__data.directCost) 
                            inDirectCost+=parseFloat(os[i].__data.indirectCost)
                            totalcost=directCost+inDirectCost
                            if(i==os.length-1){
                                cb(null,[{totalEmp:totalEmp,totalA:totalA,totalCutOut:totalCutOut,totalSewOut:totalSewOut,totalFinishingOut:totalFinishingOut,totalcost:totalcost}])

                            }
                        }
                    }
                    else{

                        cb(null,[{totalEmp:totalEmp,totalA:totalA,totalCutOut:totalCutOut,totalSewOut:totalSewOut,totalFinishingOut:totalFinishingOut,totalcost:0}])

                    }

                })
            }

        }
        catch (error) {
            throw new Error("Internal server error try again");
        }
    },

    Employee.remoteMethod("countEmployee",{
        description: "count number of employee",
        accepts: [
            { 
            //arg:"month",
            arg:"year",
            arg: "date",
            type: "string",
            required: true
            }
        ],

        returns: {
            type: ["object"],
            root: true
        },

        http: {
            verb: "post",
            path: "/countEmployee"

        }
    });

    Employee.gettotallosttime=(date,cb)=>{
        let Year = new Date(date).getFullYear()
        try{
            const {LostTime}=Employee.app.models  
            LostTime.find({year:Year},(er,los)=>{
                if(los.length>0) {
                    let totalLostTime=0
                    let averageLostTime=0
                    for(let j = 0; j < los.length; j++){
                        totalLostTime+=parseFloat(los[j].__data.totalmins)
                        averageLostTime=(totalLostTime/los.length).toFixed(2)
                        if(j==los.length-1){
                            cb(null,[{totalLostTime:totalLostTime,averageLostTime:averageLostTime}])            
                        }
                    }
                }
                else{
                    cb([{totalLostTime:0,averageLostTime:0}])            
                } 
            }) 
        }
        catch (error) {
            throw new Error("Internal server error try again");
        }
    },

    Employee.remoteMethod("gettotallosttime",{
        description: "count lost time",
         accepts: [
          { 
            //arg:"month",
            arg:"year",
            arg: "date",
            type: "string",
            required: true}
         ],

        returns: {
            type: ["object"],
            root: true
        },

        http: {
            verb: "post",
            path: "/gettotallosttime"

        }
    });

    Employee.getEmployeePerformance=(date,cb)=>{
        let Year = new Date(date).getFullYear()
        try{
            const {Performance}=Employee.app.models
            Performance.find({year:Year}, (err, res) => {
                if (res.length > 0) {
                    //let emp = []
                    let averagePerformance=0
                    let totalPerformance=0
                    for(let i = 0; i < res.length; i++){
                        totalPerformance+=parseFloat(res[i].__data.value)
                        averagePerformance=(totalPerformance/res.length).toFixed(2)
                        if(i==res.length-1){
                            cb(null,[{totalPerformance:totalPerformance,averagePerformance:averagePerformance}])                            
                        }
                    }
                }
                else{
                cb(null,[{totalPerformance:0,averagePerformance:0}])
                }

            })
        }
        catch (error) {
            throw new Error("Internal server error try again");
        }
    },

    Employee.remoteMethod("getEmployeePerformance",{
        description: "get total performance",
            accepts: [
            { 
            //arg:"month",
            arg:"year",
            arg: "date",
            type: "string",
            required: true}
            ],

        returns: {
            type: ["object"],
            root: true
        },

        http: {
            verb: "post",
            path: "/getEmployeePerformance"

        }
    });

    Employee.getAverageEfficiency=(date,cb)=>{
        let Year = new Date(date).getFullYear()
        try{
            const {efficiency}=Employee.app.models
            efficiency.find({year:Year},(err, ress) =>{
                if(ress.length > 0){
                    let totalEfficiency=0
                    let averageEfficiency=0
                    for(let i = 0; i < ress.length; i++){
                        totalEfficiency+=parseFloat(ress[i].__data.eff)
                        averageEfficiency=(totalEfficiency/ress.length).toFixed(2)
                        if(i==ress.length-1){
                            cb(null,[{totalEfficiency:totalEfficiency,averageEfficiency:averageEfficiency}])
                        }
                    }
                }
                else{
                    cb(null,[{totalEfficiency:0,averageEfficiency:0}])
                }
            })
        }
        catch (error) {
            throw new Error("Internal server error try again");
        }
    },

    Employee.remoteMethod("getAverageEfficiency",{
        description: "get total efficiency",
            accepts: [
            { 
            //arg:"month",
            arg:"year",
            arg: "date",
            type: "string",
            required: true}
            ],

        returns: {
            type: ["object"],
            root: true
        },

        http: {
            verb: "post",
            path: "/getAverageEfficiency"

        }
    });

    Employee.getAverageCostPerSAM=(date,cb)=>{
        let Year = new Date(date).getFullYear()
            try{
            const {CostPerSamHistory}=Employee.app.models
            CostPerSamHistory.find({year:Year},(err, res) =>{
                if(res.length > 0){
                    let totalCostPerSam=0
                    let averageCostPerSam=0
                    for(let i = 0; i < res.length; i++){
                        totalCostPerSam+=parseFloat(res[i].__data.costPerSam)
                        averageCostPerSam=(totalCostPerSam/res.length).toFixed(2)
                        if(i==res.length-1){
                            cb(null,[{totalCostPerSam:totalCostPerSam,averageCostPerSam:averageCostPerSam}])
                        }
                    }
                }
                else{
                    cb(null,[{totalCostPerSam:0,averageCostPerSam:0}])
                }
            })
        }
        catch (error) {
            throw new Error("Internal server error try again");
        }
    },

    Employee.remoteMethod("getAverageCostPerSAM",{
        description: "get total costperSAM",
            accepts: [
            { 
            //arg:"month",
            arg:"year",
            arg: "date",
            type: "string",
            required: true}
            ],

        returns: {
            type: ["object"],
            root: true
        },

        http: {
            verb: "post",
            path: "/cgetAverageCostPerSAM"

        }
    });

    Employee.getAverageCostPerMinute=(date,cb)=>{
        let Year = new Date(date).getFullYear()
        try{
            const {CostSummary}=Employee.app.models
            CostSummary.find({year:Year},(err, ress) =>{
                if(ress.length > 0){
                    let totalCostPerMinute=0
                    let averageCostPerMinute=0
                    for(let i = 0; i < ress.length; i++){
                        totalCostPerMinute+=parseFloat(ress[i].__data.costPerMinute)
                        averageCostPerMinute=(totalCostPerMinute/ress.length).toFixed(2)
                        if(i==ress.length-1){
                            cb(null,[{totalCostPerMinute:totalCostPerMinute,averageCostPerMinute:averageCostPerMinute}])
                        }
                    }
                }
                else{
                    cb(null,[{totalCostPerMinute:0,averageCostPerMinute:0}])
                }
            })
        }
        catch (error) {
            throw new Error("Internal server error try again");
        }
    },

    Employee.remoteMethod("getAverageCostPerMinute",{
        description: "get total costperSAM",
            accepts: [
            { 
            //arg:"month",
            arg:"year",
            arg: "date",
            type: "string",
            required: true}
            ],

        returns: {
            type: ["object"],
            root: true
        },

        http: {
            verb: "post",
            path: "/cgetAverageCostPerMinute"

        }
    });

    Employee.remoteMethod("deleteAll", {
        description: "QR code generator",
        // accepts: [],

        returns: {
            type: "object",
            root: true
        },

        http: {
            verb: "delete",
            path: "/deleteAll"

        }
    });

    Employee.setRole = (roleid, cb) => {
        try {
            Employee.find({}, (err, res) => {
                res[0].__data.userRoleId = roleid
                Employee.updateAll({}, {userRoleId: roleid}, )
                
                cb(null, {})
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }

    Employee.remoteMethod("setRole", {
        description: "QR code generator",
        // accepts: [],

        returns: {
            type: "object",
            root: true
        },

        accepts: [
            { 
              arg: "roleid",
              type: "string",
              required: true}
           ],

        http: {
            verb: "get",
            path: "/setRole"

        }
    });


    let fetchEmployeeData = async function(empid){
        // find employees data using the id.
        let emp = await Employee.find({where: {id: empid}});
        console.log(emp); //TODO to  be continued here..
    }

    Employee.jobAutoAssign = (employees, cb) =>{
        
        let emps = ['604c8a2288030517b053df76', '606196a46a76ac2d288cfdd6', '606196a46a76ac2d288cfdd7'];
        for (let i = 0; i < emps.length; i++) {
            console.log(emps[i])
            // fetchEmployeeData('604c8a2288030517b053df76')
            fetchEmployeeData(emps[i])
            
        }
    }

    Employee.remoteMethod("jobAutoAssign", {
        description: "Automatically assing a job to an employee based on the last job he/she completed.",
        accepts: [{
          arg: "employees",
          type: "array",
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
