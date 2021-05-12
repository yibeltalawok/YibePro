'use strict'
module.exports = function (Issue) {
  ;(Issue.getItemList = (issueId, cb) => {
    const { Item } = Issue.app.models
    let itemList = []
    Issue.find({ where: { id: issueId } }, (err, resp) => {
      if (resp.length > 0) {
        let temp = resp[0].__data.items
        for (let q = 0; q < temp.length; q++) {
          itemIdPass(temp[q].itemId)
            .then((result) => {
              if (result.length > 0) {
                // for (let j = 0; j < result.length; j++) {
                result[0].__data.available = temp[q].issueSize
                itemList.push(result[0])

                // }
                if (temp.length - 1 == q) {
                  cb(null, itemList)
                }
              } else {
                cb(null, {})
              }
            })
            .catch((e) => {
              console.log(e)
            })
        }
      }
    })
    const itemIdPass = async function (itemId) {
      let value = await Item.find({ where: { id: itemId } })
      return Promise.resolve(value)
    }
  }),
    Issue.remoteMethod('getItemList', {
      description: 'getItemList',
      accepts: {
        arg: 'issueId',
        type: 'string',
        required: true,
      },
      returns: {
        type: 'object',
        root: true,
      },

      http: {
        verb: 'post',
        path: '/getItemList',
      },
    })

  Issue.getIssueDetail = (issueId, cb) => {
    try {
      const { Item } = Issue.app.models
      Issue.find(
        { where: { id: issueId }, include: ['inventory', 'issuedBy'] },
        (err, res) => {
          if (res.length > 0) {
            if (res[0].__data.items.length > 0) {
              let itemData = []
              for (let i = 0; i < res[0].__data.items.length; i++) {
                getItems(res[0].__data.items[i].itemId)
                  .then((result) => {
                    itemData.push({
                      inventoryName: result[0].__data.inventory.inventoryName,
                      itemNumber: result[0].__data.itemNumber,
                      binCardNumber: result[0].__data.binCardNumber,
                      itemName: result[0].__data.itemName,
                      unitPrice: result[0].__data.unitPrice,
                      totalQuantity: res[0].__data.items[i].issueSize,
                      id: result[0].__data.id,
                    })
                    if (i == res[0].__data.items.length - 1) {
                      let issueData = {
                        fullName: res[0].__data.issuedBy.fullName,
                        email: res[0].__data.issuedBy.email,
                        issueType: res[0].__data.type,
                        issueCode: res[0].__data.issueCode,
                        issueReason: res[0].__data.reason,
                        inventoryName: res[0].__data.inventory.inventoryName,
                        issueSignature: res[0].__data.issueSignature,
                        storeAdminSignature: res[0].__data.storeAdminSignature,
                        items: itemData,
                      }
                      cb(null, issueData)
                    }
                  })
                  .catch((e) => {
                    console.log(e)
                  })
              }
            } else {
              let issueData = {
                fullName: res[0].__data.issuedBy.fullName,
                email: res[0].__data.issuedBy.email,
                issueType: res[0].__data.type,
                issueCode: res[0].__data.issueCode,
                issueReason: res[0].__data.reason,
                inventoryName: res[0].__data.inventory.inventoryName,
                issueSignature: res[0].__data.issueSignature,
                items: [],
              }
              cb(null, issueData)
            }
          } else {
            cb(null, [])
          }
        },
      )
      const getItems = async function (itemId) {
        let result = await Item.find({
          include: ['inventory'],
          where: { id: itemId },
        })
        // console.log(result)
        return Promise.resolve(result)
      }
    } catch (error) {
      throw new Error('Internal server error try again')
    }
  }
  Issue.remoteMethod('getIssueDetail', {
    description: 'issueDetail',
    accepts: {
      arg: 'issueId',
      type: 'string',
      required: true,
    },
    returns: {
      type: 'object',
      root: true,
    },

    http: {
      verb: 'post',
      path: '/getIssueDetail',
    },
  })
  Issue.deleteAll = (cb) => {
    try {
      Issue.find({}, (err, res) => {
        cb(null, res)
      })
    } catch (error) {
      throw new Error('Internal server error try again')
    }
  }
  Issue.remoteMethod('deleteAll', {
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

  Issue.issueRequst = (item, cb) => {
    const { Item } = Issue.app.models

    for (let i = 0; i < item.tableItem.length; i++) {
      Item.findById(item.tableItem[i].id, function (err, instance) {
        if (err) {
          //skip
        } else {
          instance.updateAttributes({
            available: item.tableItem[i].available - item.tableItem[i].maxSize,
          })
        }
      })
    }

    Issue.create(item.common)
    cb(null, true)
  }

  Issue.remoteMethod('issueRequst', {
    description: 'Issue request with validation',
    accepts: { arg: 'item', type: 'Object', required: true },
    returns: { type: 'boolean', root: true },
    http: { verb: 'post', path: '/issueRequst' },
  })
}
