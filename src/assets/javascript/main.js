var global = {
  workLayers: {}
};

var viewController = {
  init: function() {
    var vc = this;
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
      vc.initSubLayerWatch();
      vc.initBottomBar();
      // Default
      vc.initIntro();
      // Force intro
      //initIntro(true);
     })
    .error(function(err) {
      console.log(err);
    });
  },
  initSubLayerWatch: function() {
      viewController.clearState();

      var $workLayers = $('#layer-selector a.layer-opt');

      $workLayers.click(function(e) {
        // Load Map Info
        var target = $(e.target);
        viewController.loadMapInfo(target);
        viewController.executeOps(target);
      
        $('.sidebar-toggle').click();
        
        $workLayers.removeClass('active');
        $('a', target).addClass('active');
      });
  },
  initBottomBar: function () {
    $('#bottom-bar .tab').click(viewController.bottomBarToggle);
  },
  initIntro: function(force) {
      var force = force || false;
      var cookie = this.getCookie("sdInfraIntro");
      if (cookie == null || cookie == "" || force == true) {
        this.setCookie("sdInfraIntro", "1",90);
        startIntro();
      }
  },
  getCookie: function(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
      }
      return "";
  },
  setCookie: function(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      var expires = "expires="+d.toUTCString();
      document.cookie = cname + "=" + cvalue + "; " + expires;
  },
  clearState: function() {
    $('#helper_box .helper_section').hide();
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
    subLayer.show();
    $('#helper_box #' +  subLayerID + ".helper_section").show();
  },
  executeOps: function(target) {
    // Check for Ops, Execute as Needed:
    var ops = (target.data('ops')).split(',') || null;
    if (ops) {
      console.log(ops);
      _.each(ops, function(element, index) {
          opsControl[element]($(target).attr('id'))
      });
      this.bottomBarToggle('open');
    }
  },
  bottomBarToggle: function(forceAction) {
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
}







$(document).ready(function() {
  viewController.init();
});

