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
  });

  var fetchMachine = async function(id){
    var data = await Machine.findById(id);
    return Promise.resolve(data.__data); 
  }

  var UpdateMachine = async function(data){
    var data = await Machine.replaceById(data.id, data);
    return Promise.resolve(data.__data); 
  }

  Machine.addStock = (record, cb) => {
    console.log(record)
    fetchMachine(record.machineid).then(r => {
      r.stock += record.purchased
      if(r != null) {
        delete record.machineid;
        r.stockrecord.push(record)
        console.log(r)
        UpdateMachine(r)
        cb(null, r);
      }
    }).catch(e => {
      console.log(e)
})
   };
   

   Machine.remoteMethod("addStock", {
    description: "Add machine stock",

    accepts: {
      arg: "record",
      type:"object",
    },

    returns: {
      type: "object",
      root: true
    },
    http: {
      verb: "post",
      path: "/addstock"
    }
  });


  var fetchOperation = async function(operationBultnid){
    const { Operation } = Machine.app.models    
    var data = await Operation.find({ where: {oprBltnId: operationBultnid}, include: 'machine'})
    return Promise.resolve(data); 
  }


  Machine.occupiedMachines = (operationBltnid, cb) => {
    fetchOperation(operationBltnid).then( res => {
      var machines = []
      let mids = []
      for(let i = 0; i<res.length; i++){
        var idx = mids.indexOf(res[i].__data.machineId.toString())

        if(idx >= 0){
          machines[idx].alp += parseInt(res[i].__data.mcAllocated)
        }
        else {
          mids.push(res[i].__data.machineId.toString())
          machines.push({
            stock: res[i].__data.machine.stock,
            machineid: res[i].__data.machineId.toString(),
            alp: parseInt(res[i].__data.mcAllocated)
          })
        }
      }
      
      cb(null, machines)
      
        
    }).catch(e => {
      console.log(e)
})
   };


  Machine.remoteMethod("occupiedMachines", {
    description: "Check how mny machines are accupied for a certain opperation",

    accepts: {
      arg: "operationid",
      type:"string",
    },

    returns: {
      type: "object",
      root: true
    },
    http: {
      verb: "post",
      path: "/occupiedMachines"
    }
  });

}

 