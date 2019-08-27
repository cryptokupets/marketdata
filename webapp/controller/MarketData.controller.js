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

    return Controller.extend("ck.marketdata.controller.MarketData", {
      onInit: function() {
        UIComponent.getRouterFor(this)
          .getRoute("marketData")
          .attachMatched(this._onRouteMatched, this);

        var oView = this.getView();
        oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());

        oView.setModel(new JSONModel(), "draft");
      },

      _onRouteMatched: function(oEvent) {
        this._bind("/MarketData('"+ oEvent.getParameter("arguments").id  +"')");
      },

      _bind: function(sPath) {
        var oView = this.getView();
        var oDraftModel = oView.getModel("draft");
        oView.bindElement({
          path: sPath,
          parameters: {
            $expand: "Indicators($expand=Series),Timeframes,Assets,Currencies,Candles"
            // FIXME Timeframes,Assets,Currencies неправильно, т.к. они зависят от выбранного
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
                    type: value.type,
                    indicatorName: value.indicatorName,
                    indicatorOptions: value.indicatorOptions
                  }))
              });
            }
          }
        });
      },

      _bindAssets: function() {
        // получить конкретный binding, обновить
        // вызывается из разных мест
      },

      onCurrencyChange: function() {
        this._bindAssets();
      },

      onRefreshPress: function() {
        var oBindingContext = this.getView().getBindingContext();
        var oCandlestick = this.byId("candlestick");
        // var oIndicator0 = this.byId("indicator0");
        var oIndicators = this.byId("indicators");
        // var oChartsModel = this.getView().getModel("charts");
        // var oChartsModel1 = this.getView().getModel("charts1");
        $.get({
          async: true,
          url: "/odata/" + oBindingContext.getPath() + "/odata.getOutput()"
        }).then(function(oData) {
          // перерисовать диаграммы
          oChartsModel.setData(oData);
          oCandlestick.refresh();
          // oIndicator0.refresh();
          // oIndicator1.refresh();
          var iNext = oChartsModel1.getProperty("/indicators").length;
          // console.log(iNext);
          // console.log(oIndicators);
          for (let i = 0; i < iNext; i++) {
            oIndicators.getItems()[i].refresh();
          }
        });
      },

      _draftToJSON: function() {
        var oDraftModel = this.getView().getModel("draft");
        return JSON.stringify({
          asset: oDraftModel.getProperty("/asset"),
          currency: oDraftModel.getProperty("/currency"),
          timeframe: oDraftModel.getProperty("/timeframe"),
          end: moment
            .utc(oDraftModel.getProperty("/end"))
            .add(1, "d")
            .add(-1, "s")
            .toISOString(),
          start: moment.utc(oDraftModel.getProperty("/start")).toISOString(),
          Indicators: oDraftModel.getObject("/Indicators")
        });
      },

      onApplyPress: function() {
        var oController = this;
        var sPath = this.getView().getBindingContext().getPath();
        $.ajax({
          async: true,
          url: "/odata" + sPath,
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          data: this._draftToJSON()
        })
          .then(function() {
            oController._bind(sPath);
          });
      },

      // factory: function(sId, oContext) {
      //   var sName = oContext.getProperty("name");
      //   return !!sName
      //     ? this.byId(oContext.getProperty("name").toLowerCase()).clone(sId)
      //     : null;
      // },

      // _addIndicator: function(sName) {
      //   var oChartsModel = this.getView().getModel("charts");
      //   var iNext = oChartsModel.getProperty("/indicators").length;
      //   oChartsModel.setProperty("/indicators/" + iNext, {
      //     name: sName
      //   });
      //   var oIndicators = this.byId("indicators");
      //   for (let i = 0; i <= iNext; i++) {
      //     oIndicators.getItems()[i].refresh();
      //   }
      // },

      onBackPress: function() {
        this.getOwnerComponent()
          .getRouter()
          .navTo("main");
      }
    });
  }
);
