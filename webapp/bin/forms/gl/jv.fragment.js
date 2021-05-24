sap.ui.jsfragment("bin.forms.gl.jv", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.joApp = new sap.m.NavContainer({mode: sap.m.SplitAppMode.HideMode});
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            vou_code: 1,
            type: 1
        };
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
        });
        this.listPage = new sap.m.Page({
            showHeader: false,
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
        var that2 = this;
        var view = this.view;

        UtilGen.clearPage(this.mainPage);
        var fe = [];
        this.frm = this.createViewHeader();
        this.qv = new QueryView("tblPODetails" + this.timeInLong);
        that.qv.getControl().view = this;
        this.qv.getControl().addStyleClass("sapUiSizeCondensed");
        this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qv.getControl().setFixedBottomRowCount(0);
        this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
        this.qv.getControl().setVisibleRowCount(7);


        this.frm.getToolbar().addContent(this.bk);


        Util.destroyID("poCmdSave" + this.timeInLong, this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdSave" + this.timeInLong), {
            icon: "sap-icon://save",
            text: "Save",
            press: function () {
                that.save_data();
            }
        }));

        Util.destroyID("poCmdDel" + this.timeInLong, this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdDel" + this.timeInLong), {
            icon: "sap-icon://delete",
            text: "Delete",
            press: function () {
                that.delete_data();
            }
        }));

        Util.destroyID("poCmdList" + this.timeInLong, this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdList" + this.timeInLong), {
            icon: "sap-icon://list",
            text: "List",
            press: function () {
                that.show_list();
            }
        }));
        this.frm.getToolbar().addContent(new sap.m.ToolbarSpacer());
        Util.destroyID("poCmdEdit" + this.timeInLong, this.view);
        this.frm.getToolbar().addContent(new sap.m.ToggleButton(this.view.createId("poCmdEdit" + this.timeInLong), {
            icon: "sap-icon://edit",
            text: "Edit",
            pressed: false,
            press: function () {
                if (this.getPressed()) {
                    that2.setFormEditable();
                }
                else
                    UtilGen.setFormDisableForEditing(that2.frm);


            }
        }));

        Util.destroyID("poCmdNew" + this.timeInLong, this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdNew" + this.timeInLong), {
            icon: "sap-icon://add-document",
            text: "New",
            press: function () {
                that2.qryStr = "";
                that2.oController.status = "new";
                that2.loadData();
            }
        }));

        // that.createScrollCmds(this.frm.getToolbar());

        (this.view.byId("poMsgInv" + this.timeInLong) != undefined ? this.view.byId("poMsgInv" + this.timeInLong).destroy() : null);
        this.frm.getToolbar().addContent(new sap.m.Text(view.createId("poMsgInv" + this.timeInLong), {text: ""}).addStyleClass("redText blinking"));
        this.frm.getToolbar().addContent(new sap.m.Title({text: "Journal Voucher"}));


        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.frm);

        sc.addContent(UtilGen.addDelRowCmd(this.qv));
        sc.addContent(this.qv.getControl());


        this.mainPage.addContent(sc);
        this.createViewFooter(sc);

        setTimeout(function () {
            $($(".sapUiFormResGrid , .sapUiFormToolbar")[0]).addClass("greyTB");
            $(".sapUiFormResGrid , .sapUiFormToolbar").addClass("greyTB")
        }, 500);


    },
    setFormEditable: function () {
        var that2 = this;
        if (that2.qryStr == "") {
            that2.av1.no.setEditable(true);
        } else
            that2.av1.no.setEditable(false);

        that2.av1.no.setEditable(true);
        that2.av1.vou_date.setEditable(true);
        that2.av1.descr.setEditable(true);

    },

    createViewFooter: function (sc) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.o2 = {};
        var fe = [];
        this.o2.dramt = UtilGen.addControl(fe, "DR Amount", sap.m.Input, "Cs" + this.timeInLong + "_",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "number", sett["FORMAT_MONEY_1"], this.view);
        this.o2.cramt = UtilGen.addControl(fe, "@CR Amount", sap.m.Input, "Cs" + this.timeInLong + "_",
            {
                editable: false,
                layoutData: new sap.ui.layout.GridData({span: "XL2 L2 M2 S12"})
            }, "number", sett["FORMAT_MONEY_1"], this.view);

        this.o2.dramt.addStyleClass("yellow");
        this.o2.cramt.addStyleClass("yellow");
        var frm = UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);
        frm.setToolbar(undefined);
        frm.destroyToolbar();
        sc.addContent(frm);
    },

    createViewHeader: function () {
        var that = this;
        var fe = [];
        var titSpan = "XL2 L4 M4 S12";
        var fullSpan = "XL8 L8 M8 S12";
        var codSpan = "XL3 L2 M2 S12";
        this.av1 = {};
        this.av1.keyfld = UtilGen.addControl(fe, "Key Id", sap.m.Input, "Cs" + this.timeInLong + "_",
            {
                enabled: false,
                layoutData: new sap.ui.layout.GridData({span: codSpan}),
            }, "string", undefined, this.view);

        this.av1.no = UtilGen.addControl(fe, "No", sap.m.Input, "Cs" + this.timeInLong + "_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: codSpan}),
            }, "number", undefined, this.view);

        this.av1.vou_date = UtilGen.addControl(fe, "@Vou date", sap.m.DatePicker, "Cs" + this.timeInLong + "_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: codSpan}),
            }, "date", undefined, this.view);
        this.av1.descr = UtilGen.addControl(fe, "Descr", sap.m.Input, "Cs" + this.timeInLong + "_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: fullSpan}),
            }, "string", undefined, this.view);


        // return UtilGen.formCreate("", true, fe);
        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {

        var view = this.view;
        var that = this;
        var apPosted = "";
        var sett = sap.ui.getCore().getModel("settings").getData();

        // UtilGen.setControlValue(this.o1.oname, "FR", "FR", true);
        this.view.byId("poMsgInv" + this.timeInLong).setText("");
        this.view.byId("poCmdSave" + this.timeInLong).setEnabled(true);
        this.view.byId("poCmdDel" + this.timeInLong).setEnabled(true);

        this.av1.no.setEnabled(true);

        if (this.qryStr == "") {
            that.setFormEditable();
            UtilGen.resetDataJson(this.av1);
            UtilGen.setControlValue(this.av1.vou_date, new Date());
            var n = Util.getSQLValue("select no " +
                "from  acvoucher1 where vou_code=" + this.vars.vou_code + " and type= " + this.vars.type);
            var k = Util.getSQLValue("select nvl(max(keyfld),0)+1 " +
                "from  acvoucher1");
            UtilGen.setControlValue(this.av1.keyfld, k, k, true);
            UtilGen.setControlValue(this.av1.no, n, n, true);
        } else {
            var dt = Util.execSQL("select *from acvoucher1 where KEYFLD=" + Util.quoted(this.qryStr));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                    UtilGen.loadDataFromJson(this.av1, dtx[0], true);
                    this.av1.no.setEnabled(false);
                    if (dtx[0].FLAG == 2)
                        apPosted = "Posted"

                }
            }


        }

        this.view.byId("poMsgInv" + this.timeInLong).setText(apPosted + " JV # " + this.qryStr);
        this.loadData_details();

        if (!this.fromStatus) {
            this.do_status();
        } else this.fromStatus = undefined;


    },
    loadData_details: function () {
        var that = this;
        var sq = "select acvoucher2.*,descr acname from acvoucher2 " +
            " where vou_code=" + this.vars.vou_code + " " +
            " and type=" + this.vars.type + " " +
            " and keyfld=" + Util.quoted(this.qryStr);
        this.qv.getControl().setEditable(true);
        Util.doAjaxJson("sqlmetadata", {sql: sq}, false).done(function (data) {
            if (data.ret == "SUCCESS") {
                that.qv.setJsonStrMetaData("{" + data.data + "}");
                UtilGen.applyCols("C7.JV", that.qv, that);
                that.qv.mLctb.parse("{" + data.data + "}", true);
                if (that.qv.mLctb.rows.length == 0)
                    that.qv.addRow();
                // var c = that.qv.mLctb.getColPos("ORD_REFER");
                // that.qv.mLctb.cols[c].beforeSearchEvent = function (sq, ctx, model) {
                //     // var rfr = model.getProperty(ctx.sPath + "/ORD_REFER");
                //     // var s = sq.replace("where", " where cost_item= " + Util.quoted(rfr) + " and ");
                //     return sq;
                // };
                var c = that.qv.mLctb.getColPos("ACCNO");
                that.qv.mLctb.cols[c].onSearchSelection = function (ctx, model, data) {
                    var chld = Util.getSQLValue("select childcount from acaccount where accno=" + Util.quoted(data.ACCNO));
                    if (chld > 0) {
                        sap.m.MessageToast.show("Err ! , Parent a/c selection is not allowed ! ", {
                            // my: sap.ui.core.Popup.Dock.LeftBottom, at: sap.ui.core.Popup.Dock.CenterCenter
                            // duration: 4000
                        });
                        var oMessageToastDOM = $('#content').parent().find('.sapMMessageToast');
                        oMessageToastDOM.css('color', "red");
                        return false;
                    }
                    return true;
                };

                that.qv.loadData();
                // that.do_summary(true);
                // that.setItemSql();

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
    show_list: function () {
        var that = this;
        var sq = "select KEYFLD,descr||'-'||NO DESCR,vou_date from " +
            " acvoucher1 where vou_code=" + this.vars.vou_code + " and type= " + this.vars.type + " " +
            " ";
        Util.showSearchList(sq, "DESCR", "KEYFLD", function (valx, val) {
            that.oController.status = "view";
            that.qryStr = valx;
            that.loadData();
        });
    },
    do_status: function () {

    }
})
;



