'use strict';

module.exports = function(Machine) {
  // remote method
  Machine.checkSerialNumber = function(machineName, cb) {
   console.log("Work===========================")
    cb(null, machineName);
  };
  Machine.remoteMethod(
    'checkSerialNumber',
    {
      accepts: {arg: 'serialNumber', type: 'string', required: true, http: { source: 'query' } },
      returns: {arg: 'machineName', type: 'string'},
      http: {path: '/checkSerialExists', verb: 'get'},
    }
  );
  // remote method before hook
  Machine.beforeRemote('checkSerialNumber', function(context, unused, next) {
    console.log('Checking Serial Number....'+context.machineName);
    next();
  });}

 