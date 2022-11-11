sap.ui.controller('bin.Dashboard', {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf bin.Dashboard **/
    onInit: function () {
        $('<div class=loadingDiv>Loading libraries</div>').prependTo(document.body);
        this.getView().addStyleClass(sap.ui.Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact");
        // sap.m.TreeItemBase.prototype.ExpandedIconURI = sap.ui.core.IconPool.getIconURI("less");
        // sap.m.TreeItemBase.prototype.CollapsedIconURI = sap.ui.core.IconPool.getIconURI("add");

    },

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf bin.Dashboard
     **/
    onBeforeRendering: function () {
        $('<div class=loadingDiv>Loading libraries</div>').prependTo(document.body);
    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf bin.Dashboard **/
    onAfterRendering: function () {
        $('<div class=loadingDiv>Loading libraries</div>').prependTo(document.body);
    },

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf bin.Dashboard
     **/
    onExit: function () {

    },
    frag_liveChange: function (event) {
    },
    frag_confirm: function (event) {

    }
});
