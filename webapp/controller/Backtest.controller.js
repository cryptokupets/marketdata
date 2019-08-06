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
      this.getView().addStyleClass(
        this.getOwnerComponent().getContentDensityClass()
      );
    },

    _onRouteMatched: function(oEvent) {
      var oController = this;
      var oView = this.getView();
      var oModel = oView.getModel();
      var oDraftModel = oView.getModel("draft");
      var sBacktestId = oEvent.getParameter("arguments").id;

      oView.bindElement({
        path: "/Backtest('" + sBacktestId + "')",
        parameters: {
          $expand: "Exchange($expand=Currencies,Timeframes)"
        },
        events: {
          dataReceived: function() {
            oController._bindAssets();
            var oBindingContext = oView.getBindingContext();

            var sStart = oBindingContext.getProperty("start").slice(0, 10);
            oDraftModel.setProperty("/start", sStart);
            var sEnd = oBindingContext.getProperty("end").slice(0, 10);
            oDraftModel.setProperty("/end", sEnd);
            var sTimeframe = oBindingContext.getProperty("timeframe");
            oView
              .getModel("view")
              .setProperty(
                "/timeframe",
                moment
                  .duration(
                    +sTimeframe.slice(1),
                    sTimeframe.slice(0, 1).toLowerCase()
                  )
                  .asMinutes()
              );

            oController._draw();
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

    _draw: function() {
      var oView = this.getView();
      var oCandlestick = this.byId("candlestick");
      var oIndicator0 = this.byId("indicator0");
      var oBalance = this.byId("balance");
      var oBindingContext = oView.getBindingContext();
      var sBacktestId = oBindingContext.getProperty("_id");

      oView
        .getModel("buffer")
        .loadData("/odata/Backtest('" + sBacktestId + "')/Output")
        .finally(function() {
          oCandlestick.refresh();
          oIndicator0.refresh();
          oBalance.refresh();
        });
    },

    onRefresh: function() {
      this._draw();
    },

    onBackPress: function() {
      this.getOwnerComponent()
        .getRouter()
        .navTo("backtests");
    },

    onStartChange: function() {
      var oView = this.getView();
      oView
        .getBindingContext()
        .setProperty(
          "start",
          moment
            .utc(oView.getModel("draft").getProperty("/start"))
            .toISOString()
        );
      // TODO после сохранения обновить Output
    },

    onEndChange: function() {
      var oView = this.getView();
      oView.getBindingContext().setProperty(
        "end",
        moment
          .utc(oView.getModel("draft").getProperty("/end"))
          .add(1, "d")
          .add(-1, "s")
          .toISOString()
      );
    },

    onTimeframeChange: function() {
      var oView = this.getView();
      var sTimeframe = oView.getBindingContext().getProperty("timeframe");
      // var iTimeframeMilliseconds = moment.duration(+sTimeframe.slice(1), sTimeframe.slice(0, 1).toLowerCase()).asMilliseconds();
      oView
        .getModel("view")
        .setProperty(
          "/timeframe",
          moment
            .duration(
              +sTimeframe.slice(1),
              sTimeframe.slice(0, 1).toLowerCase()
            )
            .asMinutes()
        );
    }
  });
});
