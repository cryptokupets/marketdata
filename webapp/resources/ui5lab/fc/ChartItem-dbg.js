sap.ui.define(["sap/ui/core/Control", "ui5lab/fc/library"], function(Control) {
  "use strict";

  return Control.extend("ui5lab.fc.ChartItem", {
    metadata: {
      properties: {
        time: "string"
      }
    }
  });
});
