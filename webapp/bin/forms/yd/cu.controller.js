sap.ui.controller("bin.forms.yd.cu", {

    onHelloWorld: function () {
        alert("Hello World!");
    },
    clearPage: function (pg) {
        var xx = [];
        for (var i in pg.getContent())
            xx.push(pg.getContent()[i]);
        for (var i in xx) {
            pg.removeContent(xx[i]);
            // if (xx[i].hasOwnProperty("getItems")) {
            //     for (var ii in xx[i].getItems())
            //         xx[i].getItems()[ii].destroy();
            // }
            // if (xx[i].hasOwnProperty("getContent")) {
            //     for (var ii in xx[i].getContent())
            //         xx[i].getContent()[ii].destroy();
            // }
            xx[i].destroy();
        }

        pg.removeAllContent();
    },
    doAjaxJson: function (path,
        content,
        async, saveQryName) {
        var params = {
            url: "" + path,
            context: this,
            cache: false,
            dataType: 'json',
            contentType: 'application/json',
            mimeType: 'application/json'
        };
        params["type"] = "POST";
        if (async === false) {
            params["async"] = async;
        }
        if (content) {
            params["data"] = JSON.stringify(content);
        }
        if (saveQryName) {
            params["saveQryName"] = JSON.stringify(saveQryName);
        }
        // console.log(content);
        return jQuery.ajax(params);
    },
    doAjaxGet: function (path,
        content,
        async) {
        var params = {
            url: path,
            context: this,
            cache: false
        };
        params["type"] = "GET";
        if (async === false) {
            params["async"] = async;
        }
        if (content) {
            params["data"] = content;
        }
        return jQuery.ajax(params);
    },

    /**
    * Called when a controller is instantiated and its View controls (if available) are already created.
    * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
    * @memberOf view.View1
    */
    //	onInit: function() {
    //
    //	},

    /**
    * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
    * (NOT before the first rendering! onInit() is used for that one!).
    * @memberOf view.View1
    */
    //	onBeforeRendering: function() {
    //
    //	},

    /**
    * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
    * This hook is the same one that SAPUI5 controls get after being rendered.
    * @memberOf view.View1
    */
    //	onAfterRendering: function() {
    //
    //	},

    /**
    * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
    * @memberOf view.View1
    */
    //	onExit: function() {
    //
    //	}

});