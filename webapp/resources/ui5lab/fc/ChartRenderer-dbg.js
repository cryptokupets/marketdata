sap.ui.define(
  [],
  function() {
    "use strict";

    return {
      render: function(oRm, oControl) {
        oRm.write("<div");
        oRm.writeControlData(oControl);
        oRm.write(
          "><svg class='fcChart'><g class='fcPlotArea'><g class='fcAxisLeft'></g><g class='fcAxisBottom'></g><g class='fcSeries'></g></g></svg></div>"
        );
      }
    };
  },
  /* bExport= */ true
);
