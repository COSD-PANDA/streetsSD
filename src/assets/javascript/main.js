var global = {
  workLayers: {}
};

var viewController = {
  clearState: function() {
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
  },

  loadMapInfo: function(target) {
    var subLayerNum = target.attr('data-sublayer');
    //var subLayerSQL = $target.attr('data-sql') || null;
    //var calcTDistance = $li.attr('data-calctdistance') || null;
    var subLayerID = target.attr('id');
    this.clearState();
    var subLayer = global.layers[1].getSubLayer(subLayerNum);
    subLayer.setSQL(sqlBuilder.getLayerSQL(subLayerID));
  },

  executeOps: function(ops) {
    // Check for Ops, Execute as Needed:
    var ops = (target.data('ops')).split(',') || null;
    if (ops) {

    }
  }


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
    $('#helper_box #helper_box_top').append(hLink);
  });
}


function initSubLayerWatch() {
  viewController.clearState();

  var $workLayers = $('#layer-selector a.layer-opt');

  $workLayers.click(function(e) {
    // Load Map Info
    var target = $(e.target);
    viewController.loadMapInfo(target);
    viewController.executeOps();
    
    
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
            chartX.push(element.coalesce)
            chartData.push(d3.round(element.totalmiles, 2));
          });
          $("#chart-title-2 h4").text("Work By Month");
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
                title: function(x) {
                  console.log(x)
                  var date = chartX[x+1];
                  return moment(date, "M").format("MMM") + " Total";
                  //return moment(x+1, "M-YY").format("MMM 'YY")
                },
                name: function (name, ratio, id, index) {
                  return name.charAt(0).toUpperCase() + name.slice(1) + " paved";
                }
              }
            },
            axis: {
              x: {
                type: 'category', // this needed to load string x value
                tick: {
                  culling: false,
                  format: function(x) { return moment(x+1, "M").format("MMM"); }
                }
              },
              y: {
                label: {
                  text: "Miles Paved",
                  position: "inner-top"
                }
              }
            }
          });
        })

      }
      if (_.indexOf(ops, 'typeBreakdown') !== -1) {
        var sqlString = getDistanceSQL(subLayerSQL, null, "spp2.activity");
        console.log(sqlString);
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
          chartData.push(["Total Distance", tDistance]);
          window.progress = c3.generate({
            bindto: '#chart-container-2',
            size: { height: 215 },
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

    if (_.indexOf(ops, 'ociBreakdown') !== -1) {
        var sqlString = getOCIBreakdownSQL();
        console.log(sqlString);
        sql.execute(sqlString).done(function(data) {
          chartData = [];
          _.each(data.rows, function(element, index) {
            chartData.push([element.color, element.totalmiles]);
          });
          console.log(chartData);
          $("#chart-title-1 h4").text("OCI Breakdown");
          window.typeBreakdown = c3.generate({
            bindto: '#chart-container-1',
            data: {
              type: 'pie',
              columns: chartData,
              colors: {
                 "r": "#B81609",
                 "y": "#FFCC00",
                 "g": "#229A00"
              }
            },
            tooltip: {
              format: {
                name: function (name, ratio, id, index) {return name},
                value: function (value, ratio, id, index) { return d3.round(value, 2) + " Miles"; }
              }
            }
          });
          // Force open the bottomBar
          bottomBarToggle('open');
        });
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
    $('.sidebar-navbar-collapse').addClass('in');
  }
  else {
    console.log('action: ' + forceAction);
    console.log('open bar');
    $('#bottom-bar').animate({'bottom': 0});
    $('#bottom-bar .tab').addClass('active').text('Less Info');
    $('.sidebar-navbar-collapse').removeClass('in');
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

function initMarkdown() {
  $('.modal-body').each(function(index, element) {
    var md = $(element).text();
    console.log(md);
    $(element).html(marked(md));
  })
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
    /*_.templateSettings.variable = "rc";*/
    /*applyTemplates();*/
    initSubLayerWatch();
    /*initMarkdown();*/
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

