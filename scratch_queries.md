
SELECT spp2.district, 
(sum(shape_len) / 1609.34) as totalMiles
FROM spp2 
GROUP BY spp2.district


select 
district, 
the_geom, 
ST_Length(ST_AsText(ST_Transform(the_geom,26915)))/1609.34 as shape_len_m,
shape_len / 5280 AS shape_len_f,
spp2.rd20full,
xstrt1,
xstrt2
from spp2