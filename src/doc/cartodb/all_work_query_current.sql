SELECT ic.cartodb_id AS cartodb_id, 
ic.the_geom AS the_geom, 
ic.the_geom_webmercator AS the_geom_webmercator, 
ic.asset_type AS activity, 
ic.rd20full AS street, 
ic.xstrt1 AS from_street, 
ic.xstrt2 AS to_street, 
ic.project_st AS status, 
(ic.shape_len / 5280) AS length, 
CASE 
	WHEN tswb.width >= 48 
		THEN ((ic.shape_len / 5280) * 2) 
	ELSE (ic.shape_len / 5280) 
	END AS adj_length, 
ic.moratorium AS moratorium, 
ic.start_cons AS work_start, 
to_char(ic.moratorium, 'Month YYYY') AS work_completed, 
CASE WHEN EXTRACT (MONTH FROM ic.start_cons) >= 7 
THEN 'FY-' || EXTRACT (YEAR FROM ic.start_cons) + 1 
ELSE 'FY-' || EXTRACT (YEAR FROM ic.start_cons) END AS work_scheduled, ic.moratorium AS work_end, 
tswb.width AS width 
FROM imcat_street_august_2016 ic 
INNER JOIN tsw_basemap tswb 
ON (ic.sapid = tswb.sapid) 
WHERE (ic.moratorium is not null) AND (ic.project_st = 'Moratorium') 
AND (ic.moratorium::date >= '2013-07-01') 
AND (ic.moratorium::date <= '2016-06-30')



SELECT ic.cartodb_id AS cartodb_id, 
tswb.the_geom AS the_geom, 
tswb.the_geom_webmercator AS the_geom_webmercator, 
ic.type AS activity, 
tswb.rd20full AS street, 
tswb.xstrt1 AS from_street, 
tswb.xstrt2 AS to_street, 
ic.status AS status, 
(ic.length / 5280) AS length, 
CASE 
	WHEN tswb.pwidth >= 48 
		THEN ((ic.length / 5280) * 2) 
	ELSE (ic.length / 5280) 
	END AS adj_length, 
ic.moratorium AS moratorium, 
ic.start AS work_start, 
to_char(ic.moratorium, 'Month YYYY') AS work_completed, 
CASE WHEN EXTRACT (MONTH FROM ic.start) >= 7 
THEN 'FY-' || EXTRACT (YEAR FROM ic.start) + 1 
ELSE 'FY-' || EXTRACT (YEAR FROM ic.start) END AS work_scheduled, ic.moratorium AS work_end, 
tswb.pwidth AS width 
FROM "cityofsandiego-admin".imcat_update ic 
INNER JOIN "cityofsandiego-admin".city_street_alley_walkway tswb 
ON (ic.segment = tswb.sapid) 
WHERE (ic.moratorium is not null) AND (ic.status = 'Moratorium') 
AND (ic.moratorium::date >= '2013-07-01') 
AND (ic.moratorium::date <= '2016-06-30')