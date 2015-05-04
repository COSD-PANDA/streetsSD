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
      // Activity Column is not NULL.
      SQL += "AND (spp2.activity is not null) ";
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

      case 'work-2012':
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
  // Filter out activity = null.
  SQL += "AND (spp2.activity is not null) ";
  return SQL;
}

function getDistanceSQL(sqlKey, extraConditions, groupBy) {
  var SQL = "SELECT " + groupBy + ", " +
    "SUM(ST_Length(ST_AsText(ST_Transform(spp2.the_geom,26915)))/1609.34) as totalMiles " +
    "FROM spp2 ";
    SQL = getSQLConditions(sqlKey, SQL);
    if (extraConditions)
      SQL += extraConditions;

    if (groupBy)
      SQL += "GROUP BY " + groupBy;

    return SQL;
}

function getTotalDistanceSQL(sqlKey, activityKey) {
  var SQL = "SELECT spp2.district, " +
    "SUM(ST_Length(ST_AsText(ST_Transform(spp2.the_geom,26915)))/1609.34) as totalMiles " +
    "FROM spp2 ";
    SQL = getSQLConditions(sqlKey, SQL);
    console.log(SQL);
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
  $('.chart-title h4').text("");
  if (window.typeBreakdown)
    window.typeBreakdown = window.typeBreakdown.destroy();
  if (window.progress)
    window.progress = window.progress.destroy();
  if (window.workByMonth)
    window.workByMonth = window.workByMonth.destroy();
}

function applyTemplates() {
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
    var ops = $li.data('ops')
    clearState();
    var subLayer = global.layers[1].getSubLayer(subLayerNum);

    if (subLayerSQL) {
      subLayer.setSQL(getLayerSQL(subLayerSQL));
    }
    if (ops && ops != '' && ops != null) {

      var sql = new cartodb.SQL({ user: 'maksim2' });
      ops = ops.split(',');

      if(_.indexOf(ops, 'calcTDistance') !== -1) {
        var sqlString = getDistanceSQL(subLayerSQL, null, "spp2.district");
        console.log(sqlString);
        sql.execute(sqlString).done(function(data) {
          $('.tDistance', '#helper_box #' + subLayerID).text(
            _.sum(data.rows, function(row) { return row.totalmiles; }).toFixed(2)
          );
        });
      }

      if(_.indexOf(ops, 'workByMonth') !== -1) {
        var month = "COALESCE(to_char(spp2.est_date, 'MM'), to_char(spp2.date_, 'MM'))"
        var sqlString = getDistanceSQL(subLayerSQL, null, month);
        sqlString += " ORDER BY " + month;
        console.log(sqlString);
        sql.execute(sqlString).done(function(data) {
          console.log(data)
          chartData = ['miles'];
          chartX = ['x']
          _.each(data.rows, function(element, index) {
            chartX.push( moment(element.coalesce, "M").format("MMM") )
            chartData.push(d3.round(element.totalmiles, 2));
          });
          $("#chart-title-2 h4").text("Work Done By Month");
          window.workByMonth = c3.generate({
            bindto: '#chart-container-2',
            data: {
              x: 'x',
              type: 'bar',
              columns: [chartX, chartData]
            },
            bar: {
              width: { ratio: 0.5 }
            },
            legend: { hide: true },
            tooltip: {
              grouped: false,
              format: {
                //title: function(x) { return moment(x+1, "M").format("MMM "YY") },
                title: function(x) { return moment(x+1, "M").format("MMM 'YY") },
                name: function (name, ratio, id, index) {
                  return name.charAt(0).toUpperCase() + name.slice(1) + " paved";
                }
              }
            },
            axis: {
              x: {
                type: 'category' // this needed to load string x value
              }
            }
          });
        })

      }
      if (_.indexOf(ops, 'typeBreakdown') !== -1) {
        var sqlString = getDistanceSQL(subLayerSQL, null, "spp2.activity");
        sql.execute(sqlString).done(function(data) {
          chartData = [];
          _.each(data.rows, function(element, index) {
            chartData.push([element.activity, element.totalmiles]);
          });
          console.log(chartData);
          $("#chart-title-1 h4").text("Work Type Breakdown");
          window.typeBreakdown = c3.generate({
            bindto: '#chart-container-1',
            data: {
              type: 'pie',
              columns: chartData
            },
            pie: {
              /*label: {
                format: function (value, ratio, id) {
                   return d3.round(value, 2) + " Miles";
                }
              }*/
            },
            tooltip: {
              format: {
                name: function (name, ratio, id, index) { return name; },
                value: function (value, ratio, id, index) { return d3.round(value, 2) + " Miles"; }
              }
            }
          });
          // Force open the bottomBar
          bottomBarToggle('open');
        });
      }

      if (_.indexOf(ops, 'progress') !== -1) {
        var sqlString = getDistanceSQL(subLayerSQL, null, "spp2.district");
        sql.execute(sqlString).done(function(data) {

          var tDistance = _.sum(data.rows, function(row) { return row.totalmiles; }).toFixed(2)
          var chartData = [];
          chartData.push(["Total Distance Planned", tDistance]);
          window.progress = c3.generate({
            bindto: '#chart-container-2',
            size: { height: 170 },
            data: {
              type: 'gauge',
              columns: chartData
            },
            gauge: {
              max: 1000,
              width: 20,
              units: ' miles',
              label: {
                format: function(value, ratio) { return value; },
                show: true // to turn off the min/max labels.
              }
            }
          });
          bottomBarToggle('open');
        });
      }
    }

    subLayer.show();
    $('#helper_box').show();
    $('#helper_box #' + subLayerID).show();

    // Deselect all and select the clicked one
    $workLayers.removeClass('active');
    $('a', $li).addClass('active');
  });
}

function initBottomBar() {
  $('#bottom-bar .tab').click(bottomBarToggle);
}
function bottomBarToggle(forceAction) {
  var forceAction = typeof forceAction === 'string' ? forceAction : null;
  if ((forceAction !== null && forceAction == 'close') ||
      (forceAction === null && $('#bottom-bar .tab').hasClass('active'))) {
    console.log('action: ' + forceAction);
    console.log('close bar');

    $('#bottom-bar').animate({'bottom': -($('#bottom-bar .tab-content').height())});
    $('#bottom-bar .tab').removeClass('active').text('More Info');
  }
  else {
    console.log('action: ' + forceAction);
    console.log('open bar');
    $('#bottom-bar').animate({'bottom': 0});
    $('#bottom-bar .tab').addClass('active').text('Less Info');
  }
}

function initIntro(force) {
  var force = force || false;
  var intro = introJs().setOptions(window.introOptions);
	var cookie=getCookie("sdInfraIntro");
  if (cookie==null || cookie=="" || force == true) {
    setCookie("sdInfraIntro", "1",90);
    intro.start();
  }
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1);
    if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

 function main() {
  cartodb.createVis('map', 'https://maksim2.cartodb.com/api/v2/viz/1387c31c-e546-11e4-a74b-0e853d047bba/viz.json', {
    tiles_loader: true,
    center_lat: 32.7150,
    center_lon: -117.1625,
    zoom: 11
  })
  .done(function(vis, layers) {
    $('body').removeClass('.map-loading').addClass('map-loaded');
    global.vis = vis;
    global.layers = layers;
    _.templateSettings.variable = "rc";
    applyTemplates();
    initSubLayerWatch();
    initBottomBar();
    // Default
    initIntro();
    // Force intro
    //initIntro(true);
   })
  .error(function(err) {
    console.log(err);
  });
}

$(document).ready(function() {
  main();
});

