
var loadOpts = function() {
  var options = {
    "all-work": {
      "sublayer" : "1",
      "sql": "1",
      "title": "All Work",
      "description": "All work that occured since Jan 1, 2012 to date, updated quarterly",
      //"intro": "Click on a link to see the map data associated.",
      "boxIntro": "You will see a description of the layer in the box below."
    },
    /*"all-work-since-mayor": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done under M. Faulconer",
      "description": "All work that has been performed since Mayor Faulconer took office March 3, 2014 to date, updated quarterly"
    },*/
    "work-fy-2013": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done in Fiscal Year 2013",
      "description": "All work that occured since July 1, 2012 until June 31, 2013."
    },
    "work-fy-2014": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done in Fiscal Year 2014",
      "description": "All work that occured since July 1, 2013 until June 31, 2014."
    },
    "work-2012": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done in 2012",
      "description": "All work that occured since Jan 1, 2012 until Dec 31, 2012."
    },
    "work-2013": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done in 2013",
      "description": "All work that occured since Jan 1, 2013 until Dec 31, 2013."
    },
    "work-2014": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done in 2014",
      "description": "All work that occured since Jan 1, 2014 until Dec 31, 2014."
    },
    "work-2015": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Work Done To Date in 2015",
      "description": "All work that occured since Jan 1, 2015 until March 31, 2015.  Updated Quarterly."
    },

    "future-work": {
      "sublayer" : "1",
      "sql": "1",
      "calcTDistance": "1",
      "title": "Planned Future Work",
      "description": "Mayor Faulconer has pledged to pave 1,000 miles of streets over the next 5 years. Future work includes <span class='tDistance'></span> miles of currently planned streets and is updated quarterly. More streets will be added as additional streets are identified to meet the 1,000 mile pledge."
    },
    "oci-2011": {
      "sublayer" : "2",
      "sql": "0",
      "title": "OCI as of 2011",
      "description":"Overall Condition Index is the condition of our streets measured in 2011. The City is updating this information in 2015. A street may have a low OCI, but not be scheduled for paving in order to accomodate other planned construction work on the street in the future."
    }


  }
  window.layerOptions = options;
}



$(document).ready(function() {
  loadOpts();
});


