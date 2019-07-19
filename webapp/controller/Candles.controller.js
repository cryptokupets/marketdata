/* global moment */

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "ck/marketdata/thirdparty/moment-with-locales"
  ],
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
        var mQuery = mArguments["?query"];

        var oViewModel = this.getView().getModel("view");
        oViewModel.setProperty("/exchange", mArguments.exchange);
        oViewModel.setProperty("/currency", mArguments.currency);
        oViewModel.setProperty("/asset", mArguments.asset);
        oViewModel.setProperty("/timeframe", mArguments.timeframe);
        oViewModel.setProperty(
          "/start",
          moment(mQuery ? mQuery.start : null).toDate()
        );
        oViewModel.setProperty(
          "/end",
          moment(mQuery ? mQuery.end : null).toDate()
        );
        // загрузить данные
        var sURL =
          "/api/candles/" +
          mArguments.exchange +
          "/" +
          mArguments.currency +
          "/" +
          mArguments.asset +
          "/" +
          mArguments.timeframe;

        if (mQuery && mQuery.start && mQuery.end) {
          sURL += "?start=" + mQuery.start + "&" + "end=" + mQuery.end;
        }

        this.getView()
          .getModel()
          .loadData(sURL);

        this.getView()
          .getModel("timeframes")
          .loadData("/api/timeframes/" + mArguments.exchange);
        this.getView()
          .getModel("symbols")
          .loadData("/api/symbols/" + mArguments.exchange);
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
