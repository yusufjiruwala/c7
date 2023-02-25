sap.ui.jsfragment("bin.forms.yd.pl", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = Util.nvl(oController.code, "");
        this.timeInLong = (new Date()).getTime();
        this.joApp = new sap.m.SplitApp({ mode: sap.m.SplitAppMode.HideMode });
        // this.vars = {
        //     keyfld: -1,
        //     flag: 1,  // 1=closed,2 opened,
        //     vou_code: 1,
        //     type: 1
        // };

        // this.pgDetail = new sap.m.Page({showHeader: false});

        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            press: function () {
                that.joApp.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        }).addStyleClass("sapUiSizeCompact");
        this.createView();
        this.loadData();
        this.joApp.addDetailPage(this.mainPage);
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage, "show");

        this.joApp.displayBack = function () {
            that.frm.refreshDisplay();
        };

        setTimeout(function () {
            if (that.oController.getForm().getParent() instanceof sap.m.Dialog)
                that.oController.getForm().getParent().setShowHeader(false);

        }, 10);

        // UtilGen.setFormTitle(this.oController.getForm(), "Journal Voucher", this.mainPage);
        return this.joApp;
    },
    createView: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var that2 = this;
        var thatForm = this;
        var view = this.view;
        var codSpan = "XL3 L3 M3 S12";
        UtilGen.clearPage(this.mainPage);
        this.createViewHeader();
        this.mainPage.addContent(this.vbHeader);
        this.createDetails();
        this.mainPage.addContent(this.vbDetails);

    },
    setFormEditable: function () {

    }
    ,
    createDetails: function () {
        var that = this;
        if (this.vbDetails == undefined)
            this.vbDetails = new sap.m.VBox({
            }).addStyleClass("sapUiMediumMargin");
        else
            this.vbDetails.removeAllItems();

        this.qv = new QueryView("tbl_week_plan");
        this.qv.getControl().setEditable(true);
        that.qv.getControl().view = this;
        this.qv.getControl().addStyleClass("sapUiSizeCondensed");
        this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qv.getControl().setFixedBottomRowCount(0);
        this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
        this.qv.getControl().setVisibleRowCount(7);
        this.qv.insertable = true;
        this.qv.editable = true;

        this.vbDetails.addItem(this.qv.getControl());

    },
    createViewHeader: function () {
        var that = this;
        if (this.vbHeader == undefined)
            this.vbHeader = new sap.m.HBox({
                alignItems: sap.m.FlexAlignItems.Center,
                alignContent: sap.m.FlexAlignContent.Center
            }).addStyleClass("sapUiMediumMargin");
        else
            this.vbHeader.removeAllItems();

        this.txtProfile = UtilGen.createControl(sap.m.SearchField, this.view, "profile_Item", {
            search: function (e) {
                var control = this;
                if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                    UtilGen.setControlValue(control, "", "", true);
                    return;
                }

                var sq = "select reference code,descr title from items where reference like '09%' and childcounts=0 order by descr2";
                Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                    UtilGen.setControlValue(control, val, valx, true);
                });
            }
        }, "string", undefined, undefined, "");

        this.cbWeek = UtilGen.createControl(sap.m.ComboBox, this.view, "location_code", {
            customData: [{ key: "" }],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                templateShareable: true
            },
            selectionChange: function (event) {

            }
        }, "string", undefined, undefined, "@1/Week1,2/Week2");
        this.cmdExe = new sap.m.Button({
            text: "Details >>",
            press: function (e) {
                that.loadData();
            }
        })
        this.vbHeader.addItem(new sap.m.Text({ text: " Profile Item: " }));
        this.vbHeader.addItem(this.txtProfile);
        this.vbHeader.addItem(new sap.m.Text({ text: " Week: " }));
        this.vbHeader.addItem(this.cbWeek);
        this.vbHeader.addItem(this.cmdExe);

    }
    ,
    loadData: function () {
        // if (Util.nvl(this.oController.accno, "") != "" &&
        //     Util.nvl(this.oController.status, "view") == FormView.RecordStatus.VIEW) {
        //     this.frm.setFieldValue("pac", this.oController.accno, this.oController.accno, true);
        //     this.frm.loadData(undefined, FormView.RecordStatus.VIEW);
        //     this.oController.accno = "";
        //     return;

        // }
        var that = this;
        var sq = "select KEYFLD, PROFILE_ITEM, WEEK_NO, DAY_NO, RFR_BREAKFAST,'' DES_BREAKFAST, RFR_LUNCH, RFR_DINNER, RFR_SALAD, RFR_SNACK, RFR_SOUP from ORDER_PLAN " +
            " where week_no=" + UtilGen.getControlValue(this.cbWeek) + " and profile_item=" + Util.quoted(UtilGen.getControlValue(this.txtProfile));
        Util.doAjaxJson("sqlmetadata", { sql: sq }, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                UtilGen.applyCols("C7.SUBPL", that.qv, that);
                if (that.qv.mLctb.rows.length == 0)
                    that.qv.addRow();
                that.qv.loadData();
            }
        });
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

});



