'use strict';

module.exports = function(Singleevaluations) {

    Singleevaluations.deleteAll = (cb) => {
        try {
            Singleevaluations.find({}, (err, res) => {
                cb(null, res)
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }
    Singleevaluations.remoteMethod("deleteAll", {
        description: "Delete all single evaluation",
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
    Singleevaluations.filteredchartData = ( from, to, line, opbltn, cb) => {
        
        try {
            from  = new Date(from);
            to  = new Date(to);
            var defectids = []
            var evals = []
            var totaldefectsvals = 0
            Singleevaluations.find({include: ["defect"],}, (err, res) => {

                if(res.length > 0){

                res.forEach(element => {
                
                    element.__data.date  = element.__data.date.toString().split(" ")[0] + "T" + element.__data.date.toString().split(" ")[1]
                    var tempdate = new Date(element.__data.date.toString())
                    
                    if(tempdate > from && tempdate < to && line == element.__data.linenum && opbltn == element.__data.OperationBulletinId.toString() ){                 
                            if(!defectids.includes(element.__data.defectId)){
                                defectids.push(element.__data.defectId)
                                element.__data.total = parseFloat(element.__data.total)
                                evals.push(element.__data)
                                totaldefectsvals += element.__data.total  
                                Object.assign(evals[evals.length -1], {date: element.__data.date , styleid: element.__data.OperationBulletinId, linenum: element.__data.linenum, name: element.__data.defect.name_english})                  
                            }
                            else {
                              var temp = defectids.indexOf(element.__data.defectId)
                              evals[temp].total  = parseFloat(evals[temp].total) +  parseFloat(element.__data.total)
                              totaldefectsvals += parseFloat(element.__data.total)
                            }
                    }
                    else {
                    }
                });
                if(evals.length == 0) {
                    cb(null, [])
                }
                  else { for(var j = 0; j<evals.length - 1; j++){
                        for(var i = j; i<=evals.length - 1; i++){
                                if (evals[i].total > evals[j].total){
                                var tempsort = evals[i]
                                evals[i] = evals[j]
                                evals[j] = tempsort
                                            }
                                }
                        }

                evals[0].percentage = parseFloat(parseFloat(evals[0].total * 100 / totaldefectsvals).toFixed(2))
                evals[0].commulative = parseFloat(parseFloat(evals[0].percentage).toFixed(2))

                for(var i = 1; i < evals.length; i++){
                    evals[i].percentage = parseFloat(parseFloat(evals[i].total * 100 / totaldefectsvals).toFixed(2))
                    evals[i].commulative = parseFloat(parseFloat(parseFloat(evals[i - 1].commulative) + parseFloat(evals[i].percentage)).toFixed(2))
                }
                // console.log(evals)
                cb(null, evals)}
            }
            else {
                cb(null, {})
            }
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }
    Singleevaluations.remoteMethod("filteredchartData", {
        description: "Get chart data",
        // accepts: [],

        returns: {
            type: "object",
            root: true
        },
        accepts: [{
            arg: "from",
            type:["Date"],
            required: true
          },
          {
            arg: "to",
            type:["Date"],
            required: true
          },
          {
            arg: "line",
            type:"string",
            required: true
          },
          {
            arg: "opbltn",
            type:"string",
            required: true
          },
          ],

        http: {
            verb: "get",
            path: "/chartData"
        }
    });


    var getSingleevaluations = async function(){
        var data = await Singleevaluations.find({ include: "defect"})
        return Promise.resolve(data)
    }

    Singleevaluations.pieChartData = (cb) => {
        var data = [], tempar = [], labels = [], colors = []
        var total=0

        getSingleevaluations().then(ret => {

            var getRandomColor = function () {
                var letters = '0123456789ABCDEF';
                var color = '#';
                for (var i = 0; i < 6; i++) {
                  color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
              }

            for(var idx in ret){
                
                var fidx = tempar.indexOf(ret[idx].__data.defectId)
                total += parseFloat(ret[idx].__data.total)
                if(fidx == -1){
                    data.push(parseFloat(ret[idx].__data.total))
                    
                    labels.push(ret[idx].__data.defect.__data.name_english)
                    colors.push(getRandomColor() + "80")
                    tempar.push(ret[idx].__data.defectId)
                }
                else {
                    data[fidx] += parseFloat(ret[idx].__data.total)
                }
            }

            for(var idx in data){
                data[idx] = (data[idx] / total) * 100
            }
           
            cb(null, {
				datasets: [{
                data: data,
                backgroundColor: colors,
                label: 'Defects'
                }],
            labels: labels
                })
        }).catch(e => {
          console.log(e)
  })
    }

    Singleevaluations.remoteMethod("pieChartData", {
        description: "get PieChart data for quality dashboard",
        returns: {
            type: "object",
            root: true
        },
        http:  {
            verb: "get",
            path: "/getPieChartData"
          }
    })


    Singleevaluations.allChartData = ( cb) => {
        
        try {
            var defectids = []
            var evals = []
            var totaldefectsvals = 0
            Singleevaluations.find({include: ["defect"],}, (err, res) => {

                if(res.length > 0){

                res.forEach(element => {
                                      
                            if(!defectids.includes(element.__data.defectId)){
                                defectids.push(element.__data.defectId)
                                element.__data.total = parseFloat(element.__data.total)
                                evals.push(element.__data)
                                totaldefectsvals += element.__data.total  
                                Object.assign(evals[evals.length -1], {date: element.__data.date , styleid: element.__data.OperationBulletinId, linenum: element.__data.linenum, name: element.__data.defect.name_english})                  
                            }
                            else {
                              var temp = defectids.indexOf(element.__data.defectId)
                              evals[temp].total  = parseFloat(evals[temp].total) +  parseFloat(element.__data.total)
                              totaldefectsvals += parseFloat(element.__data.total)
                            }
                });
                
                if(evals.length == 0) {
                    cb(null, [])
                }

                  else { 
                      for(var j = 0; j<evals.length - 1; j++){
                        for(var i = j; i<=evals.length - 1; i++){
                                if (evals[i].total > evals[j].total){
                                var tempsort = evals[i]
                                evals[i] = evals[j]
                                evals[j] = tempsort
                                            }
                                }
                        }

                evals[0].percentage = parseFloat(parseFloat(evals[0].total * 100 / totaldefectsvals).toFixed(2))
                evals[0].commulative = parseFloat(parseFloat(evals[0].percentage).toFixed(2))

                for(var i = 1; i < evals.length; i++){
                    evals[i].percentage = parseFloat(parseFloat(evals[i].total * 100 / totaldefectsvals).toFixed(2))
                    evals[i].commulative = parseFloat(parseFloat(parseFloat(evals[i - 1].commulative) + parseFloat(evals[i].percentage)).toFixed(2))
                }

                cb(null, evals)
            }
            }
            else {
                cb(null, {})
            }
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }



    Singleevaluations.remoteMethod("allChartData", {
        description: "Get chart data",

        returns: {
            type: ["object"],
            root: true
        },

        http: {
            verb: "get",
            path: "/allChartData"
        }
    });

    // Singleevaluations.getyearlist= (cb,date) => {

    //     try {
    //         let Year = new Date(date).getFullYear()
    //         Singleevaluations.find({where:{date:{like:Year.toString()}}}, (err, res) => {
    //            if (res.length > 0) {
    //             let tempValue = []
    //            for (let i = 0; i < res.length; i++) {
    //             tempValue.push({
    //             date: res[i].__data.date,
    //             month: new Date(res[i].__data.date).toISOString().substr(0, 7),
    //             year:Year
    //                   })
                     
   
    //                 const key = "year";
    //                 let uniqueMonths = [...new Map(tempValue.map(item => [item[key], item])).values()];
    //                 for (let i = 0; i < uniqueMonths.length; i++) {
                    
    //                     if (i== tempValue.length - 1) {
                        
    //                       cb(null,tempValue)

                        
    //                     }
    //                   }
    //                 }
    //                 }

    //                 })
                               
    //             }
    //             catch (error) {
    //                 throw new Error("Internal server error try again");
    //             }},

                Singleevaluations.remoteMethod("getyearlist",{
                    description: "count number of employee",
                     accepts: [
                      { 
                        arg:"month",
                        arg:"year",
                         type: "string",
                        required: true}
                     ],
                    returns: {
                        type: ["object"],
                        root: true
                    },
                    http: {
                        verb: "post",
                        path: "/getyearlist"
                    }
                
            });
        

    Singleevaluations. getTotaldeffect= (date, cb) =>{ 
    try {
        let Year = new Date(date).getFullYear()
        var lebles = []
        var vert=[]
        Singleevaluations.find({}, (err, res) => {
           if (res.length > 0) { 
            let tempValue = []
            let tempYear=[]
           for (let i = 0; i < res.length; i++) {
               let d= new Date(res[i].__data.date)
               tempYear.push({year:new Date(res[i].__data.date).getFullYear()})
               if(Year==d.getFullYear())
          {  tempValue.push({
            date: res[i].__data.date,
            month: new Date(res[i].__data.date).toISOString().substr(0, 7),
            total:res[i].__data.total,
            year:new Date(date).getFullYear()
                  })}
                 }
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
                let uniqueMonths = [...new Map(tempValue.map(item => [item[key], item])).values()];
                let dashboardVal = []
                for (let i = 0; i < uniqueMonths.length; i++) {
                  let total= 0
                  for (let j = 0; j < tempValue.length; j++) {
                    if (uniqueMonths[i].month == tempValue[j].month) {
                      total += parseFloat(tempValue[j].total)
                    }
                    if (j == tempValue.length - 1) {
                      dashboardVal.push({
                        month: uniqueMonths[i].month,
                        monthName: mon[new Date(uniqueMonths[i].month).getMonth()],
                        total: total,
                      })
                    }
      
                  }

                }
            dashboardVal.sort(function (a, b) {
                var m1 = new Date(a.month),
                  m2 = new Date(b.month);
                return m1 - m2;
              });
            let lbls = dashboardVal.map(x => x.monthName)
            let mcn = dashboardVal.map(x => x.total)
            let lineCahrt =
            { 
                labels: lbls,
                datasets: [
                  {
                    label: "defects",
                    data: mcn, 
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
                      label:"Deffect line chart" 
                    }
                ]
              
              
            } 
            let uniqueYear=[];
            const key1 = "year";
                 uniqueYear= [...new Map(tempYear.map(item => [item[key1], item])).values()];
                
         cb(null,[lineCahrt,uniqueYear])
            }
            else{
                cb(null,{})
                     }   
})
    }
    catch (error) {
        throw new Error("Internal server error try again");
        }
}
Singleevaluations.remoteMethod("getTotaldeffect",{
    description: "count number of employee",
     accepts: [
      { 
        arg:"date",  
        type: "string", 
         },
     ],
    returns: {
        type: ["object"],
        root: true
    },
    http: {
        verb: "post",
        path: "/getTotaldeffect"
    }
});
Singleevaluations.getDashboardWithRange=function(start,end,cb){
    try{
       let startDate = new Date(start)
        let endDate = new Date(end)
       let Year = new Date(start).getFullYear()
        Singleevaluations.find({year:Year}, (err, res) => {
           if (res.length > 0) {
            let tempValue = []
            let tempYear=[]
           for (let i = 0; i < res.length; i++) {
               let d= new Date(res[i].__data.date)
               tempYear.push({year:new Date(res[i].__data.date).getFullYear()})
               if(Year==d.getFullYear())
               {  
            tempValue.push({
            date: res[i].__data.date,
            month: new Date(res[i].__data.date).toISOString().substr(0, 7),
            total:res[i].__data.total,
            year:new Date(start).getFullYear()
                  })}
                 }
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
                             ]
                             const key = "month";
                                             let uniqueMonths = [...new Map(tempValue.map(item => [item[key], item])).values()];
                                             let dashboardVal = [] 
                                             for (let i = 0; i < uniqueMonths.length; i++) {
                                               let total= 0
                                               let d = new Date(uniqueMonths[i].date)
                                               if( startDate.getMonth() <= d.getMonth() && endDate.getMonth() >= d.getMonth())
                                               {
                                               for (let j = 0; j < tempValue.length; j++) {
                                         if (uniqueMonths[i].month == tempValue[j].month) {
                                                   total += parseFloat(tempValue[j].total)
                                                 }
                                                 if (j == tempValue.length - 1) {
                                                   dashboardVal.push({
                                                     month: uniqueMonths[i].month,
                                                     monthName: mon[new Date(uniqueMonths[i].month).getMonth()],
                                                     total: total,
                                                   })
                                                   }
                                                 }
                                   
                                               }
                             
                                             }

                                            dashboardVal.sort(function (a, b) {
                                             var m1 = new Date(a.month),
                                               m2 = new Date(b.month);
                                             return m1 - m2;
                                           });
                                         let lbls = dashboardVal.map(x => x.monthName)
                                         let mcn = dashboardVal.map(x => x.total)
                                         let lineCahrt =
                                         { 
                                             labels: lbls,
                                             datasets: [
                                               {
                                                 label: "defects",
                                                 data: mcn, 
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
                                                   label:"" 
                                                 }
                                             ]
                                           
                                           
                                                }
                                                
                                          cb(null,lineCahrt)                                                
                                          }
                                          else{
                                              cb(null, { 
                                                labels: [],
                                                datasets: [
                                                  {
                                                    label: "defects",
                                                    data: [], 
                                                    backgroundColor: [], 
                                                      label:"" 
                                                    }
                                                ]
                                              
                                              
                                                   })
                                          }
                                       })
 
    }
    catch(error){
        console.log(error)
    }
}

Singleevaluations.remoteMethod("getDashboardWithRange",{
    description: "count number of employee",
     accepts: [
      { 
        arg:"start",  
        type: "string", 
         },
         { 
            arg:"end",  
            type: "string", 
             },
     ],
    returns: {
        type: ["object"],
        root: true
    },
    http: {
        verb: "post",
        path: "/getDashboardWithRange"
    }
});
};
