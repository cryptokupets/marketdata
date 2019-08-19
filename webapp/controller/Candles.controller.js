/* global moment */

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Item",
    "sap/ui/core/Fragment",
    "ck/marketdata/thirdparty/moment-with-locales"
  ],
  function(Controller, UIComponent, Item, Fragment) {
    "use strict";

    return Controller.extend("ck.marketdata.controller.Candles", {
      onInit: function() {
        UIComponent.getRouterFor(this)
          .getRoute("candles")
          .attachMatched(this._onRouteMatched, this);
        this.getView().addStyleClass(
          this.getOwnerComponent().getContentDensityClass()
        );
      },

      _onRouteMatched: function(oEvent) {
        var oController = this;
        var oView = this.getView();
        var oBufferModel = oView.getModel("buffer");
        oBufferModel.setProperty("/currencyKey", "BTC");
        oBufferModel.setProperty("/assetKey", "XMR");
        oBufferModel.setProperty("/start", "2019-08-01");
        oBufferModel.setProperty("/end", "2019-08-07");
        oBufferModel.setProperty("/timeframe", "H1");
        oBufferModel.setProperty(
          "/indicatorInputs",
          '[{"name":"cci","options":[14]},{"name":"macd","options":[12,26,9]}]'
        );
        oView.bindElement({
          path: "/Exchange('hitbtc')",
          parameters: {
            $expand: "Currencies,Timeframes"
          },
          events: {
            dataReceived: function() {
              oController._bindAssets();
            }
          }
        });

        this.getOwnerComponent().getModel("charts1").setProperty("/indicators", [
          {
            name: "MACD"
          },
          {
            name: "CCIOZ"
          }
        ]);
      },

      _bindAssets: function() {
        var oView = this.getView();
        var oBindingContext = oView.getBindingContext();
        var sExchangeKey = oBindingContext.getProperty("key");
        var sCurrencyKey = oView.getModel("buffer").getProperty("/currencyKey");

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

      _bufferToJSON: function() {
        var oBufferModel = this.getView().getModel("buffer");
        return JSON.stringify({
          asset: oBufferModel.getProperty("/assetKey"),
          currency: oBufferModel.getProperty("/currencyKey"),
          end: moment
            .utc(oBufferModel.getProperty("/end"))
            .add(1, "d")
            .add(-1, "s")
            .toISOString(),
          start: moment.utc(oBufferModel.getProperty("/start")).toISOString(),
          indicatorInputs: oBufferModel.getProperty("/indicatorInputs") || "[]",
          timeframe: oBufferModel.getProperty("/timeframe")
        });
      },

      onRefreshPress: function() {
        var oCandlestick = this.byId("candlestick");
        // var oIndicator0 = this.byId("indicator0");
        var oIndicators = this.byId("indicators");
        var oChartsModel = this.getView().getModel("charts");
        var oChartsModel1 = this.getView().getModel("charts1");
        $.ajax({
          async: true,
          url: "/odata/Exchange('hitbtc')/odata.getMarketData()",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          data: this._bufferToJSON()
        }).then(function(oData) {
          // перерисовать диаграммы
          oChartsModel.setData(oData);
          oCandlestick.refresh();
          // oIndicator0.refresh();
          // oIndicator1.refresh();
          var iNext = oChartsModel1.getProperty("/indicators").length;
          console.log(iNext);
          console.log(oIndicators);
          for (let i = 0; i < iNext; i++) {
            oIndicators.getItems()[i].refresh();
          }
        });
      },

      factory: function(sId, oContext) {
        console.log(oContext.getProperty("name").toLowerCase());
        return this.byId(oContext.getProperty("name").toLowerCase()).clone(sId);
      },

      _addIndicator: function(sName) {
        var oChartsModel = this.getView().getModel("charts");
        var iNext = oChartsModel.getProperty("/indicators").length;
        oChartsModel.setProperty("/indicators/" + iNext, {
          name: sName
        });
        var oIndicators = this.byId("indicators");
        for (let i = 0; i <= iNext; i++) {
          oIndicators.getItems()[i].refresh();
        }
      },

      onBackPress: function() {
        this.getOwnerComponent()
          .getRouter()
          .navTo("main");
      }
    });
  }
);
