var opsControl = (function() {
    // Private.

    sql = new cartodb.SQL({ user: 'cityofsandiego-admin' });

    tDistanceStringConfig = {
        tableAlias: "ic",
        groupFieldAlias: "activity",
        lengthFieldAlias: "adj_length"
    };

    getTDistance = function(subLayerID, displayOp) {
        var sqlString = sqlBuilder.getDistanceSQL(subLayerID, tDistanceStringConfig);
        //console.log("HI")
        console.log(sqlString);
        sql.execute(sqlString).done(function(data){
            opsDisplay[displayOp](subLayerID, data);
        });
    };

    // Public API
    return {
        progress: function(subLayerID) {
            return getTDistance(subLayerID, "progress");
        },
        calcTDistance: function(subLayerID) {
            return getTDistance(subLayerID, "calcTDistance");
        },

        typeBreakdown: function(subLayerID) {
            return getTDistance(subLayerID, "typeBreakdown");
        },

        totalMiles: function(subLayerID) {
            return getTDistance(subLayerID, "totalMiles");
        },

        ociBreakdown: function(subLayerID) {
            var sqlString = sqlBuilder.getDistanceSQL(subLayerID, {
                tableAlias: subLayerID.replace("-", ""),
                groupFieldAlias: "color",
                lengthFieldAlias: "area",
                order: "ASC"
            });

            sql.execute(sqlString).done(function(data) {
                opsDisplay.ociBreakdown(subLayerID, data);
                opsDisplay.totalMiles(subLayerID, data);
            });
        },

        ociAvg: function(subLayerID) {
            var sqlString = sqlBuilder.getOCICalcSQL(subLayerID, "avg");
            sql.execute(sqlString).done(function(data) {
                opsDisplay.ociAvg(subLayerID, data);
            });
        },

        workByMonth: function(subLayerID) {
            var sqlString = sqlBuilder.getDistanceSQL(subLayerID, {
                tableAlias: "ic",
                groupFieldSQL: "to_char(" + sqlBuilder.mapAlias("ic", "work_end") + ", 'MM'), type",
                lengthFieldAlias: "adj_length",
                order: "ASC"
            });


            sql.execute(sqlString).done(function(data) {
                opsDisplay.workByMonth(subLayerID, data);
            });
        },

        bigNumbers: function(subLayerID, data) {
            var sqlString = sqlBuilder.getDistanceSQL(subLayerID, {
                tableAlias: "ic",
                groupFieldSQL: "to_char(" + sqlBuilder.mapAlias("ic", "work_end") + ", 'MM-YY')",
                lengthFieldAlias: "adj_length",
                order: "ASC"
            });

            sql.execute(sqlString).done(function(data) {
                opsDisplay.totalMiles(subLayerID, data);
                opsDisplay.avgMilesPerMonth(subLayerID, data);
            });
        }
    };
})();
