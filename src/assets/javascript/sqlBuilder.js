var sqlBuilder = {

	getLayerSQL: function(sqlKey) {
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
			"ST_Length(ST_AsText(ST_Transform(the_geom,26915)))/1609.34 as totalMiles, " +
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
		    "COALESCE(to_char(est_start, 'Month YYYY'), to_char(completed, 'Month YYYY')) AS date_text," +
		    "length, " +
		    "street, " +
		    "from_street, " +
		    "to_street, "+
		    "district "+
		    "FROM streetwork_master ";
		}
	    return this.getSQLConditions(sqlKey, SQL);
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
	getSQLConditions: function(sqlKey, previousSQL) {
		var lastQuarter = this.getLastQuarter();
		SQL = previousSQL || "";
		switch (sqlKey) {
			case 'all-work':
			  // Date columns are not NULL.
			  SQL += "WHERE (completed is not null OR est_start is not null) ";
			  // Work Done Date / Work Est Date is after 2012-01-01
			  SQL += "AND (completed::date >= '2012-01-01' OR est_start::date >= '2012-01-01') ";
			  // Impose Quarter Limit on Work Done for Accuracy / Consistency.
			  SQL += "AND (completed::date <= '" + lastQuarter.end + "') ";
 			  // Filter for Null Activities.
			  SQL += "AND (activity is not null) ";
			  break;

			case 'all-work-since-mayor':
			  // Work Done Date is not NULL.
			  SQL += "WHERE (completed is not null) ";
			  // Work Done Date is after March 3, 2014.
			  SQL += "AND (completed::date >= '2014-03-03') ";
			  // Impose Quarter Limit on Work Done for Accuracy / Consistency.
			  SQL += "AND (completed::date <= '" + lastQuarter.end +"') ";
			  // Filter for Null Activities.
			  SQL += "AND (activity is not null) ";
			  break;

			case 'work-1k-pledge':
			  // Work Done Date is not NULL.
			  SQL += "WHERE (completed is not null) ";
			  // Activity Column is not NULL.
			  SQL += "AND (activity is not null) ";
			  // Work Done Date is after Jul 1, 2015.
			  SQL += "AND (completed::date >= '2015-01-01') ";
			  // Filter for Null Activities.
			  SQL += "AND (activity is not null) ";
			  break;

			case 'work-fy-2014':
			  // Work Done Date is not NULL.
			  SQL += "WHERE (completed is not null) ";

			  // Work Done Date is after Jul 1, 2013.
			  SQL += "AND (completed::date >= '2013-07-01') ";

			  // Work Done Date is before June 30, 2014.
			  SQL += "AND (completed::date <= '2014-06-30') ";

			  // Filter for Null Activities.
			  SQL += "AND (activity is not null) ";
			  break;

			case 'work-fy-2015':
			  // Work Done Date is not NULL.
			  SQL += "WHERE (completed is not null) ";

			  // Work Done Date is after Jul 1, 2014.
			  SQL += "AND (completed::date >= '2014-07-01') ";

			  // Work Done Date is before June 30, 2015.
			  SQL += "AND (completed::date <= '2015-06-30') ";

			  // Filter for Null Activities.
			  SQL += "AND (activity is not null) ";
			  break;

			case 'future-work':
			  // Bring in work completed after the current quarter.
			  SQL += "WHERE (completed >= '" + lastQuarter.end + "') ";

			  // Bring in all work with an estimated date.
			  SQL += "OR (est_start >= '" + lastQuarter.end + "') ";

			  // Filter for Null Activities.
			  SQL += "AND (activity is not null) ";

			  break;

			case 'oci-2011':
				SQL += "WHERE oci_date is not null ";
				SQL += "AND oci > 0 ";
				SQL += "AND oci_date::date <= '2012-01-01'";

				break;

			default:
				throw new Error("Invalid Query Key");
        }
  		return SQL;
	},
	getDistanceSQL: function(sqlKey, extraConditions, groupBy) {
    console.log(sqlKey);
		var SQL = "SELECT " + groupBy + ", " +
		"SUM(ST_Length(ST_AsText(ST_Transform(the_geom,26915)))/1609.34) as totalMiles " +
		"FROM streetwork_master ";
		SQL = this.getSQLConditions(sqlKey, SQL);
		if (extraConditions)
		  SQL += extraConditions;

		if (groupBy)
		  SQL += "GROUP BY " + groupBy;

		return SQL;
	},
  getDistanceByMonthSQL: function(sqlKey) {
      var month = "COALESCE(to_char(est_start, 'MM'), to_char(completed, 'MM'))";
      var sqlString = this.getDistanceSQL(sqlKey, null, month);
      sqlString += " ORDER BY " + month;

      return sqlString;
  },
	getTotalDistanceSQL: function(sqlKey, activityKey) {
	    var SQL = "SELECT district, " +
	    "SUM(ST_Length(ST_AsText(ST_Transform(the_geom,26915)))/1609.34) as totalMiles " +
	    "FROM streetwork_master ";
	    SQL = getSQLConditions(sqlKey, SQL);
	    console.log(SQL);
	    SQL += "GROUP BY DISTRICT";
	    return SQL;
	},

	getOCIBreakdownSQL: function() {
		var SQL = "SELECT " +
		"SUM(ST_Length(ST_AsText(ST_Transform(the_geom,26915)))/1609.34) as totalMiles, " +
		"CASE WHEN oci <= 33.333 THEN 'Poor' " +
		     "WHEN oci <= 66.666 THEN 'Fair' " +
		     "ELSE 'Good' " +
		     "END " +
		     "AS color " +
		"FROM oci_2011_master " +
		"WHERE oci > 0 " +
		"GROUP BY color ";

		return SQL;
	},
  getOCIAvgSQL: function() {
  	var SQL = "SELECT " +
      "AVG(oci) " +
      "FROM oci_2011_master " +
      "WHERE oci > 0"

    return SQL;
	}
}
