var sqlBuilder = {
  // Various SQL Subs
  //lengthMeasure: "ST_Length(ST_AsText(ST_Transform(the_geom,26915)))/1609.34",
  lengthMeasure: "length",
  adjLengthMeasure: "adj_length",
  ociConditionString: "CASE " +
					  "WHEN oci <= 33.333 THEN 'Poor' " +
				      "WHEN oci <= 66.666 THEN 'Fair' " +
				      "ELSE 'Good' " +
				      "END",
  select: function() {
    return squel.select({
    	fieldAliasQuoteCharacter: ""
    })
  },


	/*getLayerSQL: function(sqlKey) {
		var SQL = "";
		if (sqlKey == 'oci-2011') {	
			SQL += "SELECT cartodb_id, " +
			"the_geom, " +
			"the_geom_webmercator, " +
			"to_char(oci_date, 'Month YYYY') AS oci_date, " +
			"oci, " +
			"street, " +
			"from_street, " +
			"to_street, " +
			this.lengthMeasure + " as totalMiles, " +
			"CASE WHEN oci <= 33.333 THEN 'Poor' " +
			"WHEN oci <= 66.666 THEN 'Fair' " +
			"ELSE 'Good' " +
			"END AS oci_condition " +
			"FROM oci_2011_master ";
	  	}
	    else {
		    SQL += "SELECT cartodb_id," +
		    "the_geom_webmercator, " +
		    "activity, " +
		    "est_start, " +
		    "completed, " +
		    "COALESCE(to_char(est_start, 'Month YYYY'), to_char(completed, 'Month YYYY')) AS DATE," +
		    "COALESCE(est_start, completed) AS DATE_COMBINED," +
		    "length, " +
		    "street, " +
		    "from_street, " +
		    "to_street, "+
		    "district, "+
		    this.adjLengthMeasure + " " +
		    "FROM streetwork_master ";
		}
	    return this.getSQLConditions(sqlKey, SQL);
	},*/
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
			SQL = SQL.field("activity")
				.field("est_start")
				.field("completed")
				.field("COALESCE(to_char(est_start, 'Month YYYY'), to_char(completed, 'Month YYYY'))", "DATE")
		    	.field("COALESCE(est_start, completed)", "DATE_COMBINED")
		    	.field("length")
		    	.field("street")
		    	.field("from_street")
		    	.field("to_street")
		    	.field("district")
		    	.field(this.adjLengthMeasure)
		    	.from("streetwork_master")
		}

		//return this.getSQLConditions(sqlKey, SQL);
		return SQL.toString()
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
		console.log(SQL);
		switch (sqlKey) {
			case 'all-work':
			  // Date columns are not NULL.
			  //SQL += "WHERE (completed is not null OR est_start is not null) ";
			  SQL += "WHERE (date_combined is not null) ";
			  // Work Done Date / Work Est Date is after 2012-01-01
			  SQL += "AND (date_combined::date >= '2013-07-01') ";
			  //SQL += "AND (completed::date >= '2012-01-01' OR est_start::date >= '2012-01-01') ";
			  // Impose Quarter Limit on Work Done for Accuracy / Consistency.
			  SQL += "AND (date_combined::date <= '" + lastQuarter.end + "') ";
 			  // Filter for Null Activities.
			  SQL += "AND (activity is not null) ";
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
  		return SQL.toString();
	},
	getDistanceSQL: function(sqlKey, extraConditions, groupBy) {
		var SQL = "SELECT " + groupBy + ", " +
		"SUM(" + this.adjLengthMeasure + ") as totalMiles " +
		"FROM streetwork_master ";
		SQL = this.getSQLConditions(sqlKey, SQL);
		if (extraConditions)
		  SQL += extraConditions;

		if (groupBy)
		  SQL += "GROUP BY " + groupBy;

		console.log(SQL)
		return SQL;
	},
	getDistanceByMonthSQL: function(sqlKey) {
	  var month = "COALESCE(to_char(est_start, 'MM'), to_char(completed, 'MM'))";
	  var sqlString = this.getDistanceSQL(sqlKey, null, month);
	  sqlString += " ORDER BY " + month;

	  return sqlString;
	},
	getDistanceByMonthYearSQL: function(sqlKey) {
	  var month = "COALESCE(to_char(est_start, 'MM-YY'), to_char(completed, 'MM-YY'))";
	  var sqlString = this.getDistanceSQL(sqlKey, null, month);
	  sqlString += " ORDER BY " + month;

	  return sqlString;
	},

	getOCIBreakdownSQL: function() {
		var self = this;
		var SQL = self.select()
			.field("SUM(" + self.lengthMeasure + ")", "totalMiles")
			.field(self.ociConditionString, "color")
			.from("oci_2011_master")
			.where("oci > 0")
			.group("color");

		console.log(SQL.toString())

		return SQL.toString();
	},
    getOCIAvgSQL: function() {
    	var self = this;
    	var SQL = self.select()
    		.field("SUM(OCI * LENGTH) / SUM(LENGTH)", "avg")
    		.from("oci_2011_master")
    		.where("oci > 0");

         return SQL.toString();
	}
}
