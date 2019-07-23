/* global d3 moment */

sap.ui.define(
  [
    "ui5lab/fc/Chart",
    "ui5lab/fc/library",
    "ui5lab/fc/thirdparty/d3",
    "ui5lab/fc/thirdparty/moment-with-locales"
  ],
  function(Chart) {
    "use strict";

    return Chart.extend("ui5lab.fc.LineChart", {
      metadata: {
        aggregations: {
          items: { type: "ui5lab.fc.LineChartItem", multiple: true }
        }
      },

      renderer: {},

      onAfterRendering: function() {
        var oControl = this;

        Chart.prototype.onAfterRendering.apply(oControl);

        var aItems = oControl.getItems();
        if (!aItems || aItems.length < 2) return;

        // подготовка переменных
        var fMin = d3.min(aItems, e => e.getY());
        var fMax = d3.max(aItems, e => e.getY());

        // подготовка пространства
        var div = d3.select("#" + oControl.getId());
        var svg = div.select("svg");
        var plotArea = svg.select(".fcPlotArea");
        var fPlotAreaHeight = +plotArea.attr("height");

        // шкала x
        var xScale = oControl.getTimeScale();

        // ось x
        svg
          .select(".fcAxisBottom")
          .attr("transform", `translate(0, ${fPlotAreaHeight})`)
          .call(d3.axisBottom(xScale));

        // шкала y
        var yScale = oControl.getYScale(fMin, fMax);

        // ось y
        svg.select(".fcAxisLeft").call(d3.axisLeft(yScale));

        // область отображения данных
        var series = plotArea.select(".fcSeries");

        series
          .append("path")
          .datum(aItems)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 2)
          .attr(
            "d",
            d3
              .line()
              .x(function(e) {
                return xScale(moment(e.getTime()).toDate());
              })
              .y(function(e) {
                return yScale(e.getY());
              })
          );
      }
    });
  }
);
