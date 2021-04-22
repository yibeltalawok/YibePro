'use strict';
var pubsub = require('../../server/pubsub.js');
var loopback = require('loopback');
module.exports = function(Line) {

  Line.observe('after save', function (ctx, next) {
    var socket = Line.app.io;
    if(ctx.isNewInstance){
        //Now publishing the data..
        pubsub.publish(socket, {
            collectionName : 'Line',
            data: ctx.instance,
            method: 'POST'
        });
    }else{
        //Now publishing the data..
        pubsub.publish(socket, {
            collectionName : 'Line',
            data: ctx.instance,
            modelId: ctx.instance.id,
            method: 'PUT'
        });
    }
    console.log("=====================================")
    console.log("pushed")
    console.log("=====================================")
    //Calling the next middleware..
    next();
});


Line.deleteAll = (cb) => {
  try {
    Line.find({}, (err, res) => {
      cb(null, res)
    })
  } catch (error) {
    throw new Error("Internal server error try again");
  }
}
Line.remoteMethod("deleteAll", {
  description: "Delete all Productionhistory",
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


  //   Line.beforeRemote("create", function (ctx, sa, next) {
  //       fetchLine(ctx.req.body.number).then(r => {
  //           //console.log(r.length);           or
  //           console.log(ctx.req.body.number);
  //           // throw Error("Iot device id already exist")
  //           if(r.length > 0) next(new Error(' =======> duplicate line is detected'))
  //           else {
  //           next()
  //           }
  //       }).catch(e => {
  //         console.log(e)
  // })

  //     });

      var fetchLine = async function(linex){
        var data = await Line.find( { where: { number: linex }})
        return Promise.resolve(data); 
      }

};
