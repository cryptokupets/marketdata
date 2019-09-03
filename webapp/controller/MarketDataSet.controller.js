sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent"],
  function(Controller) {
    "use strict";

    return Controller.extend("ck.marketdata.controller.MarketDataSet", {
      onBackPress: function() {
        this.getOwnerComponent()
          .getRouter()
          .navTo("main");
      },

      onRowSelectionChange: function(oEvent) {
        this.getOwnerComponent()
          .getRouter()
          .navTo("marketData", {
            id: oEvent.getParameter("rowContext").getProperty("_id")
          });
      },

      onAddPress: function() {
        var oRouter = this.getOwnerComponent().getRouter();
        // var oModel = this.getView().getModel();
        $.post({
          async: true,
          url: "/odata/MarketData",
          headers: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify({
            exchange: "hitbtc",
            currency: "USD",
            asset: "BTC",
            period: 60,
            start: "2019-09-01T00:00:00.000Z",
            end: "2019-09-01T23:59:00.000Z"
          })
        })
          .then(function(oData) {
            // oModel.refresh();
            oRouter.navTo("marketData", {
              id: oData._id
            });
          });
      }
    });
  }
);
