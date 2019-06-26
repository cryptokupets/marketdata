sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent"],
  function(Controller, UIComponent) {
    "use strict";

    return Controller.extend("ck.marketdata.controller.Candles", {
      onInit: function() {
        UIComponent.getRouterFor(this)
          .getRoute("candles")
          .attachMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function(oEvent) {
        var mArguments = oEvent.getParameter("arguments");
        // загрузить данные
        this.getView()
          .getModel()
          .loadData(
            "/api/candles/" +
              mArguments.exchange +
              "/" +
              mArguments.currency +
              "/" +
              mArguments.asset +
              "/" +
              mArguments.timeframe
          );
      },

      onNavBack: function() {
        window.history.go(-1);
      }
    });
  }
);
