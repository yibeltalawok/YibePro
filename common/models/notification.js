'use strict';
var pubsub = require('../../server/pubsub.js');

module.exports = function(Notification) {


    Notification.observe('after save', function(ctx, next) {
    var socket = Notification.app.io;

        if(ctx.isNewInstance) {
            pubsub.publish(socket, {
                collectionName : 'Notification',
                data: ctx.instance,
                method: 'POST'
            });
        }
        else console.log("Updated Instance")
        next()
      });
      












      Notification.observe('after delete', function(ctx, next) {
        if(ctx.isNewInstance) console.log("New Instance Added")
        next()
      });


};
