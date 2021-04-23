
'use strict';

const order = require("./order");

module.exports = function (ScannedOrderStatus) {

    var getSingleOrderSpecification = async function (typesOfColor, label, OrderId) {
        var result = [];
        for (let i = 0; i < typesOfColor.length; i++) {
            var colorHolder = [];
            colorHolder.push(typesOfColor[i]);

            for (let g = 0; g < label.length; g++) {
                var labelAndOthersHolder = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                labelAndOthersHolder[0] = label[g];

                const { Order } = ScannedOrderStatus.app.models
                var query = { fields: ['data'], where: { id: OrderId } }

                await Order.find(query).then(result => {
                    for (let k = 0; k < result[0].__data.data.length; k++) {
                        for (let j = 0; j < result[0].__data.data[i].__data.colors.length; j++) {
                            if (result[0].__data.data[k].__data.size === label[g] && result[0].__data.data[k].__data.colors[j].color === typesOfColor[i]) {
                                labelAndOthersHolder[1] = parseInt(result[0].__data.data[k].__data.colors[j].value);
                                break;
                            }

                        }
                    }
                });

                query = { fields: ['type', 'from', 'to'], where: { OrderId: OrderId, color: typesOfColor[i], label: label[g] } }
                await ScannedOrderStatus.find(query).then(result => {
                    for (var k in result) {
                        if (result[k].__data.type === "ci") labelAndOthersHolder[2] += ((parseInt(result[k].__data.to) - parseInt(result[k].__data.from) + 1));
                        else if (result[k].__data.type === "co") labelAndOthersHolder[3] += ((parseInt(result[k].__data.to) - parseInt(result[k].__data.from) + 1));
                        else if (result[k].__data.type === "si") labelAndOthersHolder[4] += ((parseInt(result[k].__data.to) - parseInt(result[k].__data.from) + 1));
                        else if (result[k].__data.type === "so") labelAndOthersHolder[5] += ((parseInt(result[k].__data.to) - parseInt(result[k].__data.from) + 1));
                        else if (result[k].__data.type === "fi") labelAndOthersHolder[6] += ((parseInt(result[k].__data.to) - parseInt(result[k].__data.from) + 1));
                        else if (result[k].__data.type === "fo") labelAndOthersHolder[7] += ((parseInt(result[k].__data.to) - parseInt(result[k].__data.from) + 1));
                        else if (result[k].__data.type === "pi") labelAndOthersHolder[8] += ((parseInt(result[k].__data.to) - parseInt(result[k].__data.from) + 1));
                        else if (result[k].__data.type === "po") labelAndOthersHolder[9] += ((parseInt(result[k].__data.to) - parseInt(result[k].__data.from) + 1));
                    }
                });
                colorHolder.push(labelAndOthersHolder);
            }
            result.push(colorHolder)
        }
        return result;
    }

    ScannedOrderStatus.singleOrderStausData = (OrderId, cb) => {
        var typesOfColor = [];
        var label = [];

        var query = { where: { OrderId: OrderId } }

        ScannedOrderStatus.find(query).then(resp => {
            //get color list without duplicate
            for (let g = 0; g < resp.length; g++) {
                var colorExist = 0;
                for (let i = 0; i < typesOfColor.length; i++) {
                    if (typesOfColor[i] === resp[g].__data.color) {
                        colorExist = 1;
                        break;
                    } else
                        colorExist = 0;
                }
                if (colorExist === 0)
                    typesOfColor.push(resp[g].__data.color);
            }

            //get list labels of each color
            for (let i = 0; i < typesOfColor.length; i++) {
                label = [];
                for (let g = 0; g < resp.length; g++) {
                    if (resp[g].__data.color === typesOfColor[i]) {
                        var labelExist = 0;
                        for (let i = 0; i < label.length; i++) {
                            if (label[i] === resp[g].__data.label) {
                                labelExist = 1;
                                break;
                            } else
                                labelExist = 0;
                        }
                        if (labelExist === 0) {
                            label.push(resp[g].__data.label);
                        }
                    }
                }
            }

            getSingleOrderSpecification(typesOfColor, label, OrderId).then(result => {
                cb(null, result);
            });
        });
    }

    ScannedOrderStatus.remoteMethod("singleOrderStausData", {
        description: "Get single order status using an orderid",
        accepts: { arg: "OrderId", type: "string" },
        returns: { type: "object", root: true },
        http: { verb: "get", path: "/singleOrderStausData" }
    });

    var getIndividualBundles = async function (typesOfColor, label, OrderId) {
        var result = [];
        for (let i = 0; i < typesOfColor.length; i++) {
            var bundleCounterHolder = [];
            bundleCounterHolder.push(typesOfColor[i]);

            for (let g = 0; g < label.length; g++) {
                var bundleHolder = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                bundleHolder[0] = label[g];

                const { Order } = ScannedOrderStatus.app.models
                var query = { fields: ['data'], where: { id: OrderId } }

                query = { fields: ['type'], where: { OrderId: OrderId, color: typesOfColor[i], label: label[g] } }
                await ScannedOrderStatus.find(query).then(result => {
                    for (var k in result) {
                        if (result[k].__data.type === "ci") bundleHolder[1] += 1;
                        else if (result[k].__data.type === "co") bundleHolder[2] += 1;
                        else if (result[k].__data.type === "si") bundleHolder[3] += 1;
                        else if (result[k].__data.type === "so") bundleHolder[4] += 1;
                        else if (result[k].__data.type === "fi") bundleHolder[5] += 1;
                        else if (result[k].__data.type === "fo") bundleHolder[6] += 1;
                        else if (result[k].__data.type === "pi") bundleHolder[7] += 1;
                        else if (result[k].__data.type === "po") bundleHolder[8] += 1;

                    }
                });
                bundleCounterHolder.push(bundleHolder);
            }
            // console.log(bundleCounterHolder)
            result.push(bundleCounterHolder)
        }
        return result;
    }

    ScannedOrderStatus.bundlesStatusInOrder = (OrderId, cb) => {
        var typesOfColor = [];
        var label = [];

        var query = { where: { OrderId: OrderId } }

        ScannedOrderStatus.find(query).then(resp => {
            //get color list without duplicate
            for (let g = 0; g < resp.length; g++) {
                var colorExist = 0;
                for (let i = 0; i < typesOfColor.length; i++) {
                    if (typesOfColor[i] === resp[g].__data.color) {
                        colorExist = 1;
                        break;
                    } else
                        colorExist = 0;
                }
                if (colorExist === 0)
                    typesOfColor.push(resp[g].__data.color);
            }

            //get list labels of each color
            for (let i = 0; i < typesOfColor.length; i++) {
                label = [];
                for (let g = 0; g < resp.length; g++) {
                    if (resp[g].__data.color === typesOfColor[i]) {
                        var labelExist = 0;
                        for (let i = 0; i < label.length; i++) {
                            if (label[i] === resp[g].__data.label) {
                                labelExist = 1;
                                break;
                            } else
                                labelExist = 0;
                        }
                        if (labelExist === 0) {
                            label.push(resp[g].__data.label);
                        }
                    }
                }
            }

            getIndividualBundles(typesOfColor, label, OrderId).then(result => {
                // console.log(result)
                cb(null, result);
            });
        });
    }

    ScannedOrderStatus.remoteMethod("bundlesStatusInOrder", {
        description: "Get single order status using an orderid",
        accepts: { arg: "OrderId", type: "string" },
        returns: { type: "object", root: true },
        http: { verb: "get", path: "/bundlesStatusInOrder" }
    });

    // Scannedorderstatus.afterRemote("create", function (ctx, _, next) {
    //     const { PackingList } = Scannedorderstatus.app.models;
    //     PackingList.find({
    //         where: { orderNumber: ctx.body.orderNumber },
    //     }, function (err, res) {
    //         console.log(res)
    //     });
    //     console.log("before create")
    //     next();
    // })

    ScannedOrderStatus.deleteAll = (cb) => {
        try {
            ScannedOrderStatus.find({}, (err, res) => {
                cb(null, res)
            })
        }
        catch (error) {
            throw new Error("Internal server error try again");
        }
    }

    ScannedOrderStatus.remoteMethod("deleteAll", {
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

    var fetchScannedOrderStatus = async function (val) {
        var data = await ScannedOrderStatus.find({ where: { id: val } })
        // console.log(data);
        return Promise.resolve(data);
    }

    var updateScannedOrderStatus = async function (bndlid, status) {
        await ScannedOrderStatus.findById(bndlid, function (err, instance) {
            if (err) {
                //skip
            }
            else {
                instance.updateAttributes({ type: status });
            }
        });
    }

    var registerBundleHistory = async function (currentStatus, newStatus, cleandate, lineNumber, bundleid) {
        const { BundleHistory } = ScannedOrderStatus.app.models;
        await BundleHistory.create([{ oldStatus: currentStatus, newStatus: newStatus, date: cleandate, lineNumber: lineNumber, scannedOrderStatusId: bundleid }]);
    }

    ScannedOrderStatus.changeBundleStatus = (bundleid, action, linenum, cb) => {

        fetchScannedOrderStatus(bundleid).then(res => {
            // console.log(res)
            let currentStatus = res[0].type;
            let newStatus = '';
            let lineNumber = linenum;

            // if(action == 'f' && currentStatus == 'po'){
            //     console.log("Can't step up!")
            // }
            // if(action == 'b' && currentStatus == 'ci'){
            //     console.log("Can't step down!")
            // }

            if (action == 'f') {
                switch (currentStatus) {
                    case "ci":
                        newStatus = "co";
                        break;
                    case "co":
                        newStatus = "si";
                        break;
                    case "si":
                        newStatus = "so";
                        break;
                    case "so":
                        newStatus = "fi";
                        break;
                    case "fi":
                        newStatus = "fo";
                        break;
                    case "fo":
                        newStatus = "pi";
                        break;
                    case "pi":
                        newStatus = "po";
                        break;
                }
            }
            else if (action == 'b') {
                switch (currentStatus) {

                    case "co":
                        newStatus = "ci";
                        break;
                    case "si":
                        newStatus = "co";
                        break;
                    case "so":
                        newStatus = "si";
                        break;
                    case "fi":
                        newStatus = "so";
                        break;
                    case "fo":
                        newStatus = "fi";
                        break;
                    case "pi":
                        newStatus = "fo";
                        break;
                    case "po":
                        newStatus = "pi";
                        break;
                }
            }
            // update ScannedOrderStatus with the new status
            updateScannedOrderStatus(bundleid, newStatus);

            // register a new bundle history with the provided data.
            // i.e. currentStatus, newStatus, date, lineNumber, bundleId

            var dt = new Date();
            var isoFormat = dt.toISOString();
            var substringedDt = isoFormat.substr(0, 19);
            var cleandate = substringedDt.replace('T', ' ');

            registerBundleHistory(currentStatus, newStatus, cleandate, lineNumber, bundleid);

        })
    };

    ScannedOrderStatus.remoteMethod("changeBundleStatus", {
        description: "Get the quantity of the garment processed in a given date on the three statuses si, fi and pi",
        accepts: [
            {
                arg: "scannedOrderStatusId",
                type: "string",
                required: true
            },
            {
                arg: "action",
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
            verb: "post",
            path: "/changeBundleStatus"
        }
    });

}

