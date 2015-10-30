var opsControl = (function() {
    // Private.

    sql = new cartodb.SQL({ user: 'cityofsandiego' });

    tDistanceStringConfig = {
        tableAlias: "ic",
        groupFieldAlias: "activity",
        lengthFieldAlias: "adj_length"
    };

    getTDistance = function(subLayerID, displayOp) {
        var sqlString = sqlBuilder.getDistanceSQL(subLayerID, tDistanceStringConfig);
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

        workByMonth: function(subLayerID) {
            var sqlString = sqlBuilder.getDistanceSQL(subLayerID, {
                tableAlias: "ic",
                groupFieldSQL: "to_char(" + sqlBuilder.mapAlias("ic", "work_end") + ", 'MM')",
                lengthFieldAlias: "adj_length",
                order: "ASC"
            }).toString();


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
            }).toString();
            
            sql.execute(sqlString).done(function(data) {
                opsDisplay.totalMiles(subLayerID, data);
                opsDisplay.avgMilesPerMonth(subLayerID, data);
            });
        }
    };
})();
