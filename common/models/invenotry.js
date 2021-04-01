'use strict';

module.exports = function (Invenotry) {

    Invenotry.createInventoryAndItem = async (
        item, inventory,
        cb
    ) => {
        const { Item } = Invenotry.app.models
        await Invenotry.create(inventory).then(res => {
            if (item.length > 0) {
                let tempItem = []
                for (const iterator of item) {
                    tempItem.push({ ...iterator, inventoryId: res.__data.id })
                    if (tempItem.length == item.length) {
                        Item.create(tempItem)
                    }
                }

            }
        }).catch(e => {
            console.log(e)
    })

    }
    Invenotry.remoteMethod("createInventoryAndItem", {
        description: "getPieChart",
        accepts:
            [
                {
                    arg: "item",
                    type: ["object"],
                    required: true
                },
                {
                    arg: "inventory",
                    type: "object",
                    required: true
                },
            ],
        returns: {
            type: "object",
            root: true
        },

        http: {
            verb: "post",
            path: "/createInventoryAndItem"
        }
    });
    //Delete all====================================
    Invenotry.deleteAll = (cb) => {
        try {
            Invenotry.find({}, (err, res) => {
                cb(null, res)
            })
        } catch (error) {
            throw new Error("Internal server error try again");
        }
    }
    Invenotry.remoteMethod("deleteAll", {
        description: "Delete all ",
        // accepts: [],

        returns: {
            type: "object",
            root: true
        },

        http: {
            verb: "delete",
            path: "/deleteAll"

        }
    })
};
