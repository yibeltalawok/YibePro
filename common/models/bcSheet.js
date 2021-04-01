module.exports = function (BCSheet) {

    BCSheet.deleteAll = (cb) => {
        try {
            BCSheet.find({}, (err, res) => {
            cb(null, res)
          })
        } catch (error) {
          throw new Error("Un able to delete all laysheets Internal server error try again");
        }
      }
      BCSheet.remoteMethod("deleteAll", {
        description: "Delete all Laysheets",
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

    BCSheet.generateQrCode = (
        laysheetId, cb) => {

        try {
            let item = []
            let filter = {
                where: { id: laysheetId },
                include: ["order"],
            };
            BCSheet.find(filter, async function (err, res) {
                arr = res[0].__data.colors
                let nRows = parseInt(res[0].__data.noOfBundle);
                let bQ = parseInt(res[0].__data.bQty);
                let rSum = 0;
                let cnRows = 0;
                let count = 0;
                let iterator = 0;
                for (let index = 0; index < arr.length; index++) {
                    for (let i = 0; i < arr[index].__data.sizes.length; i++) {
                        for (let j = 1; j <= arr[index].sizes[i].nB; j++) {
                            rSum =
                                j < arr[index].__data.sizes[i].nB
                                    ? nRows * bQ
                                    : arr[index].__data.sizes[i].qty -
                                    nRows * bQ * (arr[index].__data.sizes[i].nB - 1);
                            cnRows = j < arr[index].__data.sizes[i].nB ? nRows : rSum / bQ;
                            iterator = j - 1;
                            item.push({
                                label: arr[index].__data.sizes[i].label,
                                val: { count: count + j, iterator: iterator },
                                nb: parseInt(Math.ceil(cnRows)),
                                rSum: rSum,
                                tQ: bQ,
                                cardCounter: j - 1,
                                color: arr[index].__data.color
                            });
                        }
                        iterator = 0;
                        count += arr[index].__data.sizes[i].nB;
                    }
                }
                allItems(item).then(item => {
                    cb(null, item)
                }).catch(e => {
                        console.log(e)
                })

            })
            const allItems = async function (item) {
                let arr = item;
                let count = 0;
                let a = [];
                let vals = [];
                let nums = [];
                let temp = 0;
                let from = 0;
                // let fromCount = 1;
                let to = 0;
                for (let i = 0; i < arr.length; i++) {
                    for (let j = 0; j < arr[i].nb; j++) {
                        count = j == 0 && arr[i].cardCounter == 0 ? 0 : count;
                        temp =
                            j < arr[i].nb - 1
                                ? arr[i].tQ
                                : arr[i].rSum - (arr[i].nb - 1) * arr[i].tQ;
                        from = (count + j) * arr[i].tQ + 1;
                        to = from - 1 + temp;
                        a[j] = {
                            count: count + j + 1,
                            bq: temp,
                            from: from,
                            to: to,
                            cardCounter: arr[i].cardCounter,
                            bundleCounter: count + j,
                            tktElement: j == 0 && arr[i].cardCounter == 0 ? "first" : "other",
                        };
                    }
                    count += arr[i].nb;
                    while (a.length) nums = a.splice(a, arr[i].nb);
                    vals.push({
                        label: arr[i].label,
                        color: arr[i].color,
                        val: arr[i].val,
                        No: nums,
                        rSum: arr[i].rSum,
                        nb: arr[i].nb,
                    });
                }
                return Promise.resolve(vals)
            }

        }
        catch {
            throw new Error("Internal server error try again");
        }
    }
    BCSheet.remoteMethod("generateQrCode", {
        description: "Genarate Qr code",
        accepts: {
            arg: "laysheetId",
            type: "string"
        },
        returns: {
            type: ['object'],
            root: true
        },
        http: {
            verb: "post",
            path: "/getQrCode"
        }

    })

    // ================= Fetch Order related to the laysheet ======================
    var fetchOrder = async function(idx){
        const { Order } = BCSheet.app.models
        var data = await Order.findById(idx);
        // console.log(data.styleName);
        return Promise.resolve(data);
    }

    // ================= Fetch Laysheet by orderId ======================
    var fetchLaysheet = async function(id) {
        var data = await BCSheet.find({ where: {orderId: id }, 
        include: "order"
        })
        return Promise.resolve(data);
    }

    BCSheet.getLaysheetBalance = (
    orderid, cb) => {
        // console.log(orderid);
        fetchLaysheet(orderid).then(res => {

            var store = []
            var tempcolors
            var tempsizes
            var final = []

            for(var i = 0; i < res.length; i++){

                tempcolors = res[i].__data.colors
                for(var j =0; j < tempcolors.length; j++){
                    tempsizes = tempcolors[j].__data.sizes
                        for(var k = 0; k < tempsizes.length; k++){
                            
                            var tempname = tempcolors[j].__data.color + "-" + tempsizes[k].label
                            var idx = store.indexOf(tempname)
                            
                            if(idx == -1){
                                store.push(tempname)
                                final.push({
                                    name: tempname,
                                    quantity: tempsizes[k].qty,
                                    total: 0
                                })
                            } else {
                                final[idx].quantity += tempsizes[k].qty
                            }
                        
                        }
                
                }
                
            }

            fetchOrder(orderid).then( ret => {
                var maindata = ret.__data.data

                for (var i = 0; i < final.length; i++){
                    var size = final[i].name.toString().split("-")[1]
                    var color = final[i].name.toString().split("-")[0]

                    for(var j = 0; j < maindata.length; j++){

                        if(maindata[j].size == size){
                            for (var k = 0; k < maindata[j].__data.colors.length; k++ ){
                                if(maindata[j].__data.colors[k].color == color){
                                    final[i].total = maindata[j].__data.colors[k].value
                                }
                            }
                        }
                    }
                    
                }

            cb(null,final )


            })

        })
    }

    BCSheet.remoteMethod("getLaysheetBalance", {
        description: "Gnerate laysheet balance",
        accepts: {
            arg: "orderid",
            type: "string"
        },
        returns: {
            type: ['object'],
            root: true
        },
        http: {
            verb: "post",
            path: "/getLaysheetBalance"
        }

    })

};