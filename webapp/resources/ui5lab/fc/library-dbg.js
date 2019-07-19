sap.ui.define(["jquery.sap.global", "sap/ui/core/library"], function() {
  "use strict";

  sap.ui.getCore().initLibrary({
    name: "ui5lab.fc",
    dependencies: ["sap.ui.core", "sap.m"],
    types: [],
    interfaces: [],
    controls: ["ui5lab.fc.CandlestickChart", "ui5lab.fc.Candle"],
    elements: [],
    noLibraryCSS: false,
    version: "1.0.0"
  });

  return ui5lab.fc;
});
