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
      },

      _onRouteMatched: function(oEvent) {
        var mArguments = oEvent.getParameter("arguments");
        var sCurrency = mArguments.currency;
        var sExchange = mArguments.exchange;
        var sAsset = mArguments.asset;
        var sTimeframe = mArguments.timeframe;

        var mQuery = mArguments["?query"];
        var sStart = mQuery.start;
        var sEnd = mQuery.end;
        var oView = this.getView();

        var oViewModel = this.getView().getModel("view");
        oViewModel.setProperty("/exchange", sExchange);
        oViewModel.setProperty("/currency", sCurrency);
        oViewModel.setProperty("/asset", sAsset);
        oViewModel.setProperty("/timeframe", sTimeframe);
        oViewModel.setProperty("/start", moment(sStart).toDate());
        oViewModel.setProperty("/end", moment(sEnd).toDate());

        oView.bindElement({
          path: "/Exchange('" + sExchange + "')",
          parameters: {
            $expand: "Currencies,Timeframes"
          }
        });

        this.byId("asset").bindAggregation("items", {
          path:
            "/Currency(key='" +
            sCurrency +
            "',exchangeKey='" +
            sExchange +
            "')/Assets",
          template: new Item({
            text: "{key}",
            key: "{key}"
          }),
          templateShareable: false
        });

        oViewModel.setProperty("/busy", true);

        oView
          .getModel("candles")
          .loadData(
            "/odata/Exchange('" +
              sExchange +
              "')/MarketData.getCandles(currency='" +
              sCurrency +
              "',timeframe='" +
              sTimeframe +
              "',asset='" +
              sAsset +
              "',start='" +
              sStart +
              "',end='" +
              sEnd +
              "')"
          )
          .finally(function() {
            oViewModel.setProperty("/busy", false);
          });
      },

      onCurrencyChange: function() {
        this._changeRouteArguments();
      },

      onAssetChange: function() {
        this._changeRouteArguments();
      },

      onTimeframeChange: function() {
        this._changeRouteArguments();
      },

      onDateRangeChange: function() {
        this._changeRouteArguments();
      },

      _changeRouteArguments: function() {
        var oViewModel = this.getView().getModel("view");
        UIComponent.getRouterFor(this).navTo(
          "candles",
          {
            exchange: oViewModel.getProperty("/exchange"),
            currency: oViewModel.getProperty("/currency"),
            asset: oViewModel.getProperty("/asset"),
            timeframe: oViewModel.getProperty("/timeframe"),
            query: {
              start: moment(oViewModel.getProperty("/start"))
                .format()
                .slice(0, 19),
              end: moment(oViewModel.getProperty("/end"))
                .format()
                .slice(0, 19)
            }
          },
          true
        );
      },

      onNavBack: function() {
        window.history.go(-1);
      }
    });
  }
);
