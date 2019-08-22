/* global moment */

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "ck/marketdata/thirdparty/moment-with-locales"
  ],
  function(Controller, UIComponent, JSONModel) {
    "use strict";

    return Controller.extend("ck.marketdata.controller.Candles", {
      onInit: function() {
        UIComponent.getRouterFor(this)
          .getRoute("candles")
          .attachMatched(this._onRouteMatched, this);

        var oView = this.getView();
        oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());

        oView.setModel(new JSONModel(), "draft");
      },

      _onRouteMatched: function() {
        this._bind();
      },

      _bind: function() {
        var oView = this.getView();
        var oDraftModel = oView.getModel("draft");

        oView.bindElement({
          path: "/View('')",
          parameters: {
            $expand: "Indicators($expand=Series),Timeframes,Assets,Currencies"
          },
          events: {
            dataReceived: function() {
              var oBindingContext = oView.getBindingContext();
              oDraftModel.setData({
                currency: oBindingContext.getProperty("currency"),
                asset: oBindingContext.getProperty("asset"),
                timeframe: oBindingContext.getProperty("timeframe"),
                start: oBindingContext.getProperty("start").slice(0, 10),
                end: oBindingContext.getProperty("end").slice(0, 10),
                Indicators: oBindingContext
                  .getObject("Indicators")
                  .map(value => ({
                    Series: [
                      {
                        type: value.Series[0].type,
                        indicatorName: value.Series[0].indicatorName,
                        indicatorOptions: value.Series[0].indicatorOptions
                      }
                    ]
                  }))
              });
            }
          }
        });
      },

      _bindAssets: function() {},

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
        var sName = oContext.getProperty("name");
        return !!sName
          ? this.byId(oContext.getProperty("name").toLowerCase()).clone(sId)
          : null;
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
