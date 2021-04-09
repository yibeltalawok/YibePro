'use strict';

module.exports = function (Order) {

  Order.deleteAll = (cb) => {
    try {
      Order.find({}, (err, res) => {
        cb(null, res)
      })
    } catch (error) {
      throw new Error("Internal server error try again");
    }
  }
  Order.remoteMethod("deleteAll", {
    description: "Delete all orders",
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



  // =================  ======================
  var fetchScannedOrderStatus = async function (val) {
    const { ScannedOrderStatus } = Order.app.models
    var data = await ScannedOrderStatus.find({ where: { OrderId: val } })
    return Promise.resolve(data);
  }

  var filterBunleData = async function (id, size, col) {
    const { ScannedOrderStatus } = Order.app.models
    var data = await ScannedOrderStatus.find({ where: { OrderId: id, label: size, color: col } })
    return Promise.resolve(data);
  }


  Order.getScanSummaryofanOrder = (
    orderid,
    cb
  ) => {

    fetchScannedOrderStatus(orderid).then(res => {
      var finalval = {
        "co": 0,
        "si": 0,
        "so": 0,
        "fi": 0,
        "fo": 0,
        "pi": 0,
        "po": 0
      }
      for (var index in res) {
        if (res[index].__data.type == "co") finalval.co += (parseInt(res[index].__data.to) - parseInt(res[index].__data.from) + 1)
        else if (res[index].__data.type == "si") finalval.si += (parseInt(res[index].__data.to) - parseInt(res[index].__data.from) + 1)
        else if (res[index].__data.type == "so") finalval.so += (parseInt(res[index].__data.to) - parseInt(res[index].__data.from) + 1)
        else if (res[index].__data.type == "fi") finalval.fi += (parseInt(res[index].__data.to) - parseInt(res[index].__data.from) + 1)
        else if (res[index].__data.type == "fo") finalval.fo += (parseInt(res[index].__data.to) - parseInt(res[index].__data.from) + 1)
        else if (res[index].__data.type == "pi") finalval.pi += (parseInt(res[index].__data.to) - parseInt(res[index].__data.from) + 1)
        else if (res[index].__data.type == "po") finalval.po += (parseInt(res[index].__data.to) - parseInt(res[index].__data.from) + 1)
      }
      cb(null, finalval)
    })

  }



  Order.remoteMethod("getScanSummaryofanOrder", {
    description: "Get scan summary of an order using an id",

    accepts: [{
      arg: "orderid",
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
      path: "/getScanSummaryofanOrder"
    }
  });


  // ================= Fetch Laysheet by orderId ======================
  var fetchLaysheetFromOrder = async function (id) {
    const { BCSheet } = Order.app.models
    var data = await BCSheet.find({
      where: { orderId: id },
      // include: "bcSheet"
    })
    return Promise.resolve(data);
  }

  var getOrderData = async function (idx) {
    var data = await Order.findById(idx);
    return Promise.resolve(data);
  }

  // To Fetch all the laysheets / CUTs under a given order
  Order.getLaysheets = (orderId, cb) => {
    var orderData;
    var orderSizes = [];

    var orderColors;
    var singleOrderColor = [];

    var tempname = [];
    var tempqty = [];

    var nameout = [];
    var qtyout = [];

    var finalname = [];
    var finalqty = [];

    var sizelabel = [];

    var children = [];
    var obj2 = {};

    var final = [];

    // To get the colors & sizes (Red, Green, Black & S, M, L) from the order.
    getOrderData(orderId).then(res => {
      orderData = res.__data.data;

      var orderQty = res.__data.quantity;
      // console.log(orderQty);

      for (let i = 0; i < orderData.length; i++) {
        orderSizes.push(orderData[i].__data.size);
        orderColors = orderData[i].__data.colors;
        // console.log(orderColors);
      }

      for (let j = 0; j < orderColors.length; j++) {
        for (let k = 0; k < 1; k++) {
          singleOrderColor.push(orderColors[j].color);
        }
      }
      // console.log(singleOrderColor);

      fetchLaysheetFromOrder(orderId).then(res => {

        if (res.length > 0) {
          for (let i = 0; i < res.length; i++) { // FOR EVERY CUT IN a single ORDER
            // var cutNo = res[i].__data.cutNo;
            // console.log(cutNo);

            var lvl1Colors = res[i].__data.colors;
            for (let j = 0; j < lvl1Colors.length; j++) { // FOR EVERY COLORs OBJECT in a single CUT, We need to find single Colors ... Red, Green, Black, ...
              var singleColor = lvl1Colors[j].__data.color; // GOT EVERY COLOR here...

              var size = lvl1Colors[j].__data.sizes;

              for (let k = 0; k < size.length; k++) { // FOR EVERY SIZEs OBJECT in a COLORs Object, we need to find the single sizes ... S, M, L, ....
                var singleSize = size[k].label; // GOT EVERY size LABELs ... S, M, L

                var quantity = size[k].qty; // GOT Every quantity under sizes ...

                tempname.push(singleColor + singleSize);
                tempqty.push(quantity);
              }

            }
          }

          // Computing total quantity for each color and each size ... Red S, Red M, Red L, Black S, ...Green L, ...
          for (let x = 0; x < tempname.length; x++) {
            // console.log(tempname[x] + "-" + tempqty[x]);
            if (nameout.indexOf(tempname[x]) == -1) {
              nameout.push(tempname[x]);
              qtyout.push(tempqty[x]);
            }
            else {
              for (let m = 0; m < nameout.length; m++) {
                if (nameout[m] == tempname[x]) {
                  qtyout[m] += tempqty[x];
                }
              }
            }
          }

          // Computing the total quantity for each individual color in an an order... RED, GREEN, BLACK, ....
          for (let i = 0; i < singleOrderColor.length; i++) {
            for (let j = 0; j < nameout.length; j++) {
              if (nameout[j].includes(singleOrderColor[i])) {
                if (finalname.indexOf(singleOrderColor[i]) == -1) { // if it is not in the finalname[] array.
                  finalname.push(singleOrderColor[i]);
                  finalqty.push(qtyout[j]);
                }
                else { // if it is already in the finalname[] array
                  for (let k = 0; k < finalname.length; k++) {
                    if (finalname[k] == singleOrderColor[i]) {
                      finalqty[k] += qtyout[j];
                    }
                  }
                }
              }

            }
          }

          // Synthesizing the Size labels, S, M, L, ...
          for (let i = 0; i < finalname.length; i++) {
            for (let j = 0; j < nameout.length; j++) {
              if (nameout[j].includes(finalname[i])) {
                // console.log(finalname[i] + " - " + nameout[j]);
                var pos = finalname[i].length;
                var lbl = nameout[j].substring(pos);
                sizelabel.push(lbl);
                // console.log(finalname[i] + "- " +nameout[j]+ " - " + sizelabel[j]); 
              }
            }

          }

          //FINAL FORMAT TO BE OUTPUTTED FOR THE CHART
          for (let i = 0; i < singleOrderColor.length; i++) {
            for (let j = 0; j < nameout.length; j++) {
              if (nameout[j].includes(singleOrderColor[i])) {
                children.push({ name: sizelabel[j], value: qtyout[j] })
              }
            }

            obj2 = {
              name: singleOrderColor[i],
              children
            }
            children = []; // Empty the children array
            final.push(obj2);
          }
        }
        cb(null, final)


      })

    })

  }

  Order.remoteMethod("getLaysheets", {
    description: "Get the laysheets under an order using an id",
    accepts: [{
      arg: "orderId",
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
      path: "/getLaysheets"
    }

  });

  // This is to fetch bundles based on size, color under a given order.
  Order.bundlesCountInProcess = (orderId, size, color, cb) => {
    var ciTotal = 0;
    var coTotal = 0;
    var siTotal = 0;
    var soTotal = 0;
    var fiTotal = 0;
    var foTotal = 0;
    var piTotal = 0;
    var poTotal = 0;
    var label = 'X';
    var data = {};
    var arr = [];

    filterBunleData(orderId, size, color).then(res => {
      for (let i = 0; i < res.length; i++) {
        var status = res[i].type
        switch (status) {
          case 'ci':
            ciTotal++;
            break;
          case 'co':
            coTotal++;
            break;
          case 'si':
            siTotal++;
            break;
          case 'so':
            soTotal++;
            break;
          case 'fi':
            fiTotal++;
            break;
          case 'fo':
            foTotal++;
            break;
          case 'pi':
            piTotal++;
            break;
          case 'po':
            poTotal++;
            break;

        }
      }

      data = { 'ci': ciTotal, 'co': coTotal, 'si': siTotal, 'so': soTotal, 'fi': fiTotal, 'fo': foTotal, 'pi': piTotal, 'po': poTotal }
      arr.push(data)
      var final = { data: arr }
      cb(null, final)
    })

  }

  // TODO needs a comment @abebe ?
  Order.bundlesCount = (orderId, cb) => {
    var cin = 0;
    var cout = 0;
    var sin = 0;
    var sout = 0;
    var fin = 0;
    var fout = 0;
    var pin = 0;
    var pout = 0;
    var data = {};
    var arr = [];
    fetchScannedOrderStatus(orderId).then(res => {

      for (let i = 0; i < res.length; i++) {
        var status = res[i].type
        switch (status) {
          case 'ci':
            cin++;
            break;
          case 'co':
            cout++;
            break;
          case 'si':
            sin++;
            break;
          case 'so':
            sout++;
            break;
          case 'fi':
            fin++;
            break;
          case 'fo':
            fout++;
            break;
          case 'pi':
            pin++;
            break;
          case 'po':
            pout++;
            break;
        }
      }

      data = { 'ci': cin, 'co': cout, 'si': sin, 'so': sout, 'fi': fin, 'fo': fout, 'pi': pin, 'po': pout }
      arr.push(data)
      var final = { data: arr }
      cb(null, final)
    })
  }

  Order.remoteMethod("bundlesCountInProcess", {
    description: "Get the bundle count under a given order & filter by size, color and status",
    accepts: [{
      arg: "orderId",
      type: "string",
      required: true
    },
    {
      arg: "size",
      type: "string",
      required: true
    },
    {
      arg: "color",
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
      path: "/bundlesCountInProcess"
    }

  });

  Order.remoteMethod("bundlesCount", {
    description: "Get the bundle count under a given order & filter by size, color and status",
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
      path: "/bundlesCount"
    }

  });


  var getListOfBundleInSingleOrderDetailed = async function (query, result, returnableData) {
    const { ScannedOrderStatus } = Order.app.models
    var l = returnableData.length;
    returnableData.push({ bundle: '', size: 0, ci: 0, co: 0, si: 0, so: 0, fi: 0, fo: 0, pi: 0, po: 0 });

    returnableData[l].bundle = result.__data.cutNo;
    returnableData[l].size = result.__data.bQty;


    await ScannedOrderStatus.find(query).then(res => {
      for (var j = 0; j < res.length; j++) {
        if (res[j].type == "ci") returnableData[l].ci += 1;
        else if (res[j].type == "co") returnableData[l].co += 1;
        else if (res[j].type == "si") returnableData[l].si += 1;
        else if (res[j].type == "so") returnableData[l].so += 1;
        else if (res[j].type == "fi") returnableData[l].fi += 1;
        else if (res[j].type == "fo") returnableData[l].fo += 1;
        else if (res[j].type == "pi") returnableData[l].pi += 1;
        else if (res[j].type == "po") returnableData[l].po += 1;
      }
    });
  }

  var getListOfCutsInSingleOrder = async function (orderid, cb) {
    var returnableData = [];
    const { BCSheet } = Order.app.models
    //fetch distinict cuts from single order.

    var query = { fields: ['cutNo', 'bQty', 'id'], where: { orderId: orderid } };
    await BCSheet.find(query).then(result => {
      for (var i in result) {
        query = { fields: ['type'], where: { bCSheetId: result[i].id } };
        getListOfBundleInSingleOrderDetailed(query, result[i], returnableData).then(() => {
          if (result.length === returnableData.length) {
            cb(null, returnableData);
          }
        });
      }
    });
  }

  Order.getScanSummaryofanOrderSingle = (
    orderid,
    cb
  ) => {

    getListOfCutsInSingleOrder(orderid, cb).then(result => {

    });
  }

  Order.remoteMethod("getScanSummaryofanOrderSingle", {
    description: "Get individual bundle summary of an order using an OrderId",

    accepts: [{
      arg: "orderid",
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
      path: "/getScanSummaryofanOrderSingle"
    }
  });



};
