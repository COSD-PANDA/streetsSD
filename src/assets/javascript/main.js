var global = {
  workLayers: {}
};

var viewController = {
  init: function() {
    var vc = this;
    cartodb.createVis('map', 'https://cityofsandiego.carto.com/u/cityofsandiego-admin/api/v2/viz/88b41ee8-6ae6-11e6-949c-0e05a8b3e3d7/viz.json', {
      tiles_loader: true,
      center_lat: 32.7150,
      center_lon: -117.1625,
      zoom: 11
    })
    .done(function(vis, layers) {
      $('body').removeClass('.map-loading').addClass('map-loaded');
      global.vis = vis;
      global.layers = layers;
      global.map = vis.getNativeMap();
      vc.initSubLayerWatch();
      vc.initBottomBar();
      vc.initModalLinks();
      vc.initLocationLinks()
      vc.initFirstLayer();
      vc.initShare();
      // Default
      vc.initIntro();
      // Force intro
      //vc.initIntro(true);
      // Set CSS on Layers:
     })
    .error(function(err) {
      console.log(err);
    });
  },
  initShare: function() {
    new ShareButton({
      url: "http://sdstreets.org",          // the url you'd like to share. [Default: `window.location.href`]
      title: "SDStreets Alpha",        // title to be shared alongside your link [Default: See below in defaults section]
      description: "San Diego Street Work.", // text to be shared alongside your link, [Default: See below in defaults section]
      //image:        // image to be shared [Default: See below in defaults section]
      ui: {
        flyout:  'middle right',       // change the flyout direction of the shares. chose from `top left`, `top center`, `top right`, `bottom left`, `bottom right`, `bottom center`, `middle left`, or `middle right` [Default: `top center`]
        //button_font:  // include the Lato font set from the Google Fonts API. [Default: `true`]
        buttonText: "",  // change the text of the button, [Default: `Share`]
        //icon_font:    // include the minified Entypo font set. [Default: `true`]
      },
      networks: {
        googlePlus: { enabled: false },
        pinterest: { enabled: false },
        reddit: { enabled: false },
        linkedin: { enabled: false },
        whatsapp: { enabled: false },
        email: { enabled: false }
      }
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
    var vc = this;
    $('a.modal-link').click(function(e) {
      var modalTarget = $(this).attr('href');
      var trigger = $(this);
      $(modalTarget).modal({ backdrop: true });
      $(modalTarget).one('shown.bs.modal', function() {
        vc.showModalAndHighlight(trigger);
      });
      $(modalTarget).one('hidden.bs.modal', function() {
          setTimeout(function() {
              $('.sidebar-toggle').click();
          } ,500);
      });

      return false;
    });
  },
  initFirstLayer: function() {
    $('#layer-selector a#all-work').click();
  },
  showModalAndHighlight: function(trigger) {
    var modalShow = $(trigger).data('modal-show');
    var modalTarget = $(trigger).attr('href');
    $('.modal-body span').removeClass('modal-highlighted-section');
    if (modalShow) {
      modalShow = "#" + modalShow;
      $(modalShow, modalTarget).addClass('modal-highlighted-section');
    }
  },
  initSubLayerWatch: function() {
      viewController.clearState();

      var $workLayers = $('#layer-selector a.layer-opt');

      $workLayers.click(function(e) {
        // Load Map Info
        var target = $(e.target);
        $('#sidebar-checkbox').prop("checked", false);

        $workLayers.removeClass('active');
        $(target).addClass('active');

        viewController.loadMapInfo(target);
        viewController.executeOps(target);


      });
  },
  initBottomBar: function () {
    $('#bottom-bar .tab').click(viewController.bottomBarToggle);
  },
  initIntro: function(force) {
      var force = force || false;
      var cookie = this.getCookie("sdInfraIntro");
      if (cookie == null || cookie == "" || force == true) {
        this.setCookie("sdInfraIntro", "1", 90);
        $('a#help-link').click();
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
    for (var i = 0; i < num_sublayers; i++) {
      global.layers[1].getSubLayer(i).hide();
      //global.layers[1].infowindow.set('visibility', false);
    }
    $('.chart-title h4').text("");
    if (window.typeBreakdownChart)
      window.typeBreakdownChart = window.typeBreakdownChart.destroy();
    if (window.progressChart)
      window.progressChart = window.progressChart.destroy();
    if (window.workByMonthChart)
      window.workByMonthChart = window.workByMonthChart.destroy();
  },
  mapToPosition: function(position) {
    lon = position.coords.longitude;
    lat = position.coords.latitude;
    if (this.geoLocMarker)
      global.map.removeLayer(this.geoLocMarker);

    this.geoLocMarker = new L.CircleMarker([lat,lon],{
      radius: 7,
      color: '#00549f',
      opacity: 1,
      fill: true,
      fillOpacity: 0.8
    });
    this.geoLocMarker.addTo(global.map);
    global.map.setView(new L.LatLng(lat,lon), 15);

  },
  loadMapInfo: function(target) {
    var subLayerNum = target.attr('data-sublayer');
    var setSQL = target.attr('data-sql');
    var subLayerID = target.attr('id');
    this.clearState();
    var subLayer = global.layers[1].getSubLayer(subLayerNum);
    if (setSQL == 1) {
      var query = sqlBuilder.getSQL(subLayerID);
      console.log("Set Map Query For Layer: " + subLayerID + " with Number " + subLayerNum)
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
      _.each(ops, function(element, index) {
          opsControl[element]($(target).attr('id'))
      });
      // Remove blank intro if there
      $('#bottom-bar-content #blank-intro').remove();

      // Inject Dates.
      var lq = sqlBuilder.getLastQuarter();
      $('.lqEnd').text(moment(lq.end).format("MMMM D, YYYY"));

      var layerTitle = $('#layer-selector a.active').html();
      this.bottomBarToggle('open');
    }
  },
  bottomBarToggle: function(forceAction) {
    var layerTitle = $('#layer-selector a.active').html();
    var cUp = unescape(' <i class="fa fa-chevron-up"></i> ');
    var cDn = unescape(' <i class="fa fa-chevron-down"></i> ');
    var forceAction = typeof forceAction === 'string' ? forceAction : null;
    if ((forceAction !== null && forceAction == 'close') ||
        (forceAction === null && $('#bottom-bar .tab').hasClass('active'))) {

      $('#bottom-bar').animate({'bottom': -($('#bottom-bar .tab-content').height())});
      $('#bottom-bar .tab').removeClass('active').html(cUp + layerTitle + cUp);
      $('.sidebar-navbar-collapse').addClass('in');
    }
    else {
      $('#bottom-bar').animate({'bottom': 0});
      $('#bottom-bar .tab').addClass('active').html(cDn + layerTitle + cDn);
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
  $.reject({
      reject: {
        //all: true
        msie: 10
      },
      imagePath: './assets/images/browsers/',
      display: ['chrome', 'firefox'],
      header: 'You Internet Browser is not compatible with SDStreets!',
      paragraph1: 'Because of this, various things may not work. '+
                'Please see the list of compatible browsers below. ',
      paragraph2: 'Just click on the icons to get to the download page!',
  });
  viewController.init();
});
