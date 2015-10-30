var opsControl = (function() {
    // Private.

    sql = new cartodb.SQL({ user: 'cityofsandiego' });

    // Public API
    return {
        typeBreakdown: function(subLayerID) {
            var sqlString = sqlBuilder.getDistanceSQL(subLayerID, {
                tableAlias: "ic",
                groupFieldAlias: "activity",
                lengthFieldAlias: "adj_length"
            });

            sql.execute(sqlString).done(function(data) {
                opsDisplay.typeBreakdown(subLayerID, data);
            })

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
