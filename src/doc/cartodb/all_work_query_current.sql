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

