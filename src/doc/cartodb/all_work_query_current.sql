SELECT ic.type AS activity, 
ic.status AS status, (ic.length / 5280) AS length, 
ic.width AS width, 
CASE WHEN ic.width >= 50 
	THEN ((ic.length / 5280) * 2) 
ELSE (ic.length / 5280) 
END AS adj_length, 
ic.moratorium AS moratorium, 
ic.start AS work_start, 
to_char(ic.moratorium, 'Month YYYY') AS work_completed, 
CASE WHEN EXTRACT (MONTH FROM  ic.start) >= 7 
THEN 'FY-' || EXTRACT (YEAR FROM ic.start) + 1 
ELSE 'FY-' || EXTRACT (YEAR FROM ic.start) 
END AS work_scheduled, 
ic.moratorium AS work_end, 
tswb.cartodb_id AS cartodb_id, 
tswb.the_geom AS the_geom, 
tswb.the_geom_webmercator AS the_geom_webmercator, 
tswb.rd20full AS street, 
tswb.xstrt1 AS from_street, 
tswb.xstrt2 AS to_street 
FROM sdif_update ic 
INNER JOIN city_street_alley_walkway tswb 
ON (ic.segment = tswb.sapid) 
WHERE (ic.moratorium is not null) 
AND (ic.status = 'Moratorium') 
AND (ic.moratorium::date >= '2013-07-01') 
AND (ic.moratorium::date <= '2020-06-30')


SELECT oci2011.cartodb_id AS cartodb_id, 
oci2011.the_geom AS the_geom, 
oci2011.the_geom_webmercator AS the_geom_webmercator, 
oci2011.oci_date AS oci_date, 
oci2011.street AS street, 
oci2011.from_st AS from_street, 
oci2011.to_st AS to_street, 
CASE WHEN oci <= 39.999 THEN 'Poor' 
WHEN oci <= 69.999 THEN 'Fair' 
ELSE 'Good' END AS oci_condition, 
CASE WHEN oci <= 39.999 THEN 'Poor' 
WHEN oci <= 69.999 
THEN 'Fair' 
ELSE 'Good' 
END AS color, 
oci2011.length AS length, 
oci2011.oci AS oci, 
ROUND(oci2011.oci) AS oci_display 
FROM oci_2011 oci2011 
WHERE (oci_date is not null) 
AND (oci > 0) 
AND (oci_date::date <= '2012-01-01')


SELECT oci_2015.oci,
CASE WHEN oci <= 39.999 THEN 'Poor' 
WHEN oci <= 69.999 THEN 'Fair' 
ELSE 'Good' END AS oci_condition, 
CASE WHEN oci <= 39.999 THEN 'Poor' 
WHEN oci <= 69.999 
THEN 'Fair' 
ELSE 'Good' 
END AS color, 
tswb.cartodb_id AS cartodb_id, 
tswb.the_geom AS the_geom, 
tswb.the_geom_webmercator AS the_geom_webmercator, 
tswb.rd20full AS street, 
tswb.xstrt1 AS from_street, 
tswb.xstrt2 AS to_street 
FROM oci_2015  
INNER JOIN "cityofsandiego-admin".city_street_alley_walkway tswb 
ON (oci_2015.segment = tswb.sapid) 

