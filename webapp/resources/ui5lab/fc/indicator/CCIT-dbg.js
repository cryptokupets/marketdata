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

    return Chart.extend("ui5lab.fc.indicator.CCIT", {
      metadata: {
        properties: {
          overboughtZone: "float",
          oversoldZone: "float"
        },
        aggregations: {
          items: { type: "ui5lab.fc.indicator.CCITItem", multiple: true }
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
        var fCandleBodyWidth = 0.8; // TODO заменить на ось категорий

        // подготовка пространства
        var div = d3.select("#" + oControl.getId());
        var svg = div.select("svg");
        var plotArea = svg.select(".fcPlotArea");
        var fPlotAreaHeight = +plotArea.attr("height");

        // шкала x
        var dMinX = moment(aItems[0].getTime()).toDate();
        var iTimeframe = moment(aItems[1].getTime()).diff(dMinX, "m");

        var xScale = oControl.getTimeScale();

        // ось x
        svg
          .select(".fcAxisBottom")
          .attr("transform", `translate(0, ${fPlotAreaHeight})`)
          .call(d3.axisBottom(xScale));

        var fTickWidth = xScale(
          moment(dMinX)
            .add(iTimeframe, "m")
            .toDate()
        );

        // шкала y
        var yScale = oControl.getYScale(fMin, fMax);

        // ось y
        svg.select(".fcAxisLeft").call(d3.axisLeft(yScale));

        // область отображения данных
        var series = plotArea.select(".fcSeries");

        var fOverboughtZone = oControl.getOverboughtZone();
        var fOversoldZone = oControl.getOversoldZone();

        var candles = series
          .selectAll()
          .data(aItems)
          .enter()
          .append("g")
          .classed("fcBullish", e => e.getY() > fOverboughtZone)
          .classed("fcBearish", e => e.getY() < fOversoldZone)
          .classed(
            "fcNone",
            e => e.getY() >= fOversoldZone && e.getY() <= fOverboughtZone
          );

        // тело свечи
        candles
          .append("rect")
          .classed("fcCandleBody", true)
          .attr(
            "x",
            e =>
              xScale(moment(e.getTime()).toDate()) +
              ((1 - fCandleBodyWidth) * fTickWidth) / 2
          )
          .attr("y", e => yScale(Math.max(e.getY(), 0)))
          .attr("height", e =>
            Math.max(
              1,
              yScale(Math.min(e.getY(), 0)) - yScale(Math.max(e.getY(), 0))
            )
          )
          .attr("width", fCandleBodyWidth * fTickWidth);
      }
    });
  }
);
