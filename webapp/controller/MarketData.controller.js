/* global moment */

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Item",
    "ck/marketdata/thirdparty/moment-with-locales"
  ],
  function(Controller, UIComponent, JSONModel, Item) {
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
        this._bind(
          "/MarketData('" + oEvent.getParameter("arguments").id + "')"
        );
      },

      _bind: function(sPath) {
        var oController = this;
        var oView = this.getView();
        var oDraftModel = oView.getModel("draft");
        oView.bindElement({
          path: sPath,
          parameters: {
            $expand:
              "Indicators,Exchange($expand=Currencies,Periods),Candles"
          },
          events: {
            dataReceived: function() {
              var oBindingContext = oView.getBindingContext();
              oDraftModel.setData({
                currency: oBindingContext.getProperty("currency"),
                asset: oBindingContext.getProperty("asset"),
                period: oBindingContext.getProperty("period"),
                start: oBindingContext.getProperty("start").slice(0, 10),
                end: oBindingContext.getProperty("end").slice(0, 10),
                Indicators: oBindingContext
                  .getObject("Indicators")
                  .map(value => ({
                    type: value.type,
                    name: value.name,
                    options: value.options
                  }))
              });
              oController._bindAssets();
              oController._draw();
            }
          }
        });
      },

      _bindAssets: function() {
        var oView = this.getView();
        var oBindingContext = oView.getBindingContext();
        var sExchange = oBindingContext.getProperty("exchange");
        var sCurrency = oView.getModel("draft").getProperty("/currency");
        this.byId("asset").bindAggregation("items", {
          path:
            "/Currency(key='" +
            sCurrency +
            "',exchangeKey='" +
            sExchange +
            "')/Assets",
          length: 1000,
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
        setTimeout(() => {
          this.byId("candlestick").refresh();
        });
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
          period: +oDraftModel.getProperty("/period"),
          end: moment
            .utc(oDraftModel.getProperty("/end"))
            .add(1, "d")
            .add(-1, "s")
            .toISOString(),
          start: moment.utc(oDraftModel.getProperty("/start")).toISOString()
        });
      },

      onSavePress: function() {
        var oController = this;
        var sPath = this.getView()
          .getBindingContext()
          .getPath();
        $.ajax({
          async: true,
          url: "/odata" + sPath,
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          data: this._draftToJSON()
        }).then(function() {
          oController._bind(sPath);
        });
      },

      onAddIndicatorPress: function() {
        var oController = this;
        var oBindingContext = this.getView().getBindingContext();
        var sId = oBindingContext.getProperty("_id");
        var sPath = oBindingContext.getPath();

        $.post({
          async: true,
          url: "/odata/IndicatorView",
          headers: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify({
            name: "cci",
            options: "[14]",
            parentId: sId,
            type: "CCI"
          })
        }).then(function() {
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
          .navTo("marketDataSet");
      }
    });
  }
);
