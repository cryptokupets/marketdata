sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/Item"], function(
  Controller,
  Item
) {
  "use strict";

  return Controller.extend("ck.marketdata.controller.Backtest", {
    onInit: function() {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("backtest")
        .attachMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function(oEvent) {
      var oController = this;
      var oView = this.getView();
      var sBacktestId = oEvent.getParameter("arguments").id;

      oView.bindElement({
        path: "/Backtest('" + sBacktestId + "')",
        parameters: {
          $expand: "Exchange($expand=Currencies)"
        },
        events: {
          dataReceived: function() {
            oController._bindAssets();
          }
        }
      });
    },

    _bindAssets: function() {
      var oBindingContext = this.getView().getBindingContext();
      var sCurrencyKey = oBindingContext.getProperty("currencyKey");
      var sExchangeKey = oBindingContext.getProperty("exchangeKey");
      this.byId("asset").bindAggregation("items", {
        path:
          "/Currency(key='" +
          sCurrencyKey +
          "',exchangeKey='" +
          sExchangeKey +
          "')/Assets",
        length: 10000,
        template: new Item({
          text: "{key}",
          key: "{key}"
        }),
        templateShareable: false
      });
    },

    onCurrencyChange: function() {
      this._bindAssets();
    },

    onBackPress: function() {
      this.getOwnerComponent()
        .getRouter()
        .navTo("backtests");
    }
  });
});
