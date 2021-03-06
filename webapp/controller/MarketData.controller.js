/* global moment */

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Item",
    "sap/m/MessageBox",
    "ck/marketdata/thirdparty/moment-with-locales"
  ],
  function(Controller, UIComponent, JSONModel, Item, MessageBox) {
    "use strict";

    return Controller.extend("ck.marketdata.controller.MarketData", {
      onInit: function() {
        UIComponent.getRouterFor(this)
          .getRoute("marketData")
          .attachMatched(this._onRouteMatched, this);
        var oView = this.getView();
        oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());
        oView.setModel(new JSONModel(), "draft");
        oView.setModel(new JSONModel(), "chart");
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
        var oChartModel = oView.getModel("chart");
        oView.bindElement({
          path: sPath,
          parameters: {
            $expand:
              "Indicators($expand=Output($expand=values),Parent),Exchange($expand=Currencies,Periods),Candles"
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
                    _id: value._id,
                    type: value.type,
                    name: value.name,
                    options: value.options
                  }))
              });
              oChartModel.setData({
                currency: oBindingContext.getProperty("currency"),
                asset: oBindingContext.getProperty("asset"),
                period: +oBindingContext.getProperty("period"),
                start: oBindingContext.getProperty("start"),
                end: oBindingContext.getProperty("end"),
                Candles: oBindingContext.getObject("Candles"),
                Indicators: oBindingContext
                  .getObject("Indicators")
                  .map(value => ({
                    type: value.type,
                    // _id: oBindingContext.getProperty("_id"),
                    period: +oBindingContext.getProperty("period"),
                    start: oBindingContext.getProperty("start"),
                    end: oBindingContext.getProperty("end"),
                    Output: value.Output
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
        var that = this;
        setTimeout(() => {
          that.byId("candlestick").refresh();
          that
            .byId("indicators")
            .getItems()
            .forEach(e => {
              e.refresh();
            });
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
        var oView = this.getView();
        var sPath = oView.getBindingContext().getPath();

        Promise.all(
          [
            $.ajax({
              async: true,
              url: "/odata" + sPath,
              method: "PATCH",
              headers: {
                "Content-Type": "application/json"
              },
              data: this._draftToJSON()
            })
          ].concat(
            oView
              .getModel("draft")
              .getObject("/Indicators")
              .map(function(e) {
                return $.ajax({
                  async: true,
                  url: "/odata/IndicatorView('" + e._id + "')",
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  data: JSON.stringify({
                    type: e.type,
                    name: e.name,
                    options: e.options
                  })
                });
              })
          )
        ).then(function() {
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

      onDeleteIndicatorPress: function(oEvent) {
        var oController = this;
        var oBindingContext = oEvent.getSource().getBindingContext("draft");
        var sId = oBindingContext.getProperty("_id"); // UNDONE
        var oView = this.getView();
        var sPath = oView.getBindingContext().getPath();

        var bCompact = !!this.getView()
          .$()
          .closest(".sapUiSizeCompact").length;
        MessageBox.confirm("Are you sure?", {
          styleClass: bCompact ? "sapUiSizeCompact" : "",
          // UNDONE заменить на styleClass: this.getOwnerComponent().getContentDensityClass(),
          title: "Delete Indicator",
          icon: "NONE",
          onClose: function(oAction) {
            if (oAction === "OK") {
              $.ajax({
                async: true,
                url: "/odata/IndicatorView('" + sId + "')",
                method: "DELETE"
              }).then(function() {
                oController._bind(sPath);
              });
            }
          }
        });
      },

      factory: function(sId, oContext) {
        return this.byId(oContext.getProperty("type").toLowerCase()).clone(sId);
      },

      onBackPress: function() {
        this.getOwnerComponent()
          .getRouter()
          .navTo("marketDataSet");
      }
    });
  }
);
