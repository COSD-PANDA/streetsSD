var sqlBuilder = {
    // Various SQL Subs
    //lengthMeasure: "ST_Length(ST_AsText(ST_Transform(the_geom,26915)))/1609.34",
    lengthMeasure: "length",
    adjLengthMeasure: "length",
    ociConditionString: "CASE " +
    				  "WHEN oci <= 33.333 THEN 'Poor' " +
    			      "WHEN oci <= 66.666 THEN 'Fair' " +
    			      "ELSE 'Good' " +
    			      "END",
    select: function() {
    return squel.select({
    	fieldAliasQuoteCharacter: "",
        tableAliasQuoteCharacter: ""
    })
    },

    fields: {
        "ic": { 
            "activity": "ic.asset_type", 
            "street": "ic.rd20full",
            "from_street": "ic.xstrt1",
            "to_street": "ic.xstrt2",
            "status": "ic.project_st",
            "length": "ic.shape_len / 5280",
            "moratorium": "ic.moratorium",
            "work_end": "ic.moratorium"
        }
    },

    tables: {
        ic: "imcat_street"
    },

    mapField: function(table_alias, alias) {
        var self = this;
        return self.fields[table_alias][alias];
    },

    mapTable: function(table_alias) {
        var self = this;
        return self.tables[table_alias];
    },

	getLayerSQL: function(sqlKey) {
		var self = this;
		var SQL = self.select()
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
				.field(self.ociConditionString, "oci_condition")
				.from("oci_2011_master");
		}
		else {
            _.each(self.fields.ic, function(element, index) {
                SQL.field(self.mapField("ic", index), index)
            })
            SQL.from(self.tables.ic, "ic");
		}

		SQL = this.getSQLConditions(sqlKey, SQL);
		//return this.getSQLConditions(sqlKey, SQL);
		return SQL;
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
	},
	getSQLConditions: function(sqlKey, SQL) {
		var lastQuarter = this.getLastQuarter();
        var self = this;
		switch (sqlKey) {
			case 'all-work':
			  // Date columns are not NULL.
			  //SQL += "WHERE (completed is not null OR est_start is not null) ";
			  //SQL += "WHERE (date_combined is not null) ";
			  // Work Done Date / Work Est Date is after 2012-01-01
			  //SQL += "AND (date_combined::date >= '2013-07-01') ";
			  //SQL += "AND (completed::date >= '2012-01-01' OR est_start::date >= '2012-01-01') ";
			  // Impose Quarter Limit on Work Done for Accuracy / Consistency.
			  //SQL += "AND (date_combined::date <= '" + lastQuarter.end + "') ";
 			  // Filter for Null Activities.
			  //SQL += "AND (activity is not null) ";

			  SQL.where(self.mapField("ic", "moratorium") + " is not null")
			     .where(self.mapField("ic", "status") + " = 'Moratorium'")
			     .where(self.mapField("ic", "work_end") + "::date >= '2013-07-01'")
                 .where(self.mapField("ic", "work_end") + "::date <= '" + lastQuarter.end + "'")
			  break;

			case 'work-1k-pledge':
			  // Work Done Date is not NULL.
			  //SQL += "WHERE (completed is not null) ";
			  // Activity Column is not NULL.
			  //SQL += "AND (activity is not null) ";
			  // Date columns are not NULL.
			  SQL += "WHERE (date_combined is not null) ";
			  // Work Done Date is after Jul 1, 2015.
			  SQL += "AND (date_combined::date >= '2015-07-01') ";
			  // Impose Quarter Limit on Work Done for Accuracy / Consistency.
			  SQL += "AND (date_combined::date <= '" + lastQuarter.end + "') ";
			  // Filter for Null Activities.
			  SQL += "AND (activity is not null) ";
			  break;

			case 'work-fy-2014':
			  // Work Done Date is not NULL.
			  //SQL += "WHERE (completed is not null) ";

			  // Date columns are not NULL.
			  SQL += "WHERE (date_combined is not null) ";

			  // Work Done Date is after Jul 1, 2013.
			  SQL += "AND (date_combined::date >= '2013-07-01') ";

			  // Work Done Date is before June 30, 2014.
			  SQL += "AND (date_combined::date <= '2014-06-30') ";

			  // Filter for Null Activities.
			  SQL += "AND (activity is not null) ";
			  break;

			case 'work-fy-2015':
			  // Work Done Date is not NULL.
			  //SQL += "WHERE (completed is not null) ";

			  // Date columns are not NULL.
			  SQL += "WHERE (date_combined is not null) ";

			  // Work Done Date is after Jul 1, 2014.
			  SQL += "AND (date_combined::date >= '2014-07-01') ";

			  // Work Done Date is before June 30, 2015.
			  SQL += "AND (date_combined::date <= '2015-06-30') ";

			  // Filter for Null Activities.
			  SQL += "AND (activity is not null) ";
			  break;

      		case 'work-fy-2016':
			  // Work Done Date is not NULL.
			  //SQL += "WHERE (completed is not null) ";

			  // Date columns are not NULL.
			  SQL += "WHERE (date_combined is not null) ";

			  // Work Done Date is after Jul 1, 2014.
			  SQL += "AND (date_combined::date >= '2015-07-01') ";

			  // Work Done Date is before June 30, 2015.
			  SQL += "AND (date_combined::date <= '" + lastQuarter.end + "') ";

			  // Filter for Null Activities.
			  SQL += "AND (activity is not null) ";
			  break;



			case 'future-work':
			  // Bring in work completed after the current quarter.
			  //SQL += "WHERE (completed >= '" + lastQuarter.end + "') ";
			  SQL += "WHERE (date_combined::date >= '" + lastQuarter.end + "') ";

			  // Bring in all work with an estimated date.
			  //SQL += "OR (est_start >= '" + lastQuarter.end + "') ";

			  // Filter for Null Activities.
			  //SQL += "AND (activity is not null) ";

			  break;

			case 'oci-2011':

				SQL = SQL.where("oci_date is not null")
					 .where("oci > 0")
					 .where("oci_date::date <= '2012-01-01'");

				break;

			default:
				throw new Error("Invalid Query Key");
        }
  		return SQL;
	},
	getDistanceSQL: function(sqlKey, groupBy, table_alias, map) {
        var self = this;

        var map = map === false ? false : true;
        
        var SQL = self.select();
        if (map === true)
            SQL.field(self.mapField(table_alias, groupBy), groupBy)
        else 
            SQL.field(groupBy)

        SQL.field("SUM(" + self.mapField(table_alias, self.adjLengthMeasure) + ")", "totalMiles")
          .from(self.mapTable(table_alias), table_alias);

		if (groupBy)
		  SQL.group(groupBy);

        SQL = self.getSQLConditions(sqlKey, SQL);

		return SQL;
	},
	getDistanceByMonthSQL: function(sqlKey) {
	  var month = "to_char(" + this.mapField("ic", "moratorium") + ", 'MM')";
	  var SQL = this.getDistanceSQL(sqlKey, month, "ic", false)
          .order(month);

	  return SQL;
	},
	getDistanceByMonthYearSQL: function(sqlKey) {
	  var month = "to_char(" + this.mapField("ic", "moratorium") + ", 'MM-YY')";
	  var SQL = this.getDistanceSQL(sqlKey, month, "ic", false)
          .order(month)

	  return SQL;
	},

	getOCIBreakdownSQL: function() {
		var self = this;
		var SQL = self.select()
			.field("SUM(" + self.lengthMeasure + ")", "totalMiles")
			.field(self.ociConditionString, "color")
			.from("oci_2011_master")
			.where("oci > 0")
			.group("color");

		return SQL;
	},
    getOCIAvgSQL: function() {
    	var self = this;
    	var SQL = self.select()
    		.field("SUM(OCI * LENGTH) / SUM(LENGTH)", "avg")
    		.from("oci_2011_master")
    		.where("oci > 0");

         return SQL;
	}
}
