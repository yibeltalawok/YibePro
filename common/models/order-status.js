'use strict';

module.exports = function (Orderstatus) {
    Orderstatus.weeklyReport = function (start, end, cb) {
        try {
            let startDate = new Date(start)
            let endDate = new Date(end)
            let filter = { include: ['order'], where: { date: { like: startDate.toISOString().substr(0, 7) } } }
            Orderstatus.find(filter, (err, res) => {
                if (res.length > 0) {

                    let uniqueOrder = []
                    let orderid = []
                    let color = []
                    let size = []
                    for (let i = 0; i < res.length; i++) {
                        const indexId = orderid.indexOf(res[i].__data.orderId);
                        const indexColor = color.indexOf(res[i].__data.color)
                        const indexSize = size.indexOf(res[i].__data.size)
                        if (indexId == -1 || indexColor == -1 || indexSize == -1 ||
                            indexId == indexColor && indexColor != indexSize ||
                            indexId == indexSize && indexColor != indexSize ||
                            indexId != indexSize && indexColor != indexSize) {
                            uniqueOrder.push({
                                color: res[i].__data.color, size: res[i].__data.size,
                                orderId: res[i].__data.orderId,
                                date: res[i].__data.date,
                                customer: res[i].__data.order.customer,
                                orderNumber: res[i].__data.order.orderNumber,
                                styleName: res[i].__data.order.styleName,
                                styleNumber: res[i].__data.order.styleNumber,
                                poNo: res[i].__data.order.poNo,
                                quantity: res[i].__data.order.quantity,
                            });
                            color.push(res[i].__data.color)
                            size.push(res[i].__data.size)
                            orderid.push(res[i].__data.orderId)
                        }
                    }
                    let totalCutting = []
                    let cuttingBalance = []
                    let totalSewing = []
                    let sewingBalance = []
                    let totalFinishing = []
                    let finishingBalance = []
                    let totalPacking = []
                    let packingBalance = []
                    for (let j = 0; j < uniqueOrder.length; j++) {
                        totalCutting[j] = 0
                        totalSewing[j] = 0
                        totalFinishing[j] = 0
                        totalPacking[j] = 0
                        let tCut = 0
                        let tSewI = 0
                        let tSew = 0
                        let tFinI = 0
                        let tFin = 0
                        let tPackI = 0
                        let tPack = 0
                        for (let i = 0; i < res.length; i++) {
                            let d = new Date(res[i].__data.date)
                            if (res[i].__data.orderId == uniqueOrder[j].orderId && startDate.getDate() <= d.getDate() && endDate.getDate() >= d.getDate() && res[i].__data.color == uniqueOrder[j].color && res[i].__data.size == uniqueOrder[j].size) {
                                totalCutting[j] = parseFloat(totalCutting[j]) + parseFloat(res[i].__data.cutOut)
                                tCut = tCut > parseFloat(res[i].__data.totalCutOut) ? tCut : parseFloat(res[i].__data.totalCutOut)
                                cuttingBalance[j] = parseFloat(res[i].__data.order.quantity) - parseFloat(tCut)

                                totalSewing[j] = parseFloat(totalSewing[j]) + parseFloat(res[i].__data.sewOut)
                                tSew = parseFloat(tSew) > parseFloat(res[i].__data.totalSewOut) ? tSew : parseFloat(res[i].__data.totalSewOut)
                                tSewI = parseFloat(tSewI) > parseFloat(res[i].__data.totalSewIn) ? tSewI : parseFloat(res[i].__data.totalSewIn)

                                sewingBalance[j] = parseFloat(tSewI) - parseFloat(tSew)
                                totalFinishing[j] = parseFloat(totalFinishing[j]) + parseFloat(res[i].__data.finishingOut)
                                tFin = tFin > parseFloat(res[i].__data.totalFinishingOut) ? tFin : parseFloat(res[i].__data.totalFinishingOut)
                                tFinI = tFinI > parseFloat(res[i].__data.totalFinishingIn) ? tFinI : parseFloat(res[i].__data.totalFinishingIn)

                                finishingBalance[j] = parseFloat(tFinI) - parseFloat(tFin)

                                totalPacking[j] = parseFloat(totalPacking[j]) + parseFloat(res[i].__data.packedOut)
                                tPack = tPack > parseFloat(res[i].__data.totalPackedOut) ? tPack : parseFloat(res[i].__data.totalPackedOut)
                                tPackI = tPackI > parseFloat(res[i].__data.totalPackedIn) ? tPackI : parseFloat(res[i].__data.totalPackedIn)
                                packingBalance[j] = parseFloat(tPackI) - parseFloat(tPack)

                            }
                        }
                        if (totalPacking.length == uniqueOrder.length) {
 manageData(uniqueOrder, totalCutting, cuttingBalance, totalSewing, sewingBalance, totalFinishing, finishingBalance, totalPacking, packingBalance)
                        }
                    }
                } else {
                    cb(null, [])
                }

            })
const manageData = function (res, totalCutting, cuttingBalance, totalSewing, sewingBalance, totalFinishing, finishingBalance, totalPacking, packingBalance) {
                let item = []
                for (let i = 0; i < res.length; i++) {
                    item.push({
                        date: res[i].date,
                        customer: res[i].customer,
                        size: res[i].size,
                        color: res[i].color,
                        orderId: res[i].orderId,
                        orderNumber: res[i].orderNumber,
                        styleName: res[i].styleName,
                        styleNumber: res[i].styleNumber,
                        poNo: res[i].poNo,
                        quantity: res[i].quantity,
                        totalCutting: totalCutting[i],
                        cuttingBalance: cuttingBalance[i],
                        totalSewing: totalSewing[i],
                        sewingBalance: sewingBalance[i],
                        totalFinishing: totalFinishing[i],
                        finishingBalance: finishingBalance[i],
                        totalPacking: totalPacking[i],
                        packingBalance: packingBalance[i],
                        shipment: " ",
                        shipmentDate: " "
                    })
                }
                cb(null, item)
            }
        } catch (error) {

        }
    }
    Orderstatus.remoteMethod("weeklyReport", {
        description: "Order status week report",
        accepts: [
            {
                arg: "start",
                type: "string",
                required: true
            },
            {
                arg: "end",
                type: "string",
                required: true
            }
        ],
        returns: {
            type: ['object'],
            root: true
        },
        http: {
            verb: 'post',
            path: "/weeklyReport"
        }
    })
    Orderstatus.dailyReport = function (date, cb) {
        try {
            let filter = { include: ['order'], where: { date: { like: date } } }
            Orderstatus.find(filter, (err, res) => {
                if (res.length > 0) {
                    let uniqueOrder = []
                    let orderid = []
                    let color = []
                    let size = []
                    for (let i = 0; i < res.length; i++) {
                        const indexId = orderid.indexOf(res[i].__data.orderId);
                        const indexColor = color.indexOf(res[i].__data.color)
                        const indexSize = size.indexOf(res[i].__data.size)
                        // console.log(indexId, +"   " + res[i].__data.orderId + "   " +
                        //     indexColor + "   " + res[i].__data.color + "   " +
                        //     indexSize + "   " + res[i].__data.size)
                        if (indexId == -1 || indexColor == -1 || indexSize == -1 ||
                            indexId == indexColor && indexColor != indexSize ||
                            indexId == indexSize && indexColor != indexSize || indexId != indexSize && indexColor != indexSize) {
                            uniqueOrder.push({
                                color: res[i].__data.color, size: res[i].__data.size, orderId: res[i].__data.orderId, date: res[i].__data.date,
                                customer: res[i].__data.order.customer,
                                orderNumber: res[i].__data.order.orderNumber,
                                styleName: res[i].__data.order.styleName,
                                styleNumber: res[i].__data.order.styleNumber,
                                poNo: res[i].__data.order.poNo,
                                quantity: res[i].__data.order.quantity,
                            });
                            color.push(res[i].__data.color)
                            size.push(res[i].__data.size)
                            orderid.push(res[i].__data.orderId)
                        }
                    }
                    let totalCutting = []
                    let cuttingBalance = []
                    let totalSewing = []
                    let sewingBalance = []
                    let totalFinishing = []
                    let finishingBalance = []
                    let totalPacking = []
                    let packingBalance = []
                    for (let j = 0; j < uniqueOrder.length; j++) {
                        totalCutting[j] = 0
                        totalSewing[j] = 0
                        totalFinishing[j] = 0
                        totalPacking[j] = 0
                        let tCut = 0
                        let tSewI = 0
                        let tSew = 0
                        let tFinI = 0
                        let tFin = 0
                        let tPackI = 0
                        let tPack = 0
                        for (let i = 0; i < res.length; i++) {

                            if (res[i].__data.orderId == uniqueOrder[j].orderId && res[i].__data.color == uniqueOrder[j].color && res[i].__data.size == uniqueOrder[j].size) {

                                totalCutting[j] = parseFloat(totalCutting[j]) + parseFloat(res[i].__data.cutOut)
                                tCut = tCut > parseFloat(res[i].__data.totalCutOut) ? tCut : parseFloat(res[i].__data.totalCutOut)
                                cuttingBalance[j] = parseFloat(res[i].__data.order.quantity) - parseFloat(tCut)

                                totalSewing[j] = parseFloat(totalSewing[j]) + parseFloat(res[i].__data.sewOut)
                                tSew = parseFloat(tSew) > parseFloat(res[i].__data.totalSewOut) ? tSew : parseFloat(res[i].__data.totalSewOut)
                                tSewI = parseFloat(tSewI) > parseFloat(res[i].__data.totalSewIn) ? tSewI : parseFloat(res[i].__data.totalSewIn)

                                sewingBalance[j] = parseFloat(tSewI) - parseFloat(tSew)
                                totalFinishing[j] = parseFloat(totalFinishing[j]) + parseFloat(res[i].__data.finishingOut)
                                tFin = tFin > parseFloat(res[i].__data.totalFinishingOut) ? tFin : parseFloat(res[i].__data.totalFinishingOut)
                                tFinI = tFinI > parseFloat(res[i].__data.totalFinishingIn) ? tFinI : parseFloat(res[i].__data.totalFinishingIn)

                                finishingBalance[j] = parseFloat(tFinI) - parseFloat(tFin)

                                totalPacking[j] = parseFloat(totalPacking[j]) + parseFloat(res[i].__data.packedOut)
                                tPack = tPack > parseFloat(res[i].__data.totalPackedOut) ? tPack : parseFloat(res[i].__data.totalPackedOut)
                                tPackI = tPackI > parseFloat(res[i].__data.totalPackedIn) ? tPackI : parseFloat(res[i].__data.totalPackedIn)
                                packingBalance[j] = parseFloat(tPackI) - parseFloat(tPack)

                            }
                        }
                        if (totalPacking.length == uniqueOrder.length) {
                            manageData(uniqueOrder, totalCutting, cuttingBalance, totalSewing, sewingBalance, totalFinishing, finishingBalance, totalPacking, packingBalance)
                        }
                    }
                } else {
                    cb(null, [])
                }

            })
            const manageData = function (res, totalCutting, cuttingBalance, totalSewing, sewingBalance, totalFinishing, finishingBalance, totalPacking, packingBalance) {
                let item = []
                for (let i = 0; i < res.length; i++) {
                    item.push({
                        date: res[i].date,
                        size: res[i].size,
                        color: res[i].color,
                        orderId: res[i].orderId,
                        customer: res[i].customer,
                        orderNumber: res[i].orderNumber,
                        styleName: res[i].styleName,
                        styleNumber: res[i].styleNumber,
                        poNo: res[i].poNo,
                        quantity: res[i].quantity,
                        totalCutting: totalCutting[i],
                        cuttingBalance: cuttingBalance[i],// parseFloat(res[i].__data.order.quantity) - parseFloat(totalCutting[i]),
                        totalSewing: totalSewing[i],
                        sewingBalance: sewingBalance[i],// parseFloat(totalCutting[i]) - parseFloat(totalSewing[i]),
                        totalFinishing: totalFinishing[i],
                        finishingBalance: finishingBalance[i],// parseFloat(totalSewing[i]) - parseFloat(totalFinishing[i]),
                        totalPacking: totalPacking[i],
                        packingBalance: packingBalance[i],//parseFloat(totalFinishing[i]) - parseFloat(totalPacking[i]),
                        shipment: " ",
                        shipmentDate: " "
                    })
                }
                cb(null, item)
            }
        } catch (error) {

        }
    }
    Orderstatus.remoteMethod("dailyReport", {
        description: "Order status daily report",
        accepts: {
            arg: "date",
            type: "string",
            required: true
        },
        returns: {
            type: ['object'],
            root: true
        },
        http: {
            verb: 'post',
            path: "/dailyReport"
        }
    })
    Orderstatus.deleteAll = (cb) => {
        try {
            Orderstatus.find({}, (err, res) => {
                cb(null, res)
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }
    Orderstatus.remoteMethod("deleteAll", {
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
}
