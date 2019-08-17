/* global moment */

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Item",
    "ck/marketdata/thirdparty/moment-with-locales"
  ],
  function(Controller, UIComponent, Item) {
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

        // var oCandlestick = this.byId("candlestick");
        // var oIndicator0 = this.byId("indicator0");

        // oView
        //   .getModel("buffer")
        //   .loadData(
        //     "/odata/Buffer(exchangeKey='" +
        //       sExchange +
        //       "',currencyKey='" +
        //       sCurrency +
        //       "',timeframe='" +
        //       sTimeframe +
        //       "',assetKey='" +
        //       sAsset +
        //       "',start='" +
        //       sStart +
        //       "',end='" +
        //       sEnd +
        //       "',indicatorInputs='cci 14')"
        //   )
        //   .finally(function() {
        //     oCandlestick.refresh();
        //     oIndicator0.refresh();
        //     oViewModel.setProperty("/busy", false);
        //   });
      },

      // onCurrencyChange: function() {
      //   this._changeRouteArguments();
      // },

      // onAssetChange: function() {
      //   this._changeRouteArguments();
      // },

      // onTimeframeChange: function() {
      //   this._changeRouteArguments();
      // },

      // onDateRangeChange: function() {
      //   this._changeRouteArguments();
      // },

      // _changeRouteArguments: function() {
      //   var oViewModel = this.getView().getModel("view");
      //   UIComponent.getRouterFor(this).navTo(
      //     "candles",
      //     {
      //       query: {
      //         exchange: oViewModel.getProperty("/exchange"),
      //         currency: oViewModel.getProperty("/currency"),
      //         asset: oViewModel.getProperty("/asset"),
      //         timeframe: oViewModel.getProperty("/timeframe"),
      //         start: moment(oViewModel.getProperty("/start"))
      //           .format()
      //           .slice(0, 19),
      //         end: moment(oViewModel.getProperty("/end"))
      //           .format()
      //           .slice(0, 19)
      //       }
      //     },
      //     true
      //   );
      // },

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
        console.log(oBufferModel);
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
        $.ajax({
          async: true,
          url: "/odata/Exchange('hitbtc')/odata.getMarketData()",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          data: this._bufferToJSON()
        }).then(function(oData) {
          console.log(oData);
        });
      },

      onBackPress: function() {
        this.getOwnerComponent()
          .getRouter()
          .navTo("main");
      }
    });
  }
);
