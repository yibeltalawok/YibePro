'use strict';
var Promise = require('bluebird');

module.exports = function(Efficiency) {
  // A remote methode to return the total sewing out pieces in a given date 
  // This is used as a part of Efficiency calculation
    Efficiency.totalSoLinewise =  (
      date,
      cb
        ) => {
        const { ScannedOrderStatus } = Efficiency.app.models;
        // Type "so" means the Sewing Out from the list
        ScannedOrderStatus.find({
            where: { type: "so", date: {like: date}},
        }, async function (_, res) {
          console.log(res)
            var flist = [];
            var line = []
            for ( var i  = 0; i < res.length ; i++) {
                var idx = line.indexOf(res[i].__data.line)
                if( idx == -1 ){  
                  console.log(res[i].__data.orderId)              
                    var tempobj = {
                      line: parseInt(res[i].__data.line),
                      totalso: parseInt(res[i].__data.to) - parseInt(res[i].__data.from) + 1,
                      orderId: res[i].__data.orderId,
                  }
                  flist.push(tempobj)
                  line.push(res[i].__data.line)
                }
                else {
                  flist[idx].totalso += (parseInt(res[i].__data.to) - parseInt(res[i].__data.from) + 1)
                }    
            }
            cb(null, flist)
        });
        };
    // ================= Fetch Opperation bulletins using Order Id ======================
        var fetchOpnBulltn = async function(idx){
          const { OperationBulletin } = Efficiency.app.models
          var data = await OperationBulletin.find( { where: { orderId: idx }})
          return Promise.resolve(data); 
        }

      
  // ================= Fetch Opperations using Order Operation Bulletin id ======================
        var fetchOperation = async function(val) {
          const { Operation} = Efficiency.app.models
          // sewing sam is caluclated for operation with type or category "O" or means Opperator
              var data = await Operation.find({ where: {oprBltnId: val.id }})
              return Promise.resolve(data);   
        }

// Function to fetch Total sewing SAM when a list of orderIDs are given
        Efficiency.samPerOrderId = ( 
          orderids,
          cb
        ) => {
          var mainlist = [];
        // Iterate through the given list from the API call
          for(var k = 0; k < orderids.length; k++){
             fetchOpnBulltn(orderids[k])
                .then(oppbult => {
                  
                    fetchOperation(oppbult[0].__data).then((ret) => {
                      
                        var sam = 0;
                        var mpalc = 0.0;
                        // Calculate sam and push it to the list
                        for (var i = 0; i < ret.length; i++){
                          console.log(ret[i].__data.sam)
                          if (ret[i].__data.category == "O")
                              sam += parseFloat(ret[i].__data.sam)
                          mpalc += parseFloat(ret[i].__data.mpAllocated)
                        }

                        mainlist.push({
                          orderId: oppbult[0].orderId,
                          sam: sam,
                          mpAllocated: mpalc
                        })

                        // Return if the list is equal in length // Used also because the return type was unable to return a promise
                        if(mainlist.length == orderids.length) cb(null, mainlist)

              })
              .catch(err => {
                console.log(err)
              })
            })
            .catch(err => {
              console.log(err)
            })
        }
        }
  
        Efficiency.remoteMethod("totalSoLinewise", {
          description: "Get the total Sewing out opperation for every line",

          accepts: [{
            arg: "date",
            type:"string",
            required: true
          },
          ],

          returns: {
              type: [
                "object"
              ],
              root: true
            },
          
          http: {
            verb: "get",
            path: "/totalSoLinewise"
          }
        });

        Efficiency.remoteMethod("samPerOrderId", {
          description: "Get the total Sewing Sam for every OrderNumber",
          accepts: [{
            arg: "orderids",
            type:["string"],
            required: true
          },
          ],
          returns: {
              type: [
                "object"
              ],
              root: true
            },
          
          http: {
            verb: "get",
            path: "/samPerOrderId"
          }
        });


        Efficiency.formattedEfficiency = ( 
          startDate,
          endDate,
          cb
        ) => {
          let data = []
          Efficiency.find({ 
            where: {
              date: {
                  between: [startDate, endDate],
              },
            },
          }).then(res => {
            res.forEach(item => {
              item = item.__data;
              let line = item.line;
              let date = item.date;
              let efficiency = item.efficiency;

              const found = data.some(el => el.line == `${line}`)
              if(found) {
                data.forEach(i => {
                  if(i.line === line){
                    i.eff.push({date, efficiency})
                  }
                })


                
              }
              else {
                let eff = [{date, efficiency}];
                data.push({line, eff});
              } 
            });
            cb(null, data)
          });
        }
  
        
        Efficiency.remoteMethod("formattedEfficiency", {
          description: "Get formatted efficiency suitable for charts",
          accepts: [{
            arg: "startDate",
            type:"string",
            required: true
          },
          {
            arg: "endDate",
            type:"string",
            required: true
          },
          ],
          returns: {
              type: [
                "object"
              ],
              root: true
            },
          
          http: {
            verb: "post",
            path: "/formattedEfficiency"
          }
        });


};
