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
      console.log(vis);
      console.log(layers);
      $('body').removeClass('.map-loading').addClass('map-loaded');
      global.vis = vis;
      global.layers = layers;
      global.map = vis.getNativeMap();
      vc.initSubLayerWatch();
      vc.initBottomBar();
      // Default
      vc.initIntro();
      // Force intro
      //initIntro(true);
      vc.initModalLinks();
      vc.initLocationLinks()
     })
    .error(function(err) {
      console.log(err);
    });
  },
  initLocationLinks: function() {
    var vc = this;
    $('a#find-me-link').click(function(e) {
      vc.detectUserLocation();
      return false;
    });
    $('form#address-search').submit(function(e) {
      address = $('input', this).val();
      vc.getAddressLocation(address); 
      return false;
    })
  },
  initModalLinks: function() {
      $('a.modal-link').click(function(e) {
        var modalTarget = "#" + $(this).data('modal-target');
        console.log(modalTarget);
        $(modalTarget).modal({ backdrop: false });
      })
  },
  initSubLayerWatch: function() {
      viewController.clearState();

      var $workLayers = $('#layer-selector a.layer-opt');

      $workLayers.click(function(e) {
        // Load Map Info
        var target = $(e.target);
        viewController.loadMapInfo(target);
        viewController.executeOps(target);

        console.log('click trig');
        $('#sidebar-checkbox').prop("checked", false);

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
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = "expires="+d.toUTCString();
      document.cookie = cname + "=" + cvalue + "; " + expires;
  },
  clearState: function() {
    $('#helper_box').hide();
    $('#helper_box .helper_section').hide();
    $('#helper_box .bignums').hide();
    var num_sublayers = global.layers[1].getSubLayerCount();
    for (var i = 0; i < num_sublayers; i++)
      global.layers[1].getSubLayer(i).hide();
    $('.chart-title h4').text("");
    if (window.typeBreakdown)
      window.typeBreakdown = window.typeBreakdown.destroy();
    if (window.progress)
      window.progress = window.progress.destroy();
    if (window.workByMonth)
      window.workByMonth = window.workByMonth.destroy();
  },
  mapToPosition: function(position) {
    console.log('mpc')
    console.log(position)
    lon = position.coords.longitude;
    lat = position.coords.latitude;
    global.map.setView(new L.LatLng(lat,lon), 14);
  },
  loadMapInfo: function(target) {
    // TODO -- there's a bug here for showing OCI.
    var subLayerNum = target.attr('data-sublayer');
    var setSQL = target.attr('data-sql');
    var subLayerID = target.attr('id');
    this.clearState();
    var subLayer = global.layers[1].getSubLayer(subLayerNum);
    console.log(subLayer);
    if (setSQL == 1) {
      var query = sqlBuilder.getLayerSQL(subLayerID);
      console.log(query);
      subLayer.setSQL(query);
    }
    subLayer.show();
    $('#helper_box #' +  subLayerID + ".helper_section").show();
    $('#helper_box').show();
  },
  executeOps: function(target) {
    // Check for Ops, Execute as Needed:
    var ops = (target.data('ops')).split(',') || null;
    if (ops) {
      console.log(ops);
      _.each(ops, function(element, index) {
          opsControl[element]($(target).attr('id'))
      });
      // Remove blank intro if there
      $('#bottom-bar-content #blank-intro').remove();
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
  },
  getAddressLocation: function(address) {
    var vc = this;
    $.get("https://pickpoint.io/api/v1/forward?key=XYjMsMG9CXK6mq57Z_vG", {
      "q": address,
      "countrycodes": "us",
      "addressdetails": "1",
      "limit": "1",
      "bounded": "1",
      "viewbox": ["-67.956039", "10.27012", "-67.941757", "10.25608"]
    }
    ).success(function(data) {
      console.log(data);
      loc = _.first(data);
      vc.mapToPosition({ 
        coords: {
          longitude: loc.lon,
          latitude: loc.lat
        }
      })
    })
  },
  detectUserLocation: function() {
    var vc = this;
    if (navigator.geolocation) {
      var timeoutVal = 10 * 1000 * 1000;
      navigator.geolocation.getCurrentPosition(
        vc.mapToPosition, 
        vc.alertError,
        { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
      );
    }
    else {
      alert("Geolocation is not supported by this browser");
    }
  },
  alertError: function(error) {
    var errors = { 
      1: 'Permission denied',
      2: 'Position unavailable',
      3: 'Request timeout'
    };
    alert("Error: " + errors[error.code]);
  }
}







$(document).ready(function() {
  viewController.init();
});

