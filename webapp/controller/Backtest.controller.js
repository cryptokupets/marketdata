/* global moment */

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Item",
    "../thirdparty/moment-with-locales"
  ],
  function(Controller, Item) {
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
        var oDraftModel = oView.getModel("draft");
        var sBacktestId = oEvent.getParameter("arguments").id;

        oView.bindElement({
          path: "/Backtest('" + sBacktestId + "')",
          parameters: {
            $expand: "Exchange($expand=Currencies,Timeframes)"
          },
          events: {
            dataReceived: function() {
              var oBindingContext = oView.getBindingContext();
              oDraftModel.setProperty(
                "/currencyKey",
                oBindingContext.getProperty("currencyKey")
              );
              oController._bindAssets();
              oDraftModel.setProperty(
                "/assetKey",
                oBindingContext.getProperty("assetKey")
              );
              oDraftModel.setProperty(
                "/timeframe",
                oBindingContext.getProperty("timeframe")
              );
              oDraftModel.setProperty(
                "/strategyIndicators",
                oBindingContext.getProperty("strategyIndicators")
              );
              oDraftModel.setProperty(
                "/strategyParameters",
                oBindingContext.getProperty("strategyParameters")
              );
              oDraftModel.setProperty(
                "/stoplossEnabled",
                oBindingContext.getProperty("stoplossEnabled")
              );
              oDraftModel.setProperty(
                "/stopLossLevel",
                oBindingContext.getProperty("stopLossLevel")
              );
              oDraftModel.setProperty(
                "/fee",
                oBindingContext.getProperty("fee")
              );
              oDraftModel.setProperty(
                "/strategyCode",
                oBindingContext.getProperty("strategyCode")
              );

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
            }
          }
        });
      },

      _bindAssets: function() {
        var oView = this.getView();
        var oBindingContext = oView.getBindingContext();
        var sExchangeKey = oBindingContext.getProperty("exchangeKey");
        var sCurrencyKey = oView.getModel("draft").getProperty("/currencyKey");

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

      onBackPress: function() {
        this.getOwnerComponent()
          .getRouter()
          .navTo("backtests");
      },

      _draftToJSON: function() {
        var oDraftModel = this.getView().getModel("draft");
        return JSON.stringify({
          exchangeKey: "hitbtc",
          assetKey: oDraftModel.getProperty("/assetKey"),
          currencyKey: oDraftModel.getProperty("/currencyKey"),
          end: moment
            .utc(oDraftModel.getProperty("/end"))
            .add(1, "d")
            .add(-1, "s")
            .toISOString(),
          fee: oDraftModel.getProperty("/fee"),
          initialBalance: 1,
          start: moment.utc(oDraftModel.getProperty("/start")).toISOString(),
          stopLossLevel: oDraftModel.getProperty("/stopLossLevel"),
          stoplossEnabled: oDraftModel.getProperty("/stoplossEnabled"),
          strategyCode: oDraftModel.getProperty("/strategyCode"),
          strategyIndicators: oDraftModel.getProperty("/strategyIndicators"),
          strategyParameters: oDraftModel.getProperty("/strategyParameters"),
          timeframe: oDraftModel.getProperty("/timeframe")
        });
      },

      // _save: function() {
      //   return $.ajax({
      //     async: true,
      //     url:
      //       "/odata" +
      //       this.getView()
      //         .getBindingContext()
      //         .getPath(),
      //     method: "PATCH",
      //     headers: {
      //       "Content-Type": "application/json"
      //     },
      //     data: this._draftToJSON()
      //   });
      // },

      onRunPress: function() {
        var oRouter = this.getOwnerComponent().getRouter();
        var sBacktestId;
        // создать новый
        $.ajax({
          async: true,
          url: "/odata/Backtest",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          data: this._draftToJSON()
        })
          .then(function(oData) {
            // выполнить
            sBacktestId = oData._id;
            return $.post("/odata/Backtest('" + sBacktestId + "')/odata.run");
          })
          .then(function() {
            // перейти на новую страницу
            oRouter.navTo("backtest", {
              id: sBacktestId
            });
          });
      }
    });
  }
);
