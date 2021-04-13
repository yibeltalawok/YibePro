'use strict';

module.exports = function(BundleHistory) {



    let fetchBunleHistory = async function(dt){
        let garmentQuantity = 0;
        const { ScannedOrderStatus } = BundleHistory.app.models;
      
        let res = await BundleHistory.find({where: {and: [{date: {like: dt}},{or: [{oldStatus:"si"}, {oldStatus: "fi"}, {oldStatus: "pi"}]}]} });
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
      
        let res = await BundleHistory.find({where: {and: [{date: {like: dt}},{lineNumber: ln},{or: [{oldStatus:"si"}, {oldStatus: "fi"}, {oldStatus: "pi"}]}]} });
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

};
