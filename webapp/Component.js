sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device"], function(
  UIComponent,
  Device
) {
  "use strict";

  return UIComponent.extend("ck.marketdata.Component", {
    metadata: {
      manifest: "json"
    },

    init: function() {
      UIComponent.prototype.init.apply(this, arguments);
      this.getRouter().initialize();
      var oDeviceModel = this.getModel("device");
      oDeviceModel.setDefaultBindingMode("OneWay");
      oDeviceModel.setData(Device);
    },

    getContentDensityClass: function() {
      if (!this._sContentDensityClass) {
        this._sContentDensityClass = Device.support.touch
          ? "sapUiSizeCozy"
          : "sapUiSizeCompact";
      }
      return this._sContentDensityClass;
    }
  });
});
