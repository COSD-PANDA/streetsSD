
var loadOpts = function() {
  var options = {
    "all-work": {
      "sublayer" : "1",
      "sql": "1",
      "title": "All Work",
      "ops": ['typeBreakdown', 'workByMonth'],
      "description": "All work that occured since Jan 1, 2012 to date, updated quarterly",
    },
    /*"all-work-since-mayor": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done under M. Faulconer",
      "description": "All work that has been performed since Mayor Faulconer took office March 3, 2014 to date, updated quarterly"
    },*/
    "work-1k-pledge": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done For 1k Pledge",
      "ops": ['typeBreakdown', 'progress'],
      "description": "All work that occured since Jul 1, 2015."
    },
    "work-fy-2013": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done in FY-2013",
      "ops": ['typeBreakdown', 'workByMonth'],
      "description": "All work that occured since July 1, 2012 until June 31, 2013."
    },
    "work-fy-2014": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done in FY-2014",
      "ops": ['typeBreakdown', 'workByMonth'],
      "description": "All work that occured since July 1, 2013 until June 31, 2014."
    },
    "work-fy-2015": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done in FY-2015",
      "ops": ['typeBreakdown', 'workByMonth'],
      "description": "All work that occured since July 1, 2014 until June 30, 2015."
    },
    "future-work": {
      "sublayer" : "1",
      "sql": "1",
      "calcTDistance": "1",
      "ops": [ 'calcTDistance', 'typeBreakdown', 'workByMonth'],
      "title": "Planned Future Work",
      "description": "Mayor Faulconer has pledged to pave 1,000 miles of streets over the next 5 years. Future work includes <span class='tDistance'></span> miles of currently planned streets and is updated quarterly. More streets will be added as additional streets are identified to meet the 1,000 mile pledge."
    },
    "oci-2011": {
      "sublayer" : "2",
      "sql": "0",
      "ops": [ 'ociBreakdown' ],
      "title": "OCI as of 2011",
      "description":"Overall Condition Index is the condition of our streets measured in 2011. The City is updating this information in 2015. A street may have a low OCI, but not be scheduled for paving in order to accomodate other planned construction work on the street in the future."
    }
  }
  window.layerOptions = options;
}

loadIntroOptions = function() {
  var introOptions = {
    tooltipClass: "intro-tooltip",
    steps: [{
      intro: "Welcome to SD Infrastructure Map."
    },
    {
      element: '#work-layers',
      intro: "Click on one of these to see the map",
      position: 'right'
    },
    {
      element: 'div.cartodb-zoom',
      intro: "You can pan the map by clicking and dragging or zoom in or out using these buttons",
      position: 'left'
    }
    ]
  }
  window.introOptions = introOptions;
}



$(document).ready(function() {
  loadOpts();
  loadIntroOptions();

});


