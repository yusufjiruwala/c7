sap.ui.jsfragment("bin.forms.testRep", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.App({mode: sap.m.SplitAppMode.HideMode});
        this.timeInLong = (new Date()).getTime();


        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            ord_code: 106,
            onm: ""
        };
        // this.pgDetail = new sap.m.Page({showHeader: false});

        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.joApp.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: true,
            showNavButton: false,
            enableScroll: true,
            height: "100%",
            content: []
        });
        this.createView();
        this.loadData();
        this.joApp.addPage(this.mainPage);
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage, "show");
        return this.joApp;
    },
    createView: function () {
        var that = this;
        var view = this.view;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var that2 = this;
        var thatForm = this;
        var view = this.view;
        var fullSpan = "XL8 L8 M8 S12";
        var colSpan = "XL3 L3 M3 S12";
        var sumSpan = "XL2 L2 M2 S12";

        UtilGen.clearPage(this.mainPage);
        this.o1 = {};
        var fe = [];
        // this.frm = this.createViewHeader();
        // this.frm.getToolbar().addContent(this.bk);

        // Util.destroyID("poCmdSave", this.view);
        // this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdSave"), {
        //     icon: "sap-icon://save", press: function () {
        //         that.save_data();
        //     }
        // }));
        //
        // Util.destroyID("poCmdDel", this.view);
        // this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdDel"), {
        //     icon: "sap-icon://delete", press: function () {
        //         that.delete_data();
        //     }
        // }));
        // that.createScrollCmds(this.frm.getToolbar());

        var sc = new sap.m.ScrollContainer();
        var sq = Util.getSQLValue("select json_str from c7_qrys");
        sq = sq.replace(/&&dquote&&/g, '"');
        if (eval(sq))
            var aaa = "";

        this.frm = new ReportView(this.mainPage);
        this.frm.view = view;
        this.frm.pg = this.mainPage;
        this.frm.parseRep(js);
        this.frm.createView();

// sc.addContent(this.frm);


// var hb = new sap.m.HBox();
//
// this.qv = new QueryView("qv" + this.timeInLong);
// this.qv.getControl().addStyleClass("sapUiSizeCondensed reportTable");
// this.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
// this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.None);
// this.qv.getControl().setAlternateRowColors(false);
// this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
// that.qv.getControl().setVisibleRowCount(15);
// // this.qv.getControl().setFirstVisibleRow(0);
//
// this.qv.getControl().setFixedBottomRowCount(1);
// hb.addItem(new sap.m.VBox({width: "100px"}));
// hb.addItem(this.qv.getControl());
//
// sc.addContent(new sap.m.VBox({height: "100px"}));
//
// sc.addContent(hb);


// this.mainPage.addContent(sc);
        setTimeout(function () {
            that.mainPage.$().css("background-color", "white");
        }, 500);

    }
    ,
    loadData: function () {
        // var that = this;
        // var sq = "select accno,name,debit,credit from acc_balance_1 order by path";
        // Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
        //     if (data.ret == "SUCCESS") {
        //         that.qv.setJsonStrMetaData("{" + data.data + "}");
        //         var c = that.qv.mLctb.getColPos("DEBIT");
        //         that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
        //         that.qv.mLctb.cols[c].mSummary = "SUM";
        //         c = that.qv.mLctb.getColPos("CREDIT");
        //         that.qv.mLctb.cols[c].getMUIHelper().display_format = "MONEY_FORMAT";
        //         that.qv.mLctb.cols[c].mSummary = "SUM";
        //
        //         that.qv.mLctb.parse("{" + data.data + "}", true);
        //         that.qv.loadData();
        //         // that.qv.getControl().setVisibleRowCount(that.qv.mLctb.rows.length + 3);
        //     }
        // });

    }
    ,
    validateSave: function () {
        return true;
    }
    ,
    save_data: function () {
    }
    ,
    get_emails_sel: function () {

    }

})
;



