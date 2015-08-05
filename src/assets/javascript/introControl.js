function startIntro() {
  var intro = introJs();
  intro.setOptions({
    tooltipClass: "intro-tooltip",
    steps: [{
      intro: "Welcome to SDStreets, an explorer of the street work City of San Diego is up to."
    },
    {
      element: "label.sidebar-toggle",
      intro: "Click on this icon to see the available views.",
      position: "right"
    },
    {
      element: "div.cartodb-zoom",
      intro: "Use the zoom control to zoom or out of the map.  You can also drag the map to pan.",
      position: "left"
    },
    {
      element: "#bottom-bar-tab",
      intro: "When you're looking at a view, extra metrics will come up here.  If you don't want to see them, click on the blue bar and they will dissapear.",
      position: "top"
    },
    {
      element: "i.question-help",
      intro: "Click on the ? to learn more!",
      position: "left"
    }]
  });

  /*intro.onbeforechange(function(targetElement) {
    console.log('on before');
    console.log(targetElement);
    if ($(targetElement).hasClass('sidebar-toggle')) {
      $(targetElement).click();
      this.refresh();
    }
  });

  intro.onafterchange(function(targetElement) {
    this.refresh();
    if ($(targetElement).hasClass('sidebar-toggle')) {
      this.goToStep(2);
    }
  });*/

  intro.start();
}





