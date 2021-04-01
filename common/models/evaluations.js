'use strict';

module.exports = function(Evaluations) {

    Evaluations.dhuChartData = (cb) => {
          var tempobj = {}
          var temparray = []
          var datearray = []
          var garmentsChecked = 0
        getEvaluation().then(r => {
          

            for (var element in  r){
                garmentsChecked += r[element].__data.quantitychecked
                tempobj  = {
                "value": r[element].__data.totaldefects,
                "date": r[element].__data.date.toString().split(" ")[0],
                "pass": r[element].__data.garmentpassed,
                "checked": r[element].__data.quantitychecked,
                "line": r[element].__data.linenum,
                "dhu": 0,
                "rft": 0,
                }
                

                if(!datearray.includes(tempobj.date)){
                    tempobj.dhu =  tempobj.value / tempobj.checked
                    tempobj.rft = (tempobj.pass / tempobj.checked) * 100
                    // removing null value from the object
                    if(!tempobj.dhu > 0) tempobj.dhu = 0
                    if(!tempobj.rft > 0) tempobj.rft = 0
                    datearray.push(tempobj.date)
                    temparray.push(tempobj)
                }
                else {
                    temparray[datearray.indexOf(tempobj.date)].value += tempobj.value
                    temparray[datearray.indexOf(tempobj.date)].pass += tempobj.pass
                    temparray[datearray.indexOf(tempobj.date)].checked += tempobj.checked
                    temparray[datearray.indexOf(tempobj.date)].dhu =  temparray[datearray.indexOf(tempobj.date)].value / temparray[datearray.indexOf(tempobj.date)].checked, 2
                    temparray[datearray.indexOf(tempobj.date)].rft = (temparray[datearray.indexOf(tempobj.date)].pass / temparray[datearray.indexOf(tempobj.date)].checked) * 100
                    // removing null value from the object
                    if(!temparray[datearray.indexOf(tempobj.date)].dhu > 0) temparray[datearray.indexOf(tempobj.date)].dhu = 0
                    if(!temparray[datearray.indexOf(tempobj.date)].rft > 0) temparray[datearray.indexOf(tempobj.date)].rft = 0
                }

                tempobj = {}

            }



            cb(null, temparray)
        }).catch(e => {
            console.log(e)
    })
        
    }

    Evaluations.remoteMethod("dhuChartData", {
        description: "Get DHU Chart Data",
        returns: {
            type: [
            "object"
            ],
            root: true
        },
        http: {
            verb: "get",
            path: "/dhuChartData"
          }
    })
    

    var getEvaluation = async function(){
        var data = await Evaluations.find({limit: 0})
        return Promise.resolve(data)
    }

    Evaluations.evaluationHistory = (cb) => {
        
        getEvaluation().then(r => {
            var failed = 0, altered = 0, totaldefect = 0
            for (var element in  r){
                failed += r[element].__data.garmentfailed
                altered += r[element].__data.garmentaltered
                totaldefect += r[element].__data.totaldefects
            }
            cb(null, {
                garmentfailed: failed,
                garmentaltered: altered,
                totaldefects: totaldefect,
                evaluations: r.length
            })
        }).catch(e => {
            console.log(e)
    })
        
    }

    Evaluations.remoteMethod("evaluationHistory", {
        description: "Evaluation History",
        returns: {
            type: "object",
            root: true
        },
        http: {
            verb: "get",
            path: "/evaluationHistory"
          }
    })


    Evaluations.deleteAll = (cb) => {
        try {
            Evaluations.find({}, (err, res) => {
                cb(null, res)
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }


    Evaluations.remoteMethod("deleteAll", {
        description: "Delete all evaluation",
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


};
