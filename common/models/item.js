'use strict'

module.exports = function (Item) {
  Item.getPieChart = (inventoryId, cb) => {
    let filter = { where: { inventoryId: inventoryId } }
    Item.find(filter, (err, res) => {
      let uniqueState = ['Available', 'Not Available']
      let item = []
      let available = 0
      let notAvailable = 0
      for (let i = 0; i < res.length; i++) {
        if ('Available' == res[i].__data.state) {
          available += 1
        }
        if ('Not Available' == res[i].__data.state) {
          notAvailable += 1
        }
        if (res.length - 1 == i) {
          item.push(
            { state: uniqueState[0], count: available },
            { state: uniqueState[1], count: notAvailable },
          )
        }
      }
      let piecolors = []

      piecolors.push(getRandomColor() + 80, getRandomColor() + 80)

      let mcn = item.map((x) => x.count)
      let lbls = item.map((x) => x.state)

      let pieCahrt = {
        datasets: [
          {
            data: mcn,
            backgroundColor: piecolors,
            label: 'State',
          },
        ],
        labels: lbls,
      }
      cb(null, pieCahrt)
    })
    var getRandomColor = function () {
      var letters = '0123456789ABCDEF'
      var color = '#'
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }
  }
  Item.remoteMethod('getPieChart', {
    description: 'getPieChart',
    accepts: {
      arg: 'inventoryId',
      type: 'string',
      required: true,
    },
    returns: {
      type: 'object',
      root: true,
    },

    http: {
      verb: 'post',
      path: '/getPieChart',
    },
  })

  Item.deleteAll = (cb) => {
    try {
      Item.find({}, (err, res) => {
        cb(null, res)
      })
    } catch (error) {
      throw new Error('Internal server error try again')
    }
  }
  Item.remoteMethod('deleteAll', {
    description: 'QR code generator',
    // accepts: [],

    returns: {
      type: 'object',
      root: true,
    },
    http: {
      verb: 'delete',
      path: '/deleteAll',
    },
  })
}
