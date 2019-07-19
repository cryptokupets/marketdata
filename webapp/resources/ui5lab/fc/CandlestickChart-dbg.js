/* global d3 moment */

sap.ui.define(
  [
    "sap/ui/core/Control",
    "./library",
    "ui5lab/fc/thirdparty/d3",
    "ui5lab/fc/thirdparty/moment-with-locales"
  ],
  function(Control) {
    "use strict";

    return Control.extend("ui5lab.fc.CandlestickChart", {
      metadata: {
        library: "ui5lab.fc",
        properties: {
          width: "float",
          height: "float",
          padding: "string"
        },
        aggregations: {
          candles: { type: "ui5lab.fc.Candle", multiple: true }
        },
        defaultAggregation: "candles"
      },

      init: function() {
        var oControl = this;
        $(window).on("resize", function() {
          oControl.rerender();
        });
      },

      // без этого связывается только 100 элементов
      bindAggregation: function(sKey, oBindingInfo) {
        if (!oBindingInfo.length) oBindingInfo.length = 100000; // Max number of lines to display
        return sap.ui.core.Control.prototype.bindAggregation.apply(
          this,
          arguments
        ); //call superclass
      },

      // если меняется размер, то менять только размеры
      // если изменяется количество элементов - то их

      onAfterRendering: function() {
        var oControl = this;
        var aCandles = oControl.getCandles();
        if (!aCandles || aCandles.length < 2) return;

        var sId = this.getId();

        // подготовка переменных
        var sParentId = this.getParent().getId();

        var aPadding = oControl.getPadding().split(" ");
        var iPaddingLength = aPadding.length;

        var fPaddingTop = +aPadding[0];
        var fPaddingRight = +aPadding[iPaddingLength === 1 ? 0 : 1];
        var fPaddingBottom = +aPadding[iPaddingLength < 3 ? 0 : 2];
        var fPaddingLeft = +aPadding[
          iPaddingLength === 1 ? 0 : iPaddingLength === 4 ? 3 : 1
        ];

        var fWidth = oControl.getWidth();
        if (!fWidth) {
          fWidth = $("#" + sParentId).width();
        }

        var fPlotAreaWidth = fWidth - fPaddingLeft - fPaddingRight;

        var fHeight = oControl.getHeight();
        if (!fHeight) {
          fHeight = $("#" + sParentId).height(); // FIXME не срабатывает
        }
        var fPlotAreaHeight = fHeight - fPaddingBottom - fPaddingTop;

        var fMin = d3.min(aCandles, e => e.getLow());
        var fMax = d3.max(aCandles, e => e.getHigh());
        var fCandleBodyWidth = 0.8; // TODO заменить на ось категорий

        // подготовка пространства
        var svg = d3
          .select("#" + sId)
          .attr("width", fWidth)
          .attr("height", fHeight);

        var chart = svg.select(".fcChart");
        chart.attr("transform", `translate(${fPaddingLeft}, ${fPaddingTop})`); // без учета верхней оси или заголовка

        // шкала x
        var dMinX = moment(aCandles[0].getX()).toDate();
        var iTimeframe = moment(aCandles[1].getX()).diff(dMinX, "m");
        var dMaxX = moment(aCandles[aCandles.length - 1].getX())
          .add(iTimeframe, "m")
          .toDate();

        var xScale = d3
          .scaleTime()
          .range([0, fPlotAreaWidth])
          .domain([dMinX, dMaxX]);

        // ось x
        chart
          .select(".fcAxisBottom")
          .attr("transform", `translate(0, ${fPlotAreaHeight})`)
          .call(d3.axisBottom(xScale));

        var fTickWidth = xScale(
          moment(dMinX)
            .add(iTimeframe, "m")
            .toDate()
        );

        // шкала y
        var yScale = d3
          .scaleLinear()
          .range([fPlotAreaHeight, 0])
          .domain([fMin, fMax]);

        // ось y
        chart.select(".fcAxisLeft").call(d3.axisLeft(yScale));

        // область отображения данных
        var plotArea = chart.select(".fcPlotArea");

        var candles = plotArea
          .selectAll()
          .data(aCandles)
          .enter()
          .append("g")
          .classed("fcBullish", e => e.getClose() >= e.getOpen())
          .classed("fcBearish", e => e.getClose() < e.getOpen());

        // тень свечи
        candles
          .append("line")
          .classed("fcCandleShadow", true)
          .attr("x1", e => xScale(moment(e.getX()).toDate()) + fTickWidth / 2)
          .attr("x2", e => xScale(moment(e.getX()).toDate()) + fTickWidth / 2)
          .attr("y1", e => yScale(e.getHigh()))
          .attr("y2", e => yScale(e.getLow()));

        // тело свечи
        candles
          .append("rect")
          .classed("fcCandleBody", true)
          .attr(
            "x",
            e =>
              xScale(moment(e.getX()).toDate()) +
              ((1 - fCandleBodyWidth) * fTickWidth) / 2
          )
          .attr("y", e => yScale(Math.max(e.getOpen(), e.getClose())))
          .attr("height", e =>
            Math.max(
              1,
              yScale(Math.min(e.getOpen(), e.getClose())) -
                yScale(Math.max(e.getOpen(), e.getClose()))
            )
          )
          .attr("width", fCandleBodyWidth * fTickWidth);
      }
    });
  }
);
