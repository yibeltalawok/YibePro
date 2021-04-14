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
    var fetchOperationBulletin = async function (val) {
        var mdls = [];
        var res = await OperationBulletin.find({ where: { orderId: val } });
        for (let i = 0; i < res.length; i++) {
            await fetchModules(res[i].id, mdls);
        }
        return Promise.resolve(mdls);
    }

    var fetchModules = async function (val,mdls) {
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

                await fetchDefects(dfct[k]).then(res=>{
                    // console.log(res)
                    defectInfo.push(res);
                });
                
            }

            // obj = {modulename, imgurl, defects}
            mdls.push({modulename, imgurl, moduleId, defectInfo})
        }
        return Promise.resolve(mdls);
            
    }

    var fetchDefects = async function(val){
        var defectId;
        var nameEng;
        var nameAmharic;
        var type;
        var singleEvaluation = [];
        const { defects } = OperationBulletin.app.models
        var res = await defects.find({ where: { id: val } });
        
        defectId = res[0].__data.id;
        await fetchSingleEvaluation(defectId).then(res =>{
            singleEvaluation.push(res)
        });
        nameEng = res[0].__data.name_english;
        nameAmharic = res[0].__data.name_amharic;
        type = res[0].__data.type;
        
        return Promise.resolve({defectId, nameEng, nameAmharic, type, singleEvaluation});
    }
    

    var fetchSingleEvaluation = async function(val){
        var minor;
        var major;
        var total;
        var evaluationid;
        const { singleevaluations } = OperationBulletin.app.models;
        var result = await singleevaluations.find({where: {'defectId': val}})
        // console.log(result)
        minor = result[0].minor;
        major = result[0].major;
        total = result[0].total;
        evaluationid = result[0].id;

        return Promise.resolve({evaluationid, minor, major, total});

    }

    OperationBulletin.modulesInOrder = (orderId, cb) =>{
        var obj = {};
        fetchOperationBulletin(orderId).then(res =>{
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

};
