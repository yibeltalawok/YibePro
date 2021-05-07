'use strict';
var pubsub = require('../../server/pubsub.js');
var loopback = require('loopback');
module.exports = function (Rtfanddhu) {

    Rtfanddhu.observe('after save', function (ctx, next) {
        var socket = Rtfanddhu.app.io;
        //Now publishing the data..
        pubsub.publish(socket, {
            collectionName: 'Rtfanddhu',
            data: ctx.instance,
            method: 'POST'
        });
        //Calling the next middleware..
        next();
    });

};
