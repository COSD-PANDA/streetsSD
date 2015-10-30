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

    // Public API.
    return {
        calcTDistance: function(subLayerID, data) {
            $('.tDistance', '#helper_box #' + subLayerID).text(
                _.sum(data.rows, function(row) { return row.totalmiles; }).toFixed(0)
            );
        },

        typeBreakdown: function(subLayerID, data) {
            chartData = [];
            var oc = opsControl;
            console.log(data);
            _.each(data.rows, function(element, index) {
                chartData.push([element.activity, element.totalmiles]);
            });
            $("#chart-title-1 h4").text("Work Type Breakdown");
            window.typeBreakdownChart = c3.generate({
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
        },

        workByMonth: function(subLayerID, data) {
            chartData = ['miles'];
            chartX = ['x']
            _.each(data.rows, function(element, index) {
                chartX.push(element.to_char)
                chartData.push(d3.round(element.totalmiles, 0));
            });
            console.log(chartX);
            $("#chart-title-2 h4").text("Work By Month");
            window.workByMonthChart = c3.generate({
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
        },

        
        progress: function(subLayerID, data) {
            var tDistance = _.sum(data.rows, function(row) { return row.totalmiles; }).toFixed(2)
            var chartData = [];
            chartData.push(["Total Distance", tDistance]);
            window.progress = c3.generate({
                bindto: '#chart-container-2',
                size: { height: 215 },
                data: { type: 'gauge', columns: chartData },
                gauge: {
                  max: 1000,
                  width: 20,
                  units: ' miles',
                  label: {
                    format: function(value, ratio) { return d3.round(value, 0); },
                    show: true // to turn off the min/max labels.
                  }
                }
            });
        },

        totalMiles: function(subLayerID, data) {
            totalMiles = _.sum(data.rows, function(row) {
                return row.totalmiles;
            });
            totalMiles = d3.round(totalMiles, 0);
            targetBox = $('#helper_box #bignum-left');
            $('.data-value', targetBox).text(totalMiles);
            $('.data-desc', targetBox).text("Miles");
            $('#helper_box .bignums').show();
        },

        avgMilesPerMonth: function(subLayerID, data) {
            totalMiles = _.sum(data.rows, function(row) {
                return row.totalmiles;
            });
            avgMilesPerMonth = d3.round((totalMiles/ data.rows.length), 0);
            targetBox = $('#helper_box #bignum-right');
            $('.data-value', targetBox).text(avgMilesPerMonth);
            $('.data-desc', targetBox).text("Avg Miles Per Month");
            $('#helper_box .bignums').show();
        }
    };
})();
