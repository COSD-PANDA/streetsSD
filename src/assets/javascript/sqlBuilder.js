var sqlBuilder = (function() {
    // Private.

    var fields = {
        "ic": {
            "activity": "ic.type",
            "status": "ic.status",
            "length": "(ic.length / 5280)",
            "width": "ic.width",
            "adj_length": "getSQLString",
            "moratorium": "ic.moratorium",
            "work_start": "ic.start",
            "work_completed": "to_char(ic.moratorium, 'Month YYYY')",
            "work_scheduled": "getSQLString",
            "work_end": "ic.moratorium"
        },
        "tswb": {
            "cartodb_id": "tswb.cartodb_id",
            "the_geom": "tswb.the_geom",
            "the_geom_webmercator": "tswb.the_geom_webmercator",
            "street": "tswb.street",
            "from_street": "tswb.st_from",
            "to_street": "tswb.st_to"
        },
        "oci2011": {
            "oci": "oci2011.oci",
            "oci_display": "ROUND(oci2011.oci)",
            "oci_condition": "getSQLString",
            "color": "getSQLString",
            "length": "oci2011.seg_length_ft",
            "area": "oci2011.area_sq_ft",
            "width": "oci2011.seg_width_ft",
            "oci_wt": "oci2011.oci_wt"
        },
        "oci2015": {
            "oci": "oci2015.oci",
            "oci_display": "ROUND(oci2015.oci)",
            "oci_condition": "getSQLString",
            "color": "getSQLString",
            "length": "oci2015.seg_length_ft",
            "area": "oci2015.area_sq_ft",
            "width": "oci2015.seg_width_ft",
            "oci_wt": "oci2015.oci_wt"
        }
    };

    var tables = {
        ic: "sd_paving_datasd_1",
        tswb: "cg_streets_combined",
        oci2011: "oci_2011_datasd_1",
        oci2015: "oci_2015_datasd_1"
    };

    getLastQuarter = function() {
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

    select = function() {
        return squel.select({
            fieldAliasQuoteCharacter: "",
            tableAliasQuoteCharacter: ""
        });
    };

    getSQLString = function(stringRef) {
        switch (stringRef) {
            case "adj_length":
                var widthField = mapAlias("ic", "width");
                var lengthField = mapAlias("ic", "length");
                return "CASE " +
                    "WHEN CAST(" + widthField + " as numeric) >= 50 THEN " +
                    "(" + lengthField + " * 2) " +
                    "ELSE " + lengthField + " " +
                    "END";
            case "oci_condition":
            case "color":
                return "CASE " +
                    "WHEN oci <= 39.999 THEN 'Poor' " +
                    "WHEN oci <= 69.999 THEN 'Fair' " +
                    "ELSE 'Good' " +
                    "END";

            case "work_scheduled":
                var schedField = mapAlias("ic", "work_start");
                schedField = "to_date(" + schedField + ", 'YYYY-MM-DD HH24:MI:SS')"
                return "CASE " +
                    "WHEN " + schedField + "is null " +
                    "THEN ''" +
                    "WHEN EXTRACT (MONTH FROM  " + schedField + ") >= 7 " +
                    "THEN 'FY-' || EXTRACT (YEAR FROM " + schedField + ") + 1 " +
                    "ELSE 'FY-' || EXTRACT (YEAR FROM " + schedField + ") " +
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

    getTableSQL = function(sqlKey) {
        var SQL = select()
        if (sqlKey == 'oci-2015' || sqlKey == 'oci-2011') {
            alias = sqlKey.replace("-", "");
            _.each(fields.oci2015, function(element, index) {
                SQL.field(mapAlias(alias, index), index)
            });
            _.each(fields.tswb, function(element, index) {
                SQL.field(mapAlias("tswb", index), index)
            });
            SQL.from(mapAlias(alias), alias)
               .join(tables.tswb, "tswb", alias + ".seg_id = tswb.seg_id")
        }
        else {
            _.each(fields.ic, function(element, index) {
                SQL.field(mapAlias("ic", index), index)
            });
            _.each(fields.tswb, function(element, index) {
                SQL.field(mapAlias("tswb", index), index)
            });
            SQL.from(tables.ic, "ic")
               .join(tables.tswb, "tswb", "ic.seg_id = tswb.seg_id")


        }

        return SQL;
    };

    getConditionSQL = function(sqlKey, SQL) {
        var lastQuarter = getLastQuarter();
        switch (sqlKey) {
            case 'all-work':
                SQL.where(mapAlias("ic", "work_end") + " is not null")
                   .where(mapAlias("ic", "status") + " = 'Moratorium' OR " + mapAlias("ic", "status") + " = 'Post Construction'")
                   .where(mapAlias("ic", "work_end") + "::date >= '2013-07-01'")
                   .where(mapAlias("ic", "work_end") + "::date <= '" + lastQuarter.end + "'")
                break;

            case 'work-1k-pledge':
                SQL.where(mapAlias("ic", "work_end") + " is not null")
                   .where(mapAlias("ic", "status") + " = 'Moratorium' OR " +
                   mapAlias("ic", "status") + " = 'Post Construction'")
                   .where(mapAlias("ic", "work_end") + "::date >= '2015-07-01'")
                   .where(mapAlias("ic", "work_end") + "::date <= '" + lastQuarter.end + "'")
                break;

            case 'work-fy-2014':
                SQL.where(mapAlias("ic", "work_end") + " is not null")
                   .where(mapAlias("ic", "status") + " = 'Moratorium' OR " +
                   mapAlias("ic", "status") + " = 'Post Construction'")
                   .where(mapAlias("ic", "work_end") + "::date >= '2013-07-01'")
                   .where(mapAlias("ic", "work_end") + "::date <= '2014-06-30'")
                break;

            case 'work-fy-2015':
                SQL.where(mapAlias("ic", "work_end") + " is not null")
                   .where(mapAlias("ic", "status") + " = 'Moratorium' OR " +
                   mapAlias("ic", "status") + " = 'Post Construction'")
                   .where(mapAlias("ic", "work_end") + "::date >= '2014-07-01'")
                   .where(mapAlias("ic", "work_end") + "::date <= '2015-06-30'")
                break;

            case 'work-fy-2016':
                SQL.where(mapAlias("ic", "work_end") + " is not null")
                   .where(mapAlias("ic", "status") + " = 'Moratorium' OR " +
                   mapAlias("ic", "status") + " = 'Post Construction'")
                   .where(mapAlias("ic", "work_end") + "::date >= '2015-07-01'")
                   .where(mapAlias("ic", "work_end") + "::date <= '2016-06-30'")
                break;

            case 'work-fy-2017':
                SQL.where(mapAlias("ic", "work_end") + " is not null")
                   .where(mapAlias("ic", "status") + " = 'Moratorium' OR " +
                   mapAlias("ic", "status") + " = 'Post Construction'")
                   .where(mapAlias("ic", "work_end") + "::date >= '2016-07-01'")
                   .where(mapAlias("ic", "work_end") + "::date <= '" + lastQuarter.end + "'")
                break;

            case 'future-work':
                SQL.where(mapAlias("ic", "work_end") + " is null");
                break;

            case "oci-2015":
            case "oci-2011":
                SQL.where("oci > 0")
                break;
        }

        return SQL;
    };

    getDistanceSQL = function(sqlKey, config) {
        var SQL = select();
        var groupField = "";
        var joinTable = "";

        if (config.groupFieldSQL)
            groupField = config.groupFieldSQL;

        // Determine Grouping Field.
        // Throw error if no table found will happen in map alias.
        if (config.groupFieldAlias)
            groupField = mapAlias(config.tableAlias, config.groupFieldAlias);

        SQL.field(groupField, config.groupFieldAlias)
           .field("SUM(" + mapAlias(config.tableAlias, config.lengthFieldAlias) + ")", "totalMiles")
           .group(groupField);

        if (sqlKey == 'oci-2011')
            SQL.from(mapAlias("oci2011"), "oci2011")

        else if (sqlKey == 'oci-2015')
            SQL.from(mapAlias("oci2015"), "oci2015")

        // All others
        else {
            SQL.from(mapAlias("ic"), "ic")
               .join(mapAlias("tswb"), "tswb", "ic.seg_id = tswb.seg_id")
        }

        if (config.order)
            SQL.order(groupField, config.order == "ASC");

        return SQL;

    };

    getOCICalcSQL = function(sqlKey, calc) {
        var SQL = select();
        alias = sqlKey.replace("-", "");
        if (calc == 'avg')  {
            var ociField = mapAlias(alias, "oci_wt");
            var lengthField = mapAlias(alias, "area");

            SQL.field("SUM(" + ociField + ") / SUM(" + lengthField + ")", "avg")
        }


        SQL.from(mapAlias(alias), alias);

        return SQL;
    }


    // Public API
    return {
        getSQL: function(sqlKey) {
            var SQL = getTableSQL(sqlKey);
            // Apply conditions as Needed.
            return getConditionSQL(sqlKey, SQL).toString();
        },
        getLastQuarter: function(date) {
            return getLastQuarter(date);
        },

        getDistanceSQL: function(sqlKey, config) {
            var SQL = getDistanceSQL(sqlKey, config);
            // Apply conditions as Needed.
            SQL = getConditionSQL(sqlKey, SQL).toString();

            return SQL;
        },

        mapAlias: function(table_alias, field_alias) {
            return mapAlias(table_alias, field_alias);
        },

        getOCICalcSQL: function(sqlKey, calc) {
            var SQL = getOCICalcSQL(sqlKey, calc);
            SQL = getConditionSQL(sqlKey, SQL).toString();
            return SQL;
        }

    };
})();
