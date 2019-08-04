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
      },

      _onRouteMatched: function(oEvent) {
      },

      onBacktestPress: function(oEvent) {
        var sBacktestId = oEvent.getParameters().listItem.getBindingContext().getProperty("_id");
        this.getOwnerComponent()
          .getRouter()
          .navTo("backtest", {
            id: sBacktestId
          });
      }
    });
  }
);
