
SELECT spp2.district, 
(sum(shape_len) / 1609.34) as totalMiles
FROM spp2 
GROUP BY spp2.district



select 
district, 
sum(ST_Length(ST_AsText(ST_Transform(the_geom,26915)))/1609.34) as totalMiles
from spp2

group by district