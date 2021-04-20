"use strict";

module.exports = function(OperationBulletin) {

    var arr = [];

    OperationBulletin.deleteAll = (cb) => {
        try {
            OperationBulletin.find({}, (err, res) => {
                cb(null, res)
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }
    OperationBulletin.remoteMethod("deleteAll", {
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
    })

    // ================== =============
    var fetchOperationBulletin = async function (val, scanid) {
        var mdls = [];
        var res = await OperationBulletin.find({ where: { orderId: val } });
        for (let i = 0; i < res.length; i++) {
            await fetchModules(res[i].id, mdls, scanid);
        }
        return Promise.resolve(mdls);
    }

    var fetchModules = async function (val,mdls, scanid) {
        var moduleId;
        var defectInfo = [];
        var modulename;
        var imgurl;
        
        const { module } = OperationBulletin.app.models
        var result = await module.find({ where: { OperationBulletinId: val } });
       
        for (let j = 0; j < result.length; j++) {
            modulename = result[j].modulename;
            imgurl = result[j].imageurl;
            moduleId = result[j].id;
            var dfct = result[j].defects;
            defectInfo = []
            for (let k = 0; k < dfct.length; k++) {

                await fetchDefects(dfct[k], moduleId, scanid).then(res=>{
                    // console.log(res)
                    defectInfo.push(res);
                });
                
            }

            // obj = {modulename, imgurl, defects}
            mdls.push({modulename, imgurl, moduleId, defectInfo})
        }
        return Promise.resolve(mdls);
            
    }

    var fetchDefects = async function(val, moduleId, scanid){
        var defectId;
        var nameEng;
        var nameAmharic;
        var type;
        var singleEvaluation = [];
        const { defects } = OperationBulletin.app.models
        var res = await defects.find({ where: { id: val } });
        
        defectId = res[0].__data.id;
        await fetchSingleEvaluation(defectId, moduleId, scanid).then(res =>{
            singleEvaluation.push(res)
        });
        nameEng = res[0].__data.name_english;
        nameAmharic = res[0].__data.name_amharic;
        type = res[0].__data.type;
        
        return Promise.resolve({defectId, nameEng, nameAmharic, type, singleEvaluation});
    }
    

    var fetchSingleEvaluation = async function(val, moduleid, scanid){
        var minor;
        var major;
        var total;
        var evaluationid;
        const { singleevaluations } = OperationBulletin.app.models;
        var result = await singleevaluations.find({where: {and: [{'defectId': val}, {moduleId: moduleid}, {scannedOrderStatusId: scanid}]} })
        // console.log(result)
        minor = result.length > 0 ? result[0].minor : 0;
        major = result.length > 0 ? result[0].major : 0;
        total = result.length > 0 ? result[0].total : 0;
        evaluationid = result.length > 0 ? result[0].id : "";

        return Promise.resolve({evaluationid, minor, major, total});

    }

    OperationBulletin.modulesInOrder = (orderId, scanId, cb) =>{
        var obj = {};
        fetchOperationBulletin(orderId, scanId).then(res =>{
            obj = {modules: res}
            
            cb(null, obj)
        })
    }

    OperationBulletin.remoteMethod("modulesInOrder", {
        description: "Get the modules in an order",
        accepts: [{
          arg: "orderId",
          type: "string",
          required: true
        },
        {
            arg: "scannedOrderStatusId",
            type: "string",
            required: true
        }
        ],
    
        returns: {
          type: "object",
          root: true
        },
        http: {
          verb: "get",
          path: "/modulesInOrder"
        }
    
      });

      // Fetches Operation billetins with operations included
      var fetchOperationBulletingWithOperations = async function(id, f){
          var data = await OperationBulletin.findById(id, f);
         return Promise.resolve(data.__data); 
      }

      // Fetch scannedorderStatus with theri respective bundle History for a certain Order
      var fetchScanedOrderStatus = async function(id, f){
        const { Order }  = OperationBulletin.app.models
        var data = await Order.findById(id, f);
       return Promise.resolve(data); 
    }


      OperationBulletin.totalMinutesProduced = function (opbulid, date, cb) {
          // Note Date has to be in the following format YYYY-MM
          console.log(opbulid + " " + date)

        var f = {
                include: ["operations", "order"]
        }

         fetchOperationBulletingWithOperations(opbulid, f).then( res => {
             var tsam = 0;
            
            if (res.operations.length > 0){
                for(var i = 0; i < res.operations.length; i++) {
                    tsam += parseInt(res.operations[i].__data.sam)
                }
                
            } 

            var f2 = {
                include: [
                    {
                        relation: "ScannedOrderStatus",
                        scope: {
                            include: {
                                relation: "BundleHistory",
                                scope: {
                                    where: {
                                        date: {
                                            like: date
                                        },
                                        newStatus: 'so',
                                    }
                                }
                            }
                        }
                    }
                ]
            }

            var totalAmountDone = 0
            var total = 0
            fetchScanedOrderStatus(res.order.__data.id,f2).then( res => {
                // console.log(res.__data.ScannedOrderStatus[0].__data.BundleHistory)
                for (var scos of res.__data.ScannedOrderStatus ){
                    total = parseInt(scos.__data.to) - parseInt(scos.__data.from) + 1
                    if (scos.__data.BundleHistory.length > 0){
                        totalAmountDone += total
                    }
                }

                let obj = {
                    totalSam: tsam,
                    totalAmountDone: totalAmountDone,
                    minutesProduced: tsam * totalAmountDone
                };
                let arr = [];
                arr.push(obj);

                cb(null, arr)


            }).catch( e=> {
                console.log("============ Error ==============")
                console.log(e)
                console.log("==================================")
            })


            
            

        }).catch( e=> {
            console.log("============ Error Fetchin Sam ==============")
            console.log(e)
            console.log("==========================")
        })


      }


      OperationBulletin.remoteMethod("totalMinutesProduced", {
        description: "Total Minutes Produced for a certain operation bulletin id",
        accepts: [{
          arg: "opbulid",
          type: "string",
          required: true
        },
        {
            arg: "date",
            type: "string",  // Note Date has to be in the following format YYYY-MM
            required: true
          }
        ],
    
        returns: {
          type: "object",
          root: true
        },
        http: {
          verb: "post",
          path: "/totalMinutesProduced"
        }
    
      });

};
