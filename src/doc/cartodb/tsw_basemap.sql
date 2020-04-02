SELECT  
bnw.cartodb_id,
bnw.the_geom,
bnw.the_geom_webmercator,
bnw.rd20full AS street,
bnw.xstrt1 AS from_street,
bnw.xstrt2 AS to_street,
bnw.shape_len AS bnw_len,
bnw.sapid AS sapid,
blw.length AS blw_len,
blw.width AS width
FROM tsw_base_no_width AS bnw
JOIN tsw_base_length_width AS blw
ON bnw.sapid = blw.segment_id