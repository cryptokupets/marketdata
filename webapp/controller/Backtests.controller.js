sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent"],
  function(Controller) {
    "use strict";

    return Controller.extend("ck.marketdata.controller.Backtests", {
      onInit: function() {
        this.getOwnerComponent()
          .getRouter()
          .getRoute("backtests")
          .attachMatched(this._onRouteMatched, this);
        this.getView().addStyleClass(
          this.getOwnerComponent().getContentDensityClass()
        );
      },

      _onRouteMatched: function(oEvent) {},

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
