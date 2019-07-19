sap.ui.define(["sap/ui/core/Control"], function(Control) {
  "use strict";

  return Control.extend("ui5lab.fc.Candle", {
    metadata: {
      properties: {
        x: "any",
        open: "float",
        high: "float",
        low: "float",
        close: "float"
      }
    }
  });
});
