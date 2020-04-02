var opsDisplay = (function() {
    // Private.

    colors = {
        oci: {
            good: "#0098db",
            fair: "#fcd900",
            poor: "#ffa02f",
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
            _.each(data.rows, function(element, index) {
                chartData.push([element.activity, element.totalmiles]);
            });
            $("#chart-title-1 h4").text("Work Type");
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
                pie: {
                  label: {
                    format: function(value, ratio, id) {
                      return d3.format("%")(ratio);
                    }
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
            //chartData = ['miles'];
            //chartX = ['x'];
            chartX = {};
            chartData = {
              overlay: {
                0:0,
                1:0,
                2:0,
                3:0,
                4:0,
                5:0,
                6:0,
                7:0,
                8:0,
                9:0,
                10:0,
                11:0,
                12:0
              },
              slurry: {
                0:0,
                1:0,
                2:0,
                3:0,
                4:0,
                5:0,
                6:0,
                7:0,
                8:0,
                9:0,
                10:0,
                11:0,
                12:0
              },
              concrete: {
                0:0,
                1:0,
                2:0,
                3:0,
                4:0,
                5:0,
                6:0,
                7:0,
                8:0,
                9:0,
                10:0,
                11:0,
                12:0
              }
            };

            _.each(data.rows, function(element, index) {
                var monPos = parseInt(element.to_char);
                if (monPos >= 7) {
                  chartX[monPos - 7] = element.to_char;
                  chartData[element.type.toLowerCase()][monPos - 7] = d3.round(element.totalmiles, 1);
                }
                else {
                  chartX[monPos + 5] = element.to_char;
                  chartData[element.type.toLowerCase()][monPos + 5] = d3.round(element.totalmiles, 1);
                }
            });

            chartX = _.values(chartX);
            overlay = _.values(chartData.overlay);
            slurry = _.values(chartData.slurry);
            concrete = _.values(chartData.concrete);

            chartX.splice(0, 0, 'x');
            overlay.splice(0, 0, 'overlay');
            slurry.splice(0, 0, 'slurry');
            concrete.splice(0, 0, 'concrete');

            $("#chart-title-2 h4").text("Work By Month");
            window.workByMonthChart = c3.generate({
            bindto: '#chart-container-2',
            data: {
              x: 'x',
              type: 'bar',
              columns: [chartX, overlay, slurry, concrete],
              groups: [
                ['overlay', 'slurry', 'concrete']
              ],
              order:null
            },
            color: { pattern: ['#0098db', "#ffa02f", "#fcd900"] },
            bar: { width: { ratio: 0.5 } },
            legend: { hide: true },
            tooltip: {
              grouped: true,
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
            window.progressChart = c3.generate({
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
                },
                tooltip: {
                  format: {
                    value: function (value, ratio, id, index) { return d3.round(value, 0) + " Miles"; }
                  }
                }
            });
        },

        ociBreakdown: function(subLayerID, data) {
            chartData = [];
            _.each(data.rows, function(element, index) {
                chartData.push([element.color, element.totalmiles]);
            });
            $("#chart-title-1 h4").text("OCI Breakdown");
            window.typeBreakdownChart = c3.generate({
                bindto: '#chart-container-1',
                data: {
                  type: 'pie',
                  columns: chartData,
                  colors: {
                    "Poor": colors.oci.poor,
                    "Fair": colors.oci.fair,
                    "Good": colors.oci.good,
                  }
                },
                pie: {
                  label: {
                    format: function(value, ratio, id) {
                      return d3.format("%")(ratio);
                    }
                  }
                },
                tooltip: {
                  format: {
                    //name: function (name, ratio, id, index) {return name},
                    //value: function (value, ratio, id, index) { return d3.round(value, 0) + " sq. ft"; }
                  }
                }
            });
        },

        totalMiles: function(subLayerID, data) {
            totalMiles = _.sum(data.rows, function(row) {
                return row.totalmiles;
            });
            console.log(totalMiles);
            totalMiles = d3.round(totalMiles, 0);
            targetBox = $('#helper_box #bignum-left');
            $('.data-value', targetBox).text(totalMiles);
            $('.data-desc', targetBox).text("Miles");
            $('#helper_box .bignum-left').show();
        },

        ociAvg: function(subLayerID, data) {
            ociAvg = d3.round(_.first(data.rows).avg, 0);
            targetBox = $('#helper_box #bignum-right');
            $('.data-value', targetBox).text(ociAvg);
            $('.data-desc', targetBox).text("Average OCI");
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
