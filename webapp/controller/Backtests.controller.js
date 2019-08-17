sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent"],
  function(Controller) {
    "use strict";

    return Controller.extend("ck.marketdata.controller.Backtests", {
      onBackPress: function() {
        this.getOwnerComponent()
          .getRouter()
          .navTo("main");
      },

      onRowSelectionChange: function(oEvent) {
        this.getOwnerComponent()
          .getRouter()
          .navTo("backtest", {
            id: oEvent.getParameter("rowContext").getProperty("_id")
          });
      }
    });
  }
);
