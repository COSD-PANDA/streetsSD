
var loadOpts = function() {
  var options = {
    "all-work": {
      "sublayer" : "1",
      "sql": "1",
      "title": "All Work",
      "description": "All work that occured since Jan 1, 2012, updated quarterly"
    },
    "future-work": {
      "sublayer" : "1",
      "sql": "1",
      "title": "Planned Future Work",
      "description": "Planned Future Work"
    },
    "oci-2011": {
      "sublayer" : "2",
      "sql": "0",
      "title": "OCI as of 2011",
      "description":"Overall Condition Index is the condition of our streets measured in 2011. The City is updating this information in 2015. A street may have a low OCI, but not be scheduled for paving in order to accomodate other planned construction work on the street in the future."
    },


  }
  window.layerOptions = options;
}

$(document).ready(function() {
  loadOpts();
});


