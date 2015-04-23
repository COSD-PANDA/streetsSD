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
    case 'all-work':
      SQL += "WHERE (spp2.date_ is not null OR spp2.est_date is not null) ";
      SQL += "AND (spp2.date_::date >= '2012-01-01')";
      break;

    case 'past-work-fy-13':
      SQL += "WHERE spp2.date_ is not null ";
      SQL += "AND (spp2.date_::date >= '2014-07-01' AND spp2.date_::date < '2015-06-30')";
      break;


    case 'past-work':
      SQL += "WHERE spp2.date_ is not null";
      break;

    case 'future-work':
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

function applyTemplates() {
  console.log(window.layerOptions);
  var layerOptions = window.layerOptions;
  var linkTemplate = _.template($( "script.sidebarLink" ).html());
  var helperBoxTemplate = _.template($( "script.helperBox" ).html());
  _.each(layerOptions, function(element, index) {
    var templateVars = _.assign(element, { key: index });
    var tLink = linkTemplate(templateVars);
    var hLink = helperBoxTemplate(templateVars);
    $(tLink).insertAfter(".sidebar-brand");
    $('#helper_box').append(hLink);
  });

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

  var $workLayers = $('ul#work-layers li a');
  $workLayers.click(function(e) {
    // get the area of the selected layer
    var $li = $(e.target).parent('li');
    var subLayerNum = $li.attr('data-sublayer');
    var subLayerSQL = $li.attr('data-sql') || null;
    var subLayerID = $li.attr('id');
    clearState();
    var subLayer = global.layers[1].getSubLayer(subLayerNum);

    if (subLayerSQL) {
      subLayer.setSQL(getSQL(subLayerSQL));
      console.log(getSQL(subLayerSQL));
    }

    subLayer.show();
    $('#helper_box').show();
    $('#helper_box #' + subLayerID).show();

    // deselect all and select the clicked one
    $workLayers.removeClass('selected');
    $('a', $li).addClass('selected');
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
    _.templateSettings.variable = "rc";
    applyTemplates();
    initSubLayerWatch();
   })
  .error(function(err) {
    console.log(err);
  });
}

$(document).ready(function() {
  main()
});

