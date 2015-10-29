var sqlBuilder = (function() {
    // Private.


    var fields = {
        "ic": { 
            "activity": "ic.asset_type", 
            "street": "ic.rd20full",
            "from_street": "ic.xstrt1",
            "to_street": "ic.xstrt2",
            "status": "ic.project_st",
            "length": "ic.shape_len / 5280",
            "adj_length": "getSQLString",
            "moratorium": "ic.moratorium",
            "work_end": "ic.moratorium"
        },
        "tswb": {
            "width": "tswb.width"
        }
    };

    var tables = {
        ic: "imcat_street",
        tswb: "tsw_basemap",
        oci2011: "oci_2011_master",
    };

    select = function() {
        return squel.select({
            fieldAliasQuoteCharacter: "",
            tableAliasQuoteCharacter: ""
        });
    };

    getSQLString = function(stringRef) {
        switch (stringRef) {
            case "adj_length":
                var widthField = mapAlias("tswb", "width");
                var lengthField = mapAlias("ic", "length");
                return "CASE " +
                    "WHEN " + lengthField + " >= 48 THEN " +
                    "((" + lengthField + "* 2) / 5280) " +
                    "ELSE (" + lengthField + "/ 5280) " +
                    "END";
            case "ociCondition":
                return "CASE " +
                    "WHEN oci <= 33.333 THEN 'Poor' " +
                    "WHEN oci <= 66.666 THEN 'Fair' " +
                    "ELSE 'Good' " +
                    "END";
            default: 
                throw new Error("Unfound getSQLString " + stringRef);
        }
    };

    mapAlias = function(table_alias, field_alias) {
        // Check if table exists.
        if (_.indexOf(_.keys(tables), table_alias) === -1)
            throw new Error("No Table " + table_alias)

        // If table exists, and no field_alias, return table alias.
        if (_.isUndefined(field_alias))
            return tables[table_alias];

        // If table exists, and no field found, throw error.
        if (_.isUndefined(fields[table_alias][field_alias])) 
            throw new Error("Unfound Table " + table_alias + " Field " + field_alias)

        // HACK - @TODO
        if (fields[table_alias][field_alias] === "getSQLString")
            return getSQLString(field_alias)


        return fields[table_alias][field_alias];
    };

    getLayerSQL = function(sqlKey) {
        var SQL = select()
            .field("cartodb_id")
            .field("the_geom")
            .field("the_geom_webmercator");
        if (sqlKey == 'oci-2011') {
            SQL = SQL.field("to_char(oci_date, 'Month YYYY')", "oci_date")
                .field("oci")
                .field("street")
                .field("from_street")
                .field("to_street")
                .field("length as totalMiles")
                .field(getSQLString("ociCondition"), "oci_condition")
                .from("oci_2011_master");
        }
        else {
            _.each(fields.ic, function(element, index) {
                SQL.field(mapAlias("ic", index), index)
            });
            _.each(fields.tswb, function(element, index) {
                SQL.field(mapAlias("tswb", index), index)
            });
            SQL.from(tables.ic, "ic")
               .join(tables.tswb, "tswb")
        }

        return SQL;
    };

    // Public API
    return {
        getSQL: function(sqlKey) {
            console.log("hi " + sqlKey)
            return getLayerSQL().toString();
        },
        getLastQuarter: function(date) {
            var date = date || new Date();
            var sqlFormatDate = ('YYYY-MM-DD');
            var quarterAdjustment= (moment(date).month() % 3) + 1;
            var lastQuarterEndDate = moment(date).subtract({ months: quarterAdjustment }).endOf('month');
            var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({ months: 3 }).startOf('month');
            return {
                start: lastQuarterStartDate.format(sqlFormatDate),
                end: lastQuarterEndDate.format(sqlFormatDate)
            }
        }
    };
})();
