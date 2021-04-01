'use strict';

module.exports = function(Line) {
    Line.beforeRemote("create", function (ctx, sa, next) {
        fetchLine(ctx.req.body.number).then(r => {
            //console.log(r.length);           or
            console.log(ctx.req.body.number);
            // throw Error("Iot device id already exist")
            if(r.length > 0) next(new Error(' =======> duplicate line is detected'))
            else {
            next()
            }
        }).catch(e => {
          console.log(e)
  })

      });

      var fetchLine = async function(linex){
        var data = await Line.find( { where: { number: linex }})
        return Promise.resolve(data); 
      }

};
