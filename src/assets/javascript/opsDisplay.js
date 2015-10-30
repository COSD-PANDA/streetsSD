var opsDisplay = (function() {
    // Private.

    colors = {
        oci: {
            good: "#0098db",
            fair: "#ffa02f",
            poor: "#fcd900",
        },
        activity: {
            overlay: "#0098db",
            slurry: "#ffa02f",
            concrete: "#fcd900",
        }
    };

    typeBreakdown = function(subLayerID, data) {
        chartData = [];
        var oc = opsControl;
        console.log(data);
        _.each(data.rows, function(element, index) {
            chartData.push([element.activity, element.totalmiles]);
        });
        $("#chart-title-1 h4").text("Work Type Breakdown");
        window.typeBreakdown = c3.generate({
            bindto: '#chart-container-1',
            data: {
                type: 'pie',
                columns: chartData,
                colors: { 
                    "Slurry": colors.activity.slurry, 
                    "Overlay": colors.activity.overlay,
                    "Concrete": colors.activity.concrete 
                }
            },
            tooltip: {
              format: {
                name: function (name, ratio, id, index) { return name; },
                value: function (value, ratio, id, index) { return d3.round(value, 0) + " Miles"; }
              }
            }
        });
    };

    workByMonth = function(subLayerID, data) {
        chartData = ['miles'];
        chartX = ['x']
        _.each(data.rows, function(element, index) {
            chartX.push(element.to_char)
            chartData.push(d3.round(element.totalmiles, 0));
        });
        console.log(chartX);
        $("#chart-title-2 h4").text("Work By Month");
        window.workByMonth = c3.generate({
        bindto: '#chart-container-2',
        data: {
          x: 'x',
          type: 'bar',
          columns: [chartX, chartData]
        },
        color: { pattern: ['#0098db'] },
        bar: { width: { ratio: 0.5 } },
        legend: { hide: true },
        tooltip: {
          grouped: false,
          format: {
            title: function(x) {
              var date = chartX[x + 1];
              return moment(date, "M").format("MMM") + " Total";
            },
            name: function (name, ratio, id, index) {
              return name.charAt(0).toUpperCase() + name.slice(1);
            }
          }
        },
        axis: {
          x: {
            type: 'category', // this needed to load string x value
            tick: {
              culling: false,
              format: function(x) { return moment(chartX[x + 1], "M").format("MMM"); }
            }
          },
          y: {
            label: { text: "Miles", position: "inner-top" }
          }
        }
      });
    };

    // Public API
    return {
        typeBreakdown: function(subLayerID, data) {
            return typeBreakdown(subLayerID, data);
        },
        workByMonth: function(subLayerID, data) {
            return workByMonth(subLayerID, data);
        }
    };
})();
