/* global moment */

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "ck/marketdata/thirdparty/moment-with-locales"
  ],
  function(Controller, UIComponent) {
    "use strict";

    return Controller.extend("ck.marketdata.controller.Main", {
      onPress: function() {
        UIComponent.getRouterFor(this).navTo("candles", {
          query: {
            exchange: "hitbtc"
          }
        });
      }
    });
  }
);
