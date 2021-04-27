'use strict';
var pubsub = require('../../server/pubsub.js');
  var loopback = require('loopback');
  
module.exports = function(BundleHistory) {
  BundleHistory.observe('after save', function (ctx, next) {
          //Now publishing the data..
          var socket = BundleHistory.app.io;
          pubsub.publish(socket, {
              collectionName: 'BundleHistory',
              data: ctx.instance,
              method: 'POST'
          });
          //Calling the next middleware..
          next();
      });
  

    let fetchBunleHistory = async function(dt){
        let garmentQuantity = 0;
        const { ScannedOrderStatus } = BundleHistory.app.models;
      
        let res = await BundleHistory.find({where: {and: [{date: {like: dt}}, {newStatus:"so"}]} });
        // console.log(res)
        for (let i = 0; i < res.length; i++) {
            let bundleid = res[i].scannedOrderStatusId;
            // console.log(bundleid)

            // fetch bundle using the bundleid
           
            let result = await ScannedOrderStatus.find({where: {id: bundleid}});
            // console.log(rs)
            for (let j = 0; j < result.length; j++) {
                let from = result[j].from;
                let to = result[j].to

                // console.log(from);
                // console.log(to)

                garmentQuantity += (to - from) + 1
                
            }
            
        }

        // console.log(garmentQuantity)
        
        return Promise.resolve(garmentQuantity); 
    }

    let fetchGarmentByLine = async function(dt, ln){
      let quantity = 0;
      const { ScannedOrderStatus } = BundleHistory.app.models;
      
        let res = await BundleHistory.find({where: {and: [{date: {like: dt}},{lineNumber: ln}, {newStatus:"so"}]} });
        // console.log(res);
        for (let i = 0; i < res.length; i++) {
          let bundleid = res[i].scannedOrderStatusId;
          // console.log(bundleid)

          // fetch bundle using the bundleid
         
          let result = await ScannedOrderStatus.find({where: {id: bundleid}});
          // console.log(rs)
          for (let j = 0; j < result.length; j++) {
              let from = result[j].from;
              let to = result[j].to

              // console.log(from);
              // console.log(to)

              quantity += (to - from) + 1
              
          }
          
        }

        // console.log(quantity)
        
        return Promise.resolve(quantity); 

    }

    BundleHistory.garmentsByDate = (date, cb) =>{
        fetchBunleHistory(date).then(res =>{
            // console.log(res)
            cb(null, res)
        })
    },

    BundleHistory.garmentsByLine = (date, line, cb) =>{
      fetchGarmentByLine(date, line).then(res =>{
        // console.log(res)
        cb(null, res)
      })
    }

    BundleHistory.remoteMethod("garmentsByDate", {
      description: "Get the quantity of the garment processed in a given date on the three statuses si, fi and pi",
      accepts: [{
        arg: "date",
        type: "string",
        required: true
      },
      ],
  
      returns: {
        type: "object",
        root: true
      },
      http: {
        verb: "get",
        path: "/garmentsByDate"
      }
  
    });
    BundleHistory.remoteMethod("garmentsByLine", {
      description: "Get the quantity of the garment processed in a given date on the three statuses si, fi and pi",
      accepts: [{
        arg: "date",
        type: "string",
        required: true
        },
        {
        arg: "lineNumber",
        type: "string",
        required: true
        },
      ],
  
      returns: {
        type: "object",
        root: true
      },
      http: {
        verb: "get",
        path: "/garmentsByLine"
      }
  
    });

    BundleHistory.remoteMethod("getTotals", {
      description: "Get date specific Total Orders, Total Sewings, Total Cuttings, Total finshings",
  
      accepts: [{
        arg: "date",
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
        path: "/getTotals"
      }
    });
  
    BundleHistory.getTotals = (
      date,
      cb
    ) => {
      var totals = [];
      var sewing = 0;
      var cutting = 0;
      var finishing = 0;
      BundleHistory.find({
        where: { date: {like: date} },
      }).then( res => {
        //console.log(res.length);
        res.forEach(item => {
          // console.log("====new suff======")
          // console.log(item.__data.newStatus)
          item = item.__data.newStatus;
          //console.log(item);
          switch (item) {
            case 'so':
              sewing+=1;
              break;
            case 'co':
              cutting+=1;
              break;
            case 'fo':
              finishing+=1;
              break;
            default:
              break;
          }
        });
        totals.push(sewing, cutting, finishing);
        // console.log(totals)
        cb(null, totals)
      })
    }

    BundleHistory.getTodayBundleHistoryAll = (date, cb)=>{
      var data = {ci: 0, co: 0, si: 0, so: 0, fi: 0, fo: 0, pi: 0, po: 0, };

      var filter = {include: ['ScannedOrderStatus'], where: {date: {like: date}}};
      BundleHistory.find(filter).then(res=>{
        for(var i=0; i<res.length;i++){
          if(res[i].__data.newStatus === "ci") data.ci += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "co") data.co += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "si") data.si += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "so") data.so += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "fi") data.fi += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "fo") data.fo += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "pi") data.pi += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "po") data.po += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
        }
        cb(null, data)
      });
    }
    BundleHistory.remoteMethod("getTotalad", {
      description: "Get date specific Total Amount Done per line",
  
      accepts: [{
        arg: "date",
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
        path: "/getTotalad"
      }
    });
  
    BundleHistory.getTotalad = (
      date,
      cb
    ) => {
      var data = [];
      BundleHistory.find({where: { date: {like: date}, newStatus: 'so' },}).then( res => {
        var distlineNumber = [];
        var existlineNumber = 0;

      for (let i = 0; i < res.length; i++) {
        for (let l = 0; l < distlineNumber.length; l++) {
          if(res[i].lineNumber === distlineNumber[l]){
            existlineNumber =1;
            break;
          }else existlineNumber = 0;
        }
        if(existlineNumber === 0)
          distlineNumber.push(res[i].lineNumber);
      }

      for (let l = 0; l < distlineNumber.length; l++) {
        var counter = 0;
        for (let i = 0; i < res.length; i++) {
          if(distlineNumber[l] === res[i].lineNumber)
            counter += 1;
        }

        data.push({line: distlineNumber[l], totalad: counter});
      }

        cb(null, data)
      })

      
    }

    BundleHistory.getTodayBundleHistoryAll = (date, cb)=>{
      var data = {ci: 0, co: 0, si: 0, so: 0, fi: 0, fo: 0, pi: 0, po: 0, };

      var filter = {include: ['ScannedOrderStatus'], where: {date: {like: date}}};
      BundleHistory.find(filter).then(res=>{
        for(var i=0; i<res.length;i++){
          if(res[i].__data.newStatus === "ci") data.ci += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "co") data.co += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "si") data.si += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "so") data.so += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "fi") data.fi += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "fo") data.fo += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "pi") data.pi += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
          else if(res[i].__data.newStatus === "po") data.po += (parseFloat(res[i].__data.ScannedOrderStatus.__data.to)-parseFloat(res[i].__data.ScannedOrderStatus.__data.from) +1)
        }
        cb(null, data)
      });
    }

    BundleHistory.remoteMethod("getTodayBundleHistoryAll", {
      description: "Get date specific bundle history",
  
      accepts: {arg: "date", type: "string", required: true},
  
      returns: {type: "object", root: true },
  
      http: {
        verb: "get",
        path: "/getTodayBundleHistoryAll"
      }
    });

    BundleHistory.remoteMethod("getTodayBundleHistoryAll", {
      description: "Get date specific bundle history",
  
      accepts: {arg: "date", type: "string", required: true},
  
      returns: {type: "object", root: true },
  
      http: {
        verb: "get",
        path: "/getTodayBundleHistoryAll"
      }
    });

};
