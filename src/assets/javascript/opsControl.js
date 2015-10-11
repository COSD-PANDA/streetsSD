var opsControl = {
    sql: function() {
        return new cartodb.SQL({ user: 'cityofsandiego' });
    },
    calcTDistance: function(subLayerID) {
        var sqlString = sqlBuilder.getDistanceSQL(subLayerID, null, "streetwork_master.district");
        var oc = this;
        this.sql().execute(sqlString).done(function(data) {
            oc.display.calcTDistance(subLayerID, data);
        });
    },
    workByMonth: function(subLayerID) {
        //var month = "COALESCE(to_char(streetwork_master.est_start, 'MM'), to_char(streetwork_master.completed, 'MM'))"
        var month = "to_char(date_combined, 'MM')";
        var sqlString = sqlBuilder.getDistanceSQL(subLayerID, null, month);
        sqlString += " ORDER BY " + month;
        var oc = this;
        this.sql().execute(sqlString).done(function(data) {
            console.log(data);
            oc.display.workByMonth(subLayerID, data);
            oc.bigNumbers(subLayerID, data);
        });
    },
    typeBreakdown: function(subLayerID) {
        var sqlString = sqlBuilder.getDistanceSQL(subLayerID, null, "streetwork_master.activity");
        var oc = this;
        this.sql().execute(sqlString).done(function(data) {
            oc.display.typeBreakdown(subLayerID, data);
        });
    },

    progress: function(subLayerID) {
        var sqlString = sqlBuilder.getDistanceSQL(subLayerID, null, "streetwork_master.district");
        var oc = this;
        this.sql().execute(sqlString).done(function(data) {
            oc.display.progress(subLayerID, data);
        });
    },
    ociBreakdown: function(subLayerID) {
        var sqlString = sqlBuilder.getOCIBreakdownSQL();
        var oc = this;
        this.sql().execute(sqlString).done(function(data) {
            oc.display.ociBreakdown(subLayerID, data);
            oc.display.totalMiles(subLayerID, data);
        })
    },
    ociAvg: function(subLayerID) {
        var sqlString = sqlBuilder.getOCIAvgSQL();
        var oc = this;
        this.sql().execute(sqlString).done(function(data) {
            oc.display.ociAvg(subLayerID, data);
        });
    },
    totalMiles: function(subLayerID) {
        var sqlString = sqlBuilder.getDistanceByMonthSQL(subLayerID);
        var oc = this;
        console.log("TOTAL Miles for " + subLayerID)
        console.log(sqlString);
        this.sql().execute(sqlString).done(function(data) {
            oc.display.totalMiles(subLayerID, data);
        });
    },
    nextMonthMiles: function(subLayerID) {
        var sqlString = sqlBuilder.getDistanceByMonthSQL(subLayerID);
        var oc = this;
        this.sql().execute(sqlString).done(function(data) {
            oc.display.nextMonthMiles(subLayerID, data);
        });

    },
    bigNumbers: function(subLayerID, data) {
        console.log("bignumbers")
        var sqlString = sqlBuilder.getDistanceByMonthYearSQL(subLayerID);
        var oc = this;
        this.sql().execute(sqlString).done(function(data) {
            oc.display.totalMiles(subLayerID, data);
            oc.display.avgMilesPerMonth(subLayerID, data);
        });


    },

    display: {
        calcTDistance: function(subLayerID, data) {
            $('.tDistance', '#helper_box #' + subLayerID).text(
                _.sum(data.rows, function(row) { return row.totalmiles; }).toFixed(2)
            );
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
        },
        typeBreakdown: function(subLayerID, data) {
            chartData = [];
            _.each(data.rows, function(element, index) {
                chartData.push([element.activity, element.totalmiles]);
            });
            $("#chart-title-1 h4").text("Work Type Breakdown");
            window.typeBreakdown = c3.generate({
                bindto: '#chart-container-1',
                data: {
                    type: 'pie',
                    columns: chartData,
                    colors: { "Slurry Seal": "#0098db", "AC Resurfacing": "#ffa02f", "Concrete Street": "#fcd900" }
                },
                tooltip: {
                  format: {
                    name: function (name, ratio, id, index) { return name; },
                    value: function (value, ratio, id, index) { return d3.round(value, 0) + " Miles"; }
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
                    format: function(value, ratio) { return value; },
                    show: true // to turn off the min/max labels.
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
            window.typeBreakdown = c3.generate({
                bindto: '#chart-container-1',
                data: {
                  type: 'pie',
                  columns: chartData,
                  colors: { "Poor": "#9c6114", "Fair": "#00c7b2", "Good": "#ffa02f" }
                },
                tooltip: {
                  format: {
                    name: function (name, ratio, id, index) {return name},
                    value: function (value, ratio, id, index) { return d3.round(value, 0) + " Miles"; }
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
        ociAvg: function(subLayerID, data) {
            ociAvg = d3.round(_.first(data.rows).avg, 0);
            targetBox = $('#helper_box #bignum-right');
            $('.data-value', targetBox).text(ociAvg);
            $('.data-desc', targetBox).text("Average OCI");
            $('#helper_box .bignums').show();
        },
        nextMonthMiles: function(subLayerID, data) {
            var cDate = moment();
            mSearch = cDate.format('MM');
            milesNext = _.find(data.rows, function(row) {
                return row.coalesce == mSearch;
            });

            milesNext = d3.round(milesNext.totalmiles, 0);


            targetBox = $('#helper_box #bignum-right');
            $('.data-value', targetBox).text(milesNext);
            $('.data-desc', targetBox).text("Miles Scheduled In " + cDate.add(1, 'months').format("MMM"));
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
    }
}
