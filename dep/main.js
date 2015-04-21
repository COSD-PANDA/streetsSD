var global = {
  workLayers: {}
};

function getSQL(sqlKey) {
  var SQL = "SELECT spp2.cartodb_id," +
    "spp2.the_geom_webmercator, " +
    "spp2.activity, " +
    "spp2.est_date, " +
    "spp2.date_, " +
    "COALESCE(to_char(spp2.est_date, 'Month DD, YYYY'), to_char(spp2.date_, 'Month DD, YYYY')) AS date_text," +
    "spp2.shape_len, " +
    "spp2.rd20full, " +
    "spp2.xstrt1, " +
    "spp2.xstrt2, "+
    "spp2.district "+
    "FROM spp2 ";

  switch (sqlKey) {
    case 'all_work':
      SQL += "WHERE spp2.date_ is not null OR spp2.est_date is not null";
      break;

    case 'past_work_fy_13':
      SQL += "WHERE spp2.date_ is not null ";
      SQL += "AND (spp2.date_::date >= '2014-07-01' AND spp2.date_::date < '2015-06-30')";
      break;


    case 'past_work':
      SQL += "WHERE spp2.date_ is not null";
      break;

    case 'future_work':
      SQL += "WHERE spp2.est_date is not null";
      break;
  }
  return SQL;
}

function clearState() {
  $('#helper_box, .helper_section').hide();
  var num_sublayers = global.layers[1].getSubLayerCount();
  for (var i = 1; i < num_sublayers; i++)
    global.layers[1].getSubLayer(i).hide();

}


function initSubLayerWatch() {
  clearState();
  var $optLayers = $('#layer_selector ul#opt-layers li');
  $optLayers.click(function(e) {
    var $li = $(e.target);
    var $input = $('input', $li);
    $input.prop('checked') == true ? $input.prop('checked', false) : $input.prop('checked', true);
    var subLayer = global.layers[1].getSubLayer(0);
    subLayer.toggle();
  });

  var $workLayers = $('#layer_selector ul#work-layers li');
  $workLayers.click(function(e) {
    // get the area of the selected layer
    var $li = $(e.target);
    var subLayerNum = $li.attr('data-sublayer');
    var subLayerSQL = $li.attr('data-sql') || null;
    var subLayerID = $li.attr('id');
    clearState();
    var subLayer = global.layers[1].getSubLayer(subLayerNum);
    console.log(getSQL(subLayerSQL));

    if (subLayerSQL)
      subLayer.setSQL(getSQL(subLayerSQL));

    subLayer.show();
    $('#helper_box').show();
    $('#helper_box #' + subLayerID).show();

    // deselect all and select the clicked one
    $workLayers.removeClass('selected');
    $li.addClass('selected');
  });
}

 function main() {
  cartodb.createVis('map', 'https://maksim2.cartodb.com/api/v2/viz/1387c31c-e546-11e4-a74b-0e853d047bba/viz.json', {
    tiles_loader: true,
    center_lat: 32.7150,
    center_lon: -117.1625,
    zoom: 10
  })
  .done(function(vis, layers) {
    global.vis = vis;
    global.layers = layers;
    initSubLayerWatch();
   })
  .error(function(err) {
    console.log(err);
  });
}

window.onload = main;

