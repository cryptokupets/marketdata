/* global d3 */

sap.ui.define(
  ["sap/ui/core/Control", "ui5lab/fc/library", "ui5lab/fc/thirdparty/d3"],
  function(Control) {
    "use strict";

    return Control.extend("ui5lab.fc.Chart", {
      metadata: {
        library: "ui5lab.fc",
        properties: {
          width: "float",
          height: "float",
          padding: "string"
        },
        aggregations: {
          items: { type: "ui5lab.fc.ChartItem", multiple: true }
        },
        defaultAggregation: "items"
      },

      init: function() {
        this._fPaddingTop = 0;
        this._fPaddingRight = 0;
        this._fPaddingBottom = 0;
        this._fPaddingLeft = 0;

        var oControl = this;
        $(window).on("resize", oControl.rerender.bind(oControl));
        // $(window).on("load", oControl.rerender.bind(oControl));
      },

      // без этого связывается только 100 элементов
      bindAggregation: function(sKey, oBindingInfo) {
        if (!oBindingInfo.length) oBindingInfo.length = 1000000; // Max number of lines to display
        return sap.ui.core.Control.prototype.bindAggregation.apply(
          this,
          arguments
        ); //call superclass
      },

      setPadding: function(sPadding) {
        var aPadding = sPadding.split(" ");
        var iPaddingLength = aPadding.length;

        this._fPaddingTop = +aPadding[0];
        this._fPaddingRight = +aPadding[iPaddingLength === 1 ? 0 : 1];
        this._fPaddingBottom = +aPadding[iPaddingLength < 3 ? 0 : 2];
        this._fPaddingLeft = +aPadding[
          iPaddingLength === 1 ? 0 : iPaddingLength === 4 ? 3 : 1
        ];

        this.setProperty("padding", sPadding, true);
      },

      getTimeScale: function() {
        var div = d3.select("#" + this.getId());
        var svg = div.select("svg");
        var plotArea = svg.select(".fcPlotArea");
        var fPlotAreaWidth = +plotArea.attr("width");
        var aItems = this.getItems();
        var dMin = moment(aItems[0].getTime()).toDate();
        var iTimeframe = moment(aItems[1].getTime()).diff(dMin, "m");
        var dMax = moment(aItems[aItems.length - 1].getTime())
          .add(iTimeframe, "m")
          .toDate();

        return d3
          .scaleTime()
          .range([0, fPlotAreaWidth])
          .domain([dMin, dMax]);
      },

      getYScale: function(fMin, fMax) {
        var div = d3.select("#" + this.getId());
        var svg = div.select("svg");
        var plotArea = svg.select(".fcPlotArea");
        var fPlotAreaHeight = +plotArea.attr("height");
        return d3
          .scaleLinear()
          .range([fPlotAreaHeight, 0])
          .domain([fMin, fMax]);
      },

      onAfterRendering: function() {
        var oControl = this;
        // без этого запускается раньше, чем посчитался размер элементов
        // $(window).on("load", function() { // правильно ли использовать этот глобальный объект?
        var div = d3.select("#" + oControl.getId());
        var parent = div.node().parentNode;
        var fWidth = parent.offsetWidth;
        var fHeight = parent.offsetHeight;

        var fPaddingTop = oControl._fPaddingTop;
        var fPaddingLeft = oControl._fPaddingLeft;

        var svg = div
          .select("svg")
          .attr("width", fWidth)
          .attr("height", fHeight);

        svg
          .select(".fcPlotArea")
          .attr("transform", `translate(${fPaddingLeft}, ${fPaddingTop})`)
          .attr("width", fWidth - fPaddingLeft - oControl._fPaddingRight)
          .attr("height", fHeight - oControl._fPaddingBottom - fPaddingTop);

        // oControl.onLoadAfterRendering(); //.bind(oControl); // UNDONE нужно ли задавать контекст?
        // });
      }
    });
  }
);
