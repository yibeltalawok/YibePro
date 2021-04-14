'use strict';

module.exports = function (CostPerSamHistory) {

    
    CostPerSamHistory.getCostPerSamDashboard = (
        year,
        cb
    ) => {
        try {


            
        } catch (error) {
            throw (error)
        }
    }



    CostPerSamHistory.remoteMethod("getCostPerSamDashboard", {
        description: "getCostPerSamDashboard",
        accepts:
        {
            arg: "year",
            type: "string",
            required: true
        },
        returns: {
            type: "object",
            root: true
        },

        http: {
            verb: "post",
            path: "/getCostPerSamDashboard"
        }
    });
};
