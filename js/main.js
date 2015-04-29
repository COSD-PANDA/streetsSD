var global = {
  workLayers: {}
};

function getLastQuarter(date) {
  var date = date || new Date();
  var sqlFormatDate = ('YYYY-MM-DD');
  var quarterAdjustment= (moment(date).month() % 3) + 1;
  var lastQuarterEndDate = moment(date).subtract({ months: quarterAdjustment }).endOf('month');
  var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({ months: 3 }).startOf('month');
  return {
    start: lastQuarterStartDate.format(sqlFormatDate),
    end: lastQuarterEndDate.format(sqlFormatDate)
  }
}

function getSQLConditions(sqlKey, previousSQL) {
  var lastQuarter = getLastQuarter();
  SQL = previousSQL || "";
  switch (sqlKey) {
    case 'all-work':
      // Date columns are not NULL.
      SQL += "WHERE (spp2.date_ is not null OR spp2.est_date is not null) ";
      // Work Done Date / Work Est Date is after 2012-01-01
      SQL += "AND (spp2.date_::date >= '2012-01-01' OR spp2.est_date::date >= '2012-01-01') ";
      // Impose Quarter Limit on Work Done for Accuracy / Consistency.
       SQL += "AND (spp2.date_::date <= '" + lastQuarter.end + "') ";
      break;

    case 'all-work-since-mayor':
      // Work Done Date is not NULL.
      SQL += "WHERE (spp2.date_ is not null) ";
      // Work Done Date is after March 3, 2014.
      SQL += "AND (spp2.date_::date >= '2014-03-03') ";
      // Impose Quarter Limit on Work Done for Accuracy / Consistency.
      SQL += "AND (spp2.date_::date <= '" + lastQuarter.end +"') ";
      break;


    case 'work-fy-2013':
      // Work Done Date is not NULL.
      SQL += "WHERE (spp2.date_ is not null) ";

      // Work Done Date is after Jul 1, 2012.
      SQL += "AND (spp2.date_::date >= '2012-07-01') ";

      // Work Done Date is before June 30, 2013.
      SQL += "AND (spp2.date_::date <= '2013-06-30') ";
      break;

    case 'work-fy-2014':
      // Work Done Date is not NULL.
      SQL += "WHERE (spp2.date_ is not null) ";

      // Work Done Date is after Jul 1, 2013.
      SQL += "AND (spp2.date_::date >= '2013-07-01') ";

      // Work Done Date is before June 30, 2014.
      SQL += "AND (spp2.date_::date <= '2014-06-30') ";
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
      // Work Done Date is not NULL.
      SQL += "WHERE (spp2.date_ is not null) ";

      // Work Done Date is after Jan 1, 2015.
      SQL += "AND (spp2.date_::date >= '2015-01-01') ";

      // Work Done Date is before end of this quarter.
      SQL += "AND (spp2.date_::date <= '" + lastQuarter.end + "') ";
      break;

    case 'future-work':
      // Bring in work completed after the current quarter.
      SQL += "WHERE (spp2.date_ >= '" + lastQuarter.end + "') ";

      // Bring in all work with an estimated date.
      SQL += "OR (spp2.est_date is not null) ";

      break;
  }
  return SQL;
}

function getTotalDistanceSQL(sqlKey) {
  var SQL = "SELECT spp2.district, " +
    "SUM(ST_Length(ST_AsText(ST_Transform(spp2.the_geom,26915)))/1609.34) as totalMiles " +
    "FROM spp2 ";
    SQL = getSQLConditions(sqlKey, SQL);
    SQL += "GROUP BY DISTRICT";
    return SQL;
}

function getLayerSQL(sqlKey) {
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

  return getSQLConditions(sqlKey, SQL);
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
    $('ul#work-layers').append(tLink);
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

  var $workLayers = $('ul#work-layers li.sidebar-link a');
  $workLayers.click(function(e) {
    // get the area of the selected layer
    var $li = $(e.target).parent('li');
    var subLayerNum = $li.attr('data-sublayer');
    var subLayerSQL = $li.attr('data-sql') || null;
    var calcTDistance = $li.attr('data-calctdistance') || null;
    var subLayerID = $li.attr('id');
    clearState();
    var subLayer = global.layers[1].getSubLayer(subLayerNum);

    if (subLayerSQL) {
      subLayer.setSQL(getLayerSQL(subLayerSQL));
      console.log(getLayerSQL(subLayerSQL));
    }

    if(calcTDistance) {
      var sql = new cartodb.SQL({ user: 'maksim2' });
      var sqlString = getTotalDistanceSQL(subLayerSQL);
      sql.execute(sqlString).done(function(data) {

        var sum = _.sum(data.rows, function(row) {
          return row.totalmiles;
        });
        $('.tDistance', '#helper_box #' + subLayerID).text(
        _.sum(data.rows, function(row) { return row.totalmiles; }).toFixed(2));
      });
    }

    subLayer.show();
    $('#helper_box').show();
    $('#helper_box #' + subLayerID).show();

    // Deselect all and select the clicked one
    $workLayers.removeClass('selected');
    $('a', $li).addClass('selected');
  });
}

function initIntro() {
  introJs().start();
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
    initIntro();
   })
  .error(function(err) {
    console.log(err);
  });
}

$(document).ready(function() {
  main();
});

