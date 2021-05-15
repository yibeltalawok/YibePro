'use strict'
module.exports = function (Iot) {
  Iot.beforeRemote('create', function (ctx, sa, next) {
    let date = new Date()
    ctx.req.body.lastmodified = date.toString()
    fetchIoT(ctx.req.body.iotid)
      .then((r) => {
        console.log(r.length)
        // throw Error("Iot device id already exist")
        if (r.length > 0) next(new Error(' =======> duplicate Iot id detected'))
        else {
          next()
        }
      })
      .catch((e) => {
        console.log(e)
      })
  })

  var fetchIoT = async function (idx) {
    var data = await Iot.find({ where: { iotid: idx } })
    return Promise.resolve(data)
  }
}
