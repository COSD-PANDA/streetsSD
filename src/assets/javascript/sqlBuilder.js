var sqlBuilder = {

	getLayerSQL: function(sqlKey) {
		var SQL = "";
		if (sqlKey == 'oci-2011') {
			SQL += "SELECT oci_2011.cartodb_id, " +
			"oci_2011.the_geom, " +
			"oci_2011.the_geom_webmercator, " +
			"to_char(oci_2011.inspection, 'Month YYYY') AS inspection_date, " +
			"oci_2011.oci, " +
			"oci_2011.rd20full, " +
			"oci_2011.xstrt1, " +
			"oci_2011.xstrt2, " +
			"ST_Length(ST_AsText(ST_Transform(oci_2011.the_geom,26915)))/1609.34 as totalMiles, " +
			"CASE WHEN oci_2011.oci <= 33.333 THEN 'Poor' " +
			"WHEN oci_2011.oci <= 66.666 THEN 'Fair' " +
			"ELSE 'Good' " +
			"END AS oci_condition " +
			"FROM oci_2011 ";
	  	}
	    else {
		    SQL += "SELECT spp2.cartodb_id," +
		    "spp2.the_geom_webmercator, " +
		    "spp2.activity, " +
		    "spp2.est_date, " +
		    "spp2.date_, " +
		    "COALESCE(to_char(spp2.est_date, 'Month YYYY'), to_char(spp2.date_, 'Month YYYY')) AS date_text," +
		    "spp2.shape_len, " +
		    "spp2.rd20full, " +
		    "spp2.xstrt1, " +
		    "spp2.xstrt2, "+
		    "spp2.district "+
		    "FROM spp2 ";
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
			  SQL += "WHERE (spp2.date_ is not null OR spp2.est_date is not null) ";
			  // Work Done Date / Work Est Date is after 2012-01-01
			  SQL += "AND (spp2.date_::date >= '2012-01-01' OR spp2.est_date::date >= '2012-01-01') ";
			  // Impose Quarter Limit on Work Done for Accuracy / Consistency.
			  SQL += "AND (spp2.date_::date <= '" + lastQuarter.end + "') ";
 			  // Filter for Null Activities.
			  SQL += "AND (spp2.activity is not null) ";
			  break;

			case 'all-work-since-mayor':
			  // Work Done Date is not NULL.
			  SQL += "WHERE (spp2.date_ is not null) ";
			  // Work Done Date is after March 3, 2014.
			  SQL += "AND (spp2.date_::date >= '2014-03-03') ";
			  // Impose Quarter Limit on Work Done for Accuracy / Consistency.
			  SQL += "AND (spp2.date_::date <= '" + lastQuarter.end +"') ";
			  // Filter for Null Activities.
			  SQL += "AND (spp2.activity is not null) ";
			  break;

			case 'work-1k-pledge':
			  // Work Done Date is not NULL.
			  SQL += "WHERE (spp2.date_ is not null) ";
			  // Activity Column is not NULL.
			  SQL += "AND (spp2.activity is not null) ";
			  // Work Done Date is after Jul 1, 2015.
			  SQL += "AND (spp2.date_::date >= '2015-01-01') ";
			  // Filter for Null Activities.
			  SQL += "AND (spp2.activity is not null) ";
			  break;

			case 'work-fy-2013':
			  // Work Done Date is not NULL.
			  SQL += "WHERE (spp2.date_ is not null) ";

			  // Work Done Date is after Jul 1, 2012.
			  SQL += "AND (spp2.date_::date >= '2012-07-01') ";

			  // Work Done Date is before June 30, 2013.
			  SQL += "AND (spp2.date_::date <= '2013-06-30') ";

			  // Filter for Null Activities.
			  SQL += "AND (spp2.activity is not null) ";
			  break;

			case 'work-fy-2014':
			  // Work Done Date is not NULL.
			  SQL += "WHERE (spp2.date_ is not null) ";

			  // Work Done Date is after Jul 1, 2013.
			  SQL += "AND (spp2.date_::date >= '2013-07-01') ";

			  // Work Done Date is before June 30, 2014.
			  SQL += "AND (spp2.date_::date <= '2014-06-30') ";

			  // Filter for Null Activities.
			  SQL += "AND (spp2.activity is not null) ";
			  break;

			case 'work-fy-2015':
			  // Work Done Date is not NULL.
			  SQL += "WHERE (spp2.date_ is not null) ";

			  // Work Done Date is after Jul 1, 2014.
			  SQL += "AND (spp2.date_::date >= '2014-07-01') ";

			  // Work Done Date is before June 30, 2015.
			  SQL += "AND (spp2.date_::date <= '2015-06-30') ";

			  // Filter for Null Activities.
			  SQL += "AND (spp2.activity is not null) ";
			  break;

			case 'future-work':
			  // Bring in work completed after the current quarter.
			  SQL += "WHERE (spp2.date_ >= '" + lastQuarter.end + "') ";

			  // Bring in all work with an estimated date.
			  SQL += "OR (spp2.est_date >= '" + lastQuarter.end + "') ";

			  // Filter for Null Activities.
			  SQL += "AND (spp2.activity is not null) ";

			  break;

			case 'oci-2011':
				SQL += "WHERE oci_2011.inspection is not null ";
				SQL += "AND oci_2011.oci > 0 ";
				SQL += "AND oci_2011.inspection::date <= '2012-01-01'";

				break;

			default:
				throw new Error("Invalid Query Key");
        }
  		return SQL;
	},
	getDistanceSQL: function(sqlKey, extraConditions, groupBy) {
    console.log(sqlKey);
		var SQL = "SELECT " + groupBy + ", " +
		"SUM(ST_Length(ST_AsText(ST_Transform(spp2.the_geom,26915)))/1609.34) as totalMiles " +
		"FROM spp2 ";
		SQL = this.getSQLConditions(sqlKey, SQL);
		if (extraConditions)
		  SQL += extraConditions;

		if (groupBy)
		  SQL += "GROUP BY " + groupBy;

		return SQL;
	},
  getDistanceByMonthSQL: function(sqlKey) {
      var month = "COALESCE(to_char(spp2.est_date, 'MM'), to_char(spp2.date_, 'MM'))";
      var sqlString = this.getDistanceSQL(sqlKey, null, month);
      sqlString += " ORDER BY " + month;

      return sqlString;
  },
	getTotalDistanceSQL: function(sqlKey, activityKey) {
	    var SQL = "SELECT spp2.district, " +
	    "SUM(ST_Length(ST_AsText(ST_Transform(spp2.the_geom,26915)))/1609.34) as totalMiles " +
	    "FROM spp2 ";
	    SQL = getSQLConditions(sqlKey, SQL);
	    console.log(SQL);
	    SQL += "GROUP BY DISTRICT";
	    return SQL;
	},

	getOCIBreakdownSQL: function() {
		var SQL = "SELECT " +
		"SUM(ST_Length(ST_AsText(ST_Transform(oci_2011.the_geom,26915)))/1609.34) as totalMiles, " +
		"CASE WHEN oci_2011.oci <= 33.333 THEN 'Poor' " +
		     "WHEN oci_2011.oci <= 66.666 THEN 'Fair' " +
		     "ELSE 'Good' " +
		     "END " +
		     "AS color " +
		"FROM oci_2011 " +
		"WHERE oci_2011.oci > 0 " +
		"GROUP BY color ";

		return SQL;
	},
  getOCIAvgSQL: function() {
  	var SQL = "SELECT " +
      "AVG(oci_2011.oci) " +
      "FROM oci_2011 " +
      "WHERE oci_2011.oci > 0"

    return SQL;
	}
}
