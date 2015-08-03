
SELECT spp2.district,
(sum(shape_len) / 1609.34) as totalMiles
FROM spp2
GROUP BY spp2.district



select
district,
sum(ST_Length(ST_AsText(ST_Transform(the_geom,26915)))/1609.34) as totalMiles
from spp2

group by district


  /*case 'work-2012':
      // Work Done Date is not NULL.
      SQL += "WHERE (spp2.date_ is not null) ";

      // Work Done Date is after Jan 1, 2012.
      SQL += "AND (spp2.date_::date >= '2012-01-01') ";

      // Work Done Date is before Dec 31, 2012.
      SQL += "AND (spp2.date_::date <= '2012-12-31') ";
      break;


    case 'work-2013':
      // Work Done Date is not NULL.
      SQL += "WHERE (spp2.date_ is not null) ";

      // Work Done Date is after Jan 1, 2013.
      SQL += "AND (spp2.date_::date >= '2013-01-01') ";

      // Work Done Date is before Dec 31, 2013.
      SQL += "AND (spp2.date_::date <= '2013-12-31') ";
      break;

    case 'work-2014':
      // Work Done Date is not NULL.
      SQL += "WHERE (spp2.date_ is not null) ";

      // Work Done Date is after Jan 1, 2014.
      SQL += "AND (spp2.date_::date >= '2014-01-01') ";

      // Work Done Date is before Dec 31, 2014.
      SQL += "AND (spp2.date_::date <= '2014-12-31') ";
      break;

    case 'work-2015':
      // Date columns are not NULL.
      SQL += "WHERE (spp2.date_ is not null OR spp2.est_date is not null) ";
      // Work Done Date / Work Est Date is after 2015-01-01
      SQL += "AND (spp2.date_::date >= '2015-01-01' OR spp2.est_date::date >= '2015-01-01') ";
      // Work Done Date / Work Est Date is before 2016-01-01
      SQL += "AND (spp2.date_::date <= '2016-01-01' OR spp2.est_date::date <= '2016-01-01') ";
      break;
*/

