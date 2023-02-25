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
            showSubHeader: true,
            content: []
        }).addStyleClass("sapUiSizeCompact");

        this.detailPage = new sap.m.Page({
            showHeader: false,
            content: []
        }).addStyleClass("sapUiSizeCompact");

        this.createView();
        this.loadData();
        this.joApp.addDetailPage(this.mainPage);
        this.joApp.addDetailPage(this.detailPage);
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
        UtilGen.clearPage(this.detailPage);
        this.joApp.to(this.mainPage, "show");
        that.create_menus();
    },
    selectGroup: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        if (this.pnls == undefined) return;
        for (var i in this.pnls) {
            this.pnls[i].removeStyleClass("selectedTile");
            if (this.pnls[i].getCustomData()[1].getKey() == this.selectedGroup)
                this.pnls[i].addStyleClass("selectedTile");
        }
        this.vbDetails1.removeAllContent();
        this.vbDetails.removeAllItems();
        this.cbWeek = UtilGen.createControl(sap.m.ComboBox, this.view, "location_code", {
            customData: [{ key: "" }],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                templateShareable: true
            },
            selectionChange: function (event) {
                that.clear_menu_items();
            }
        }, "string", undefined, undefined, "@1/Week1,2/Week2,3/Week 3,4/Week 4");
        this.cbProfile = UtilGen.createControl(sap.m.ComboBox, this.view, "cbProfile", {
            customData: [{ key: "" }],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                templateShareable: true
            },
            selectionChange: function (event) {
                that.clear_menu_items();
            }
        }, "string", undefined, undefined, "@GENERAL/GENERAL");

        this.txtPanelSize = UtilGen.createControl(sap.m.Input, this.view, "txtPanelSize", {
        }, "string", undefined, undefined, "");

        UtilGen.setControlValue(this.txtPanelSize, Util.nvl(sett["SUB_PANEL_SIZE"], "-1"));

        var hb = new sap.m.HBox({
            alignItems: sap.m.FlexAlignItems.Center,
            alignContent: sap.m.FlexAlignContent.Center,
            items: [new sap.m.Text({ text: "  Week :  " }),
            this.cbWeek,
            new sap.m.Text({ text: " Profile :  " }),
            this.cbProfile
            ]
        });
        var hb2 = new sap.m.HBox({
            alignItems: sap.m.FlexAlignItems.Center,
            alignContent: sap.m.FlexAlignContent.Center,
            items: [new sap.m.Text({ text: "Panel size :- " }), this.txtPanelSize,
            new sap.m.Button({ text: "Details >> ", press: function () { that.show_menu_items(); } })]
        });


        this.cbProfile.setSelectedItem(this.cbProfile.getItems()[0]);
        this.cbWeek.setSelectedItem(this.cbWeek.getItems()[0]);

        // that.show_menu_items();
        this.vbDetails.addItem(hb);
        this.vbDetails.addItem(hb2);
    },
    clear_menu_items: function () {
        var that = this;

        if (that.pnlDays != undefined)
            for (var pn in this.pnlDays) {
                this.pnlDays[pn].breakfast.removeAllContent();
                this.pnlDays[pn].lunch.removeAllContent();
                this.pnlDays[pn].dinner.removeAllContent();
                this.pnlDays[pn].salad.removeAllContent();
                this.pnlDays[pn].snack.removeAllContent();
                this.pnlDays[pn].soup.removeAllContent();
            }
        this.vbDetails1.removeAllContent();
        that.pnlDays = []
    },
    add_menu_item: function (ky) {
        var that = this;
        var mp = {
            breakfast: "0101",
            lunch: "0102",
            dinner: "0103",
            snack: "0104",
            salad: "0105",
            soup: "0106",
        };
        var s1 = ky.split("%%")[0];
        var s2 = ky.split("%%")[1];
        var wkno = UtilGen.getControlValue(that.cbWeek);
        var profile = UtilGen.getControlValue(that.cbProfile);
        var sqSel = "select RFR_" + s1.toUpperCase() + " from order_plan where profile=:PROFILE and profile_item=:PROFILE_ITEM and WEEK_NO=:WEEK_NO and day_no=:DAY_NO and RFR_" + s1.toUpperCase() + " is not null";
        sqSel = sqSel.replaceAll(":PROFILE_ITEM", Util.quoted(that.selectedGroup));
        sqSel = sqSel.replaceAll(":PROFILE", Util.quoted(profile));
        sqSel = sqSel.replaceAll(":WEEK_NO", Util.quoted(wkno));
        sqSel = sqSel.replaceAll(":DAY_NO", s2);
        var dtSel = Util.execSQL(sqSel);
        var strCod = "";
        if (dtSel.ret == "SUCCESS") {
            dtxSel = JSON.parse("{" + dtSel.data + "}").data;
            for (var xi in dtxSel)
                strCod = strCod + (strCod.length > 0 ? "," : "") + "'" + dtxSel[xi]["RFR_" + s1.toUpperCase()] + "'";
        }
        strCod = strCod != "" ? " reference not in (" + strCod + ") and " : "";
        var sq = "select reference code,descr  from items where " + strCod + " reference like " + Util.quoted(mp[s1] + "%")
        " and childcounts=0 order by descr2";
        Util.showSearchList(sq, "DESCR", "CODE", function (valx, val) {
            // UtilGen.setControlValue(control, val, valx, true);
            var si = "declare rfr varchar2(100);cnt number;" +
                " begin  " +
                " insert into order_plan (KEYFLD, PROFILE, PROFILE_ITEM, WEEK_NO, DAY_NO, POSNO, RFR_" + s1.toUpperCase() + ") " +
                " values (:KEYFLD, :PROFILE, :PROFILE_ITEM, :WEEK_NO, :DAY_NO, " +
                " (select nvl(max(posno),0)+1 from order_plan where profile=:PROFILE and profile_item=:PROFILE_ITEM and WEEK_NO=:WEEK_NO and day_no=:DAY_NO ) " +
                " , :RFR_" + s1.toUpperCase() + "); " +
                " end; ";

            si = si.replaceAll(":KEYFLD", "(select nvl(max(keyfld),0)+1 from order_plan)");
            si = si.replaceAll(":PROFILE_ITEM", Util.quoted(that.selectedGroup));
            si = si.replaceAll(":PROFILE", Util.quoted(profile));
            si = si.replaceAll(":WEEK_NO", Util.quoted(wkno));
            si = si.replaceAll(":DAY_NO", s2);
            // si = si.replaceAll(":POSNO","");
            si = si.replaceAll(":RFR_" + s1.toUpperCase(), Util.quoted(valx));
            var dt = Util.execSQL(si);
            if (dt.ret = "SUCCESS") {
                sap.m.MessageToast.show("Successfully added into " + s1 + " day " + s2);
                that.show_menu_items();
            }
            else sap.m.MessageToast.show("Err !");
        });

    },
    show_menu_items: function () {
        var that = this;
        var dataMenus = [];
        var sett = sap.ui.getCore().getModel("settings").getData();
        var heightPanle = UtilGen.getControlValue(this.txtPanelSize);//"10rem";
        heightPanle = (heightPanle.endsWith("rem") || heightPanle.endsWith("px")) ? heightPanle : heightPanle + "px";
        var wkno = UtilGen.getControlValue(that.cbWeek);
        var profile = UtilGen.getControlValue(that.cbProfile);
        that.clear_menu_items();

        var new_tb = function (tit, kd) {
            return new sap.m.Toolbar({
                content: [
                    new sap.m.Title({ text: tit }).addStyleClass("toolBarBackgroundColor1"),
                    new sap.m.ToolbarSpacer(),
                    new sap.m.Button({
                        customData: [{ key: kd }],
                        icon: "sap-icon://add",
                        press: function (e) {
                            var ky = this.getCustomData()[0].getKey();
                            that.add_menu_item(ky);
                        }
                    })]
            }).addStyleClass("toolBarBackgroundColor1");
        }
        // show_menu_items:function : getting all order_plan data and keep in object dataMenus;

        var initData = function () {
            var sq = "select op.* from order_plan op where profile_item=" + Util.quoted(that.selectedGroup) +
                " and  week_no=" + wkno + " and profile=" + Util.quoted(profile) + " order by day_no,posno";
            var dt = Util.execSQL(sq);

            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                for (var d in dtx) {
                    dataMenus[dtx[d].DAY_NO] = Util.nvl(dataMenus[dtx[d].DAY_NO], {});
                    var de = "";
                    if (Util.nvl(dtx[d].RFR_BREAKFAST, "") != "") {
                        de = Util.getSQLValue("select descr from items where reference=" + Util.quoted(dtx[d].RFR_BREAKFAST));
                        dataMenus[dtx[d].DAY_NO].breakfast = {
                            ...Util.nvl(dataMenus[dtx[d].DAY_NO].breakfast, {}), ...JSON.parse('{"' + dtx[d].POSNO +
                                '":{"CODE":"' + dtx[d].RFR_BREAKFAST + '","DESCR":"' + de + '","KEYFLD":' + dtx[d].KEYFLD + ' }}')
                        };
                    }
                    if (Util.nvl(dtx[d].RFR_LUNCH, "") != "") {
                        de = Util.getSQLValue("select descr from items where reference=" + Util.quoted(dtx[d].RFR_LUNCH));
                        dataMenus[dtx[d].DAY_NO].lunch = {
                            ...Util.nvl(dataMenus[dtx[d].DAY_NO].lunch, {}), ...JSON.parse("{\"" + dtx[d].POSNO +
                                '\":{"CODE":"' + dtx[d].RFR_LUNCH + '","DESCR":"' + de + '","KEYFLD":' + dtx[d].KEYFLD + ' }}')
                        };
                    }
                    if (Util.nvl(dtx[d].RFR_DINNER, "") != "") {
                        de = Util.getSQLValue("select descr from items where reference=" + Util.quoted(dtx[d].RFR_DINNER));
                        dataMenus[dtx[d].DAY_NO].dinner = {
                            ...Util.nvl(dataMenus[dtx[d].DAY_NO].dinner, {}), ...JSON.parse("{\"" + dtx[d].POSNO +
                                '\":{"CODE":"' + dtx[d].RFR_DINNER + '","DESCR":"' + de + '","KEYFLD":' + dtx[d].KEYFLD + ' }}')
                        };
                    }
                    if (Util.nvl(dtx[d].RFR_SALAD, "") != "") {
                        de = Util.getSQLValue("select descr from items where reference=" + Util.quoted(dtx[d].RFR_SALAD));
                        dataMenus[dtx[d].DAY_NO].salad = {
                            ...Util.nvl(dataMenus[dtx[d].DAY_NO].salad, {}), ...JSON.parse("{\"" + dtx[d].POSNO +
                                '\":{"CODE":"' + dtx[d].RFR_SALAD + '","DESCR":"' + de + '","KEYFLD":' + dtx[d].KEYFLD + ' }}')
                        };
                    }
                    if (Util.nvl(dtx[d].RFR_SNACK, "") != "") {
                        de = Util.getSQLValue("select descr from items where reference=" + Util.quoted(dtx[d].RFR_SNACK));
                        dataMenus[dtx[d].DAY_NO].snack = {
                            ...Util.nvl(dataMenus[dtx[d].DAY_NO].snack, {}), ...JSON.parse("{\"" + dtx[d].POSNO +
                                '\":{"CODE":"' + dtx[d].RFR_SNACK + '","DESCR":"' + de + '","KEYFLD":' + dtx[d].KEYFLD + ' }}')
                        }
                    }
                    if (Util.nvl(dtx[d].RFR_SOUP, "") != "") {
                        de = Util.getSQLValue("select descr from items where reference=" + Util.quoted(dtx[d].RFR_SOUP));
                        dataMenus[dtx[d].DAY_NO].soup = {
                            ...Util.nvl(dataMenus[dtx[d].DAY_NO].soup, {}), ...JSON.parse("{\"" + dtx[d].POSNO +
                                '\":{"CODE":"' + dtx[d].RFR_SOUP + '","DESCR":"' + de + '","KEYFLD":' + dtx[d].KEYFLD + ' }}')
                        }
                    }
                }
            }
        }
        var new_menus = function (dy, ml) {
            var mnus = [];
            if (dataMenus.length <= 0 || dataMenus[dy] == undefined)
                return [];
            for (var d in dataMenus[dy + ""][ml]) {
                var dts = dataMenus[dy + ""][ml];
                var tx = new sap.m.Text({ customData: [{ key: "breakfast%%" + i + "%%" + dts[d].CODE }, { key: dts[d].KEYFLD }], text: dts[d].DESCR + " \u2713 " })
                tx.addStyleClass("txtSubMenu");
                tx.attachBrowserEvent("click", function (e) {
                    var control = this;
                    if (sap.m.MessageBox == undefined)
                        jQuery.sap.require("sap.m.MessageBox");
                    sap.m.MessageBox.confirm(" Do you want to delete this item : " + this.getText() + " ?  ", {
                        title: "Confirm",                                    // default
                        onClose: function (oAction) {

                            if (oAction == sap.m.MessageBox.Action.OK && control.getCustomData()[1].getKey() != undefined) {
                                var ky = control.getCustomData()[1].getKey();
                                var sq = "delete from order_plan where keyfld=" + ky;
                                var dt = Util.execSQL(sq);
                                if (dt.ret != "SUCCESS")
                                    return;
                                that.show_menu_items();
                                sap.m.MessageToast.show("Deleted succesfully !");

                            }
                        },                                       // default
                        styleClass: "",                                      // default
                        initialFocus: null,                                  // default
                        textDirection: sap.ui.core.TextDirection.Inherit     // default
                    });
                });
                mnus.push(tx);
            }
            return mnus;

        }
        initData();
        for (var i = 0; i < 7; i++) {
            var day = {
                breakfast: new sap.m.Panel(
                    {
                        expanded: false,
                        headerToolbar: new_tb("Breakfast", "breakfast%%" + i),
                        height: heightPanle,
                        content: new sap.m.VBox({
                            alignItems: sap.m.FlexAlignItems.Start,
                            alignContent: sap.m.FlexAlignContent.Start,
                            items: new_menus(i, "breakfast")
                        }),
                        customData: [{ key: "breakfast%%" + i }],
                        layoutData: new sap.ui.layout.GridData({
                            span: "XL4 L4 M6 S6"
                        })
                    }).addStyleClass("menuTile"),
                lunch: new sap.m.Panel(
                    {
                        expanded: false,
                        height: heightPanle,
                        headerToolbar: new_tb("Lunch", "lunch%%" + i),
                        content: new sap.m.VBox({
                            alignItems: sap.m.FlexAlignItems.Start,
                            alignContent: sap.m.FlexAlignContent.Start,
                            items: new_menus(i, "lunch")
                        }),
                        customData: [{ key: "lunch%%" + i }],
                        layoutData: new sap.ui.layout.GridData({
                            span: "XL4 L4 M6 S6"
                        })
                    }).addStyleClass("menuTile"),
                dinner: new sap.m.Panel(
                    {
                        expanded: false,
                        height: heightPanle,
                        headerToolbar: new_tb("Dinner", "dinner%%" + i),
                        content: new sap.m.VBox({
                            alignItems: sap.m.FlexAlignItems.Start,
                            alignContent: sap.m.FlexAlignContent.Start,
                            items: new_menus(i, "dinner")
                        }),
                        customData: [{ key: "dinner%%" + i }],
                        layoutData: new sap.ui.layout.GridData({
                            span: "XL4 L4 M6 S6"
                        })
                    }).addStyleClass("menuTile"),
                salad: new sap.m.Panel(
                    {
                        expanded: false,
                        height: heightPanle,
                        headerToolbar: new_tb("Salad", "salad%%" + i),
                        content: new sap.m.VBox({
                            alignItems: sap.m.FlexAlignItems.Start,
                            alignContent: sap.m.FlexAlignContent.Start,
                            items: new_menus(i, "salad")
                        }),
                        customData: [{ key: "salad%%" + i }],
                        layoutData: new sap.ui.layout.GridData({
                            span: "XL4 L4 M6 S6"
                        })
                    }).addStyleClass("menuTile"),
                snack: new sap.m.Panel(
                    {
                        expanded: false,
                        height: heightPanle,
                        headerToolbar: new_tb("Snack", "snack%%" + i),
                        content: new sap.m.VBox({
                            alignItems: sap.m.FlexAlignItems.Start,
                            alignContent: sap.m.FlexAlignContent.Start,
                            items: new_menus(i, "snack")
                        }),
                        customData: [{ key: "snack%%" + i }],
                        layoutData: new sap.ui.layout.GridData({
                            span: "XL4 L4 M6 S6"
                        })
                    }).addStyleClass("menuTile"),
                soup: new sap.m.Panel(
                    {
                        expanded: false,
                        height: heightPanle,
                        headerToolbar: new_tb("Soup", "soup%%" + i),
                        content: new sap.m.VBox({
                            alignItems: sap.m.FlexAlignItems.Start,
                            alignContent: sap.m.FlexAlignContent.Start,
                            items: new_menus(i, "soup")
                        }),
                        customData: [{ key: "soup%%" + i }],
                        layoutData: new sap.ui.layout.GridData({
                            span: "XL4 L4 M6 S6"
                        })
                    }).addStyleClass("menuTile")
            }

            that.pnlDays.push(day);
        }
        for (var p in this.pnlDays) {
            var t1 = new sap.m.Title({ text: "Day " + (parseInt(p) + 1) }).addStyleClass("sapUiSmallMargin titleFontWithoutPad redText");
            this.vbDetails1.addContent(t1);
            this.vbDetails1.addContent(that.pnlDays[p].breakfast);
            this.vbDetails1.addContent(that.pnlDays[p].lunch);
            this.vbDetails1.addContent(that.pnlDays[p].dinner);
            this.vbDetails1.addContent(that.pnlDays[p].salad);
            this.vbDetails1.addContent(that.pnlDays[p].snack);
            this.vbDetails1.addContent(that.pnlDays[p].soup);
        }
        this.vbDetails1.addContent(new sap.m.VBox({ height: "100px" }));
    },
    create_menus: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.tbl = new LocalTableData();
        var sq = "select reference ,descr from items where reference like '09%' and childcounts=0 order by descr2";
        var dt = Util.execSQL(sq);
        if (dt.ret = "SUCCESS" && dt.data.length > 0)
            this.tbl.parse("{" + dt.data + "}", false);
        this.pnls = [];
        var ev = function (e) {
            that.selectedGroup = this.getCustomData()[1].getKey();
            sap.m.MessageToast.show(that.selectedGroup);
            that.selectGroup();
        };
        this.vbDetails = new sap.m.VBox();
        this.vbDetails1 = new sap.ui.layout.Grid(
            {
                vSpacing: 0,
                hSpacing: 0,
                width: "100%",
                defaultSpan: "XL12 L12 M12 S12"
            }
        );
        for (var r = 0; r < this.tbl.rows.length; r++) {
            var pnl = new sap.m.Panel(
                {
                    expanded: false,
                    height: "50px",
                    content: [
                        new sap.m.Text({ text: this.tbl.getFieldValue(r, "DESCR") }).addStyleClass("")
                    ],
                    customData: [{ key: this.tbl.getFieldValue(r, "REFERENCE") }],
                    layoutData: new sap.ui.layout.GridData({
                        span: "XL4 L4 M4 S4"
                    })
                }).addStyleClass("itemTile");
            pnl.attachBrowserEvent("click", ev);
            this.pnls.push(pnl);
        }

        this.scItems = new sap.m.ScrollContainer({
            content: [new sap.ui.layout.Grid({
                vSpacing: 0,
                hSpacing: 0,
                width: "100%",
                defaultSpan: "XL12 L12 M12 S12",
                content: this.pnls
            }),
            new sap.m.VBox({ height: "20px" }),
            this.vbDetails,
            this.vbDetails1
            ]
        }).addStyleClass("sapUiMediumMargin");

        // this.mainPage.setSubHeaderShow(true);
        this.mainPage.setSubHeader(new sap.m.Toolbar({
            content: [
                new sap.m.Title({ text: "Planning Subscription." }),
                new sap.m.ToolbarSpacer(),
                new sap.m.Button({
                    icon: "sap-icon://decline",
                    text: "Close",
                    press: function () {
                        that.joApp.backFunction();
                    }
                })]
        }));


        this.mainPage.addContent(this.scItems);

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

    }
    ,
    loadData: function () {

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



