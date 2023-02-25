sap.ui.jsfragment("bin.forms.yd.cp", {

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
        this.weekEngDays = ['Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'];
        this.weekArbDays = ['الأحد',
            'الاثنين',
            'الثلاثاء',
            'الأربعاء',
            'الخميس',
            'الجمعه',
            'السبت'];
        this.bk = new sap.m.Button({
            icon: "sap-icon://nav-back",
            text: "Close",
            press: function () {
                that.joApp.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: false,
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
        that.createViewHeader();
    }
    ,
    createViewHeader: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.vbHeader = new sap.m.VBox().addStyleClass("sapUiMediumMargin");
        this.vbDetails1 = new sap.ui.layout.Grid(
            {
                vSpacing: 0,
                hSpacing: 0,
                width: "100%",
                defaultSpan: "XL12 L12 M12 S12"
            }
        );
        this.txtGroup = new sap.m.Title({});
        this.txtOrdNo = new sap.m.Title({});
        this.txtCust = new sap.m.Title({});
        this.txtCustPeriod = new sap.m.Title({});
        this.cbWeek = UtilGen.createControl(sap.m.ComboBox, this.view, "cbweek", {
            customData: [{ key: "" }],
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                templateShareable: true
            },
            selectionChange: function (event) {
                that.show_menu_items();
            }
        }, "string", undefined, undefined, "@1/Week1,2/Week2,3/Week 3,4/Week 4,5/Week 5,6/Week 6");
        this.cbWeek.setSelectedItem(this.cbWeek.getItems()[0]);
        this.vbHeader.addItem(new sap.m.Toolbar({ content: [new sap.m.ToolbarSpacer(), this.bk] }));
        this.vbHeader.addItem(this.txtGroup);
        this.vbHeader.addItem(this.txtOrdNo);
        this.vbHeader.addItem(this.txtCust);
        this.vbHeader.addItem(this.txtCustPeriod);
        this.vbHeader.addItem(this.cbWeek);
        this.mainPage.addContent(this.vbHeader);
        this.mainPage.addContent(this.vbDetails1);
    }
    ,
    printDelivery: function (ky) {
        var that = this;
        var getLabelTxt = function (ptxt, pwidth, preText) {
            return Util.nvl(preText, "") + '{\"text\":\"' + ptxt + '\",\"width\":\"' + Util.nvl(pwidth, "15%") + '\","textAlign":"End","styleClass":""}'
        };
        var wkno = UtilGen.getControlValue(that.cbWeek);
        var s2 = ky;
        var view = this.view;

        var settings = {
            width: "290px",
            cssText: [
                "padding-left:10px;" +
                "padding-top:10px;"
            ]
        };
        var kfld = Util.getSQLValue("select keyfld from order_cust_plan where ord_no=" + that.ord_data[0].ORD_NO + " and week_no=" + wkno +
            " and day_no=" + s2);

        var fe = [
            getLabelTxt("Dlv No", "25%"),
            new sap.m.Text({ text: kfld, width: "75%", editable: false }),
            getLabelTxt("Dlv Date", "25%"),
            new sap.m.DateTimePicker({ value: "", width: "75%", editable: true }),
            getLabelTxt("Driver", "25%"),
            UtilGen.addControl([],
                "", sap.m.ComboBox,
                "",
                {
                    width: "75%",
                    items: {
                        path: "/",
                        template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{NO}" }),
                        templateShareable: true
                    },
                }, "string",
                "", this.view, undefined, "select no,name from salesp order by no"),
            getLabelTxt("Address", "25%"),
            new sap.m.Input({
                value: that.ord_data[0].SUB_ADDRESS, width: "75%", editable: true
            }),
            getLabelTxt("Remarks", "25%"),
            new sap.m.Input({ value: "", width: "75%", editable: true }),
            getLabelTxt("Mob", "25%"),
            new sap.m.Input({ value: that.ord_data[0].SUB_MOBILENO, width: "75%", editable: true }),

        ];
        var ldt = Util.execSQL("select DELIVER_TIME,DRIVER_NO,cust_remarks from order_cust_plan where keyfld=" + kfld);
        if (ldt.ret == "SUCCESS") {
            var ldtx = JSON.parse("{" + ldt.data + "}").data;
            var ddat = new Date(ldtx[0].DELIVER_TIME.replaceAll(".", ":"));
            UtilGen.setControlValue(fe[3], ddat, ddat, true);
            UtilGen.setControlValue(fe[5], ldtx[0].DRIVER_NO, ldtx[0].DRIVER_NO, true);
            UtilGen.setControlValue(fe[7], that.ord_data[0].SUB_ADDRESS, that.ord_data[0].SUB_ADDRESS, true);
            UtilGen.setControlValue(fe[9], ldtx[0].CUST_REMARKS, ldtx[0].CUST_REMARKS, true);
            UtilGen.setControlValue(fe[11], that.ord_data[0].SUB_MOBILENO, that.ord_data[0].SUB_MOBILENO, true);
        }
        var cnt = UtilGen.formCreate2("", true, fe, undefined, sap.m.ScrollContainer, settings, "sapUiSizeCompact", "5px");

        var dlg = new sap.m.Dialog({
            contentHeight: "300px",
            contentHeight: "200px",
            content: cnt,
            buttons: [
                new sap.m.Button({
                    text: "Save & PDF",
                    customData: [{ key: ky }, { key: kfld }],
                    press: function () {
                        var s2 = this.getCustomData()[0].getKey();
                        var kfld = this.getCustomData()[1].getKey();
                        var sett = sap.ui.getCore().getModel("settings").getData();
                        var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + " h:mm a");
                        var view = this.view;
                        var wkno = UtilGen.getControlValue(that.cbWeek);
                        var profile = "GENERAL";
                        var preId = "";
                        if (Util.nvl(UtilGen.getControlValue(fe[5]), "") == "") FormView.err("Driver not selected !");
                        var su = "begin update order_cust_plan set cust_remarks=':REMARKS' , DELIVER_TIME= :DELIVER_TIME , " +
                            " DRIVER_NO=':DRIVER_NO' where keyfld=" + kfld + ";" +
                            " update order1 set sub_address=':SUB_ADDRESS',SUB_MOBILENO=':MOBILENO' where ord_code=1011 and ord_no=:ORD_NO; end; ";
                        su = su.replaceAll(":DELIVER_TIME", Util.toOraDateTimeString(fe[3].getDateValue()));
                        su = su.replaceAll(":DRIVER_NO", UtilGen.getControlValue(fe[5]));
                        su = su.replaceAll(":SUB_ADDRESS", fe[7].getValue());
                        su = su.replaceAll(":ORD_NO", that.ord_data[0].ORD_NO);
                        su = su.replaceAll(":REMARKS", UtilGen.getControlValue(fe[9]));
                        su = su.replaceAll(":MOBILENO", UtilGen.getControlValue(fe[11]));
                        var dtu = Util.execSQL(su);
                        if (dtu.ret == "SUCCESS") {
                            sap.m.MessageToast.show("Updated Delivery !");
                            that.ord_data[0].SUB_ADDRESS = fe[7].getValue();
                            that.ord_data[0].SUB_MOBILENO = fe[11].getValue();
                        }
                        else
                            FormView.err("Updated failed !");
                        var sq = "select op.*,sp.name driver from order_cust_plan op,salesp sp where ord_no=" + that.ord_data[0].ORD_NO + " and week_no=" + wkno +
                            " and day_no=" + s2 + " and  SP.NO(+)=OP.DRIVER_NO";
                        var dt = Util.execSQL(sq);
                        if (dt.ret == "SUCCESS") {
                            var dtx = JSON.parse("{" + dt.data + "}").data;
                            var dlvdt = new Date(dtx[0].DELIVER_TIME.replaceAll(".", ":"));

                            var ps = "_para_KEYFLD=" + dtx[0].KEYFLD + "&";
                            ps += "_para_CUST_CODE=" + Util.nvl(that.ord_data[0].ORD_REF, "") + "&";
                            ps += "_para_CUST_NAME=" + Util.nvl(that.ord_data[0].ORD_REFNM, "") + "&";
                            ps += "_para_CUST_ADDR=" + Util.nvl(that.ord_data[0].SUB_ADDRESS, "") + "&";
                            ps += "_para_DRIVER=" + dtx[0].DRIVER + "&";
                            ps += "_para_DAYENG=" + that.weekEngDays[dlvdt.getDay()] + "&";
                            ps += "_para_DAYARB=" + that.weekArbDays[dlvdt.getDay()] + "&";
                            ps += "_para_MOBILENO=" + Util.nvl(that.ord_data[0].SUB_MOBILENO, "") + "&";
                            ps += "_para_DLV_TIME=" + sf.format(dlvdt);

                            Util.doXhr("report?reportfile=sub_delivery&" + ps, true, function (e) {
                                if (this.status == 200) {
                                    var blob = new Blob([this.response], { type: "application/pdf" });
                                    var link = document.createElement('a');
                                    link.href = window.URL.createObjectURL(blob);
                                    link.target = "_blank";
                                    link.style.display = "none";
                                    document.body.appendChild(link);
                                    link.download = "sub_delivery" + new Date() + ".pdf";
                                    Util.printPdf(link.href);
                                    dlg.close();
                                    that.show_menu_items();
                                }

                            });
                        }
                    }
                }),
                new sap.m.Button({
                    text: "Close",
                    press: function () {
                        dlg.close();
                    }
                })
            ]
        });
        dlg.open();



    },
    show_menu_items: function () {
        var that = this;
        var dataMenus = [];
        that.custplan = [];
        var sett = sap.ui.getCore().getModel("settings").getData();
        var heightPanle = "10rem";// UtilGen.getControlValue(this.txtPanelSize);
        var wkno = UtilGen.getControlValue(that.cbWeek);
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + " E");
        var profile = 'GENERAL';
        that.clear_menu_items();

        var new_tb = function (tit, kd) {
            return new sap.m.Toolbar({
                content: [
                    new sap.m.Title({ text: tit }),
                    new sap.m.ToolbarSpacer(),
                    new sap.m.Button({
                        customData: [{ key: kd }],
                        icon: "sap-icon://eraser",
                        press: function (e) {
                            var ky = this.getCustomData()[0].getKey();
                            var s1 = ky.split("%%")[0];
                            var s2 = ky.split("%%")[1];
                            var wkno = UtilGen.getControlValue(that.cbWeek);
                            var profile = "GENERAL";
                            var sq = "update order_cust_plan " +
                                " set RFR_" + s1.toUpperCase() + " = null " +
                                " where ord_no=" + that.ord_data[0].ORD_NO + " and week_no=" + wkno +
                                " and day_no=" + s2;
                            var dt = Util.execSQL(sq);
                            if (dt.ret = "SUCCESS") {
                                sap.m.MessageToast.show("Cleared menu for " + s1 + " Day # " + (s2));
                                that.show_menu_items();
                            }

                        }
                    })
                ]
            }).addStyleClass("toolBarBackgroundColor1");
        };

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
            var dt = Util.execSQL("select day_no, DELIVERY_DATE, RFR_BREAKFAST, RFR_LUNCH, RFR_DINNER, RFR_SALAD, RFR_SNACK, RFR_SOUP from order_cust_plan WHERE ORD_NO=" + that.ord_data[0].ORD_NO + " and week_no=" + wkno + " order by day_no");
            that.custplan = [];
            if (dt.ret == "SUCCESS") {
                var dtx = JSON.parse("{" + dt.data + "}").data;
                for (var di in dtx) {
                    var dy = {
                        delivery_date: new Date(dtx[di].DELIVERY_DATE.replaceAll(".", ":")),
                        breakfast: dtx[di].RFR_BREAKFAST,
                        lunch: dtx[di].RFR_LUNCH,
                        dinner: dtx[di].RFR_DINNER,
                        salad: dtx[di].RFR_SALAD,
                        snack: dtx[di].RFR_SNACK,
                        soup: dtx[di].RFR_SOUP,
                    }
                    that.custplan[dtx[di].DAY_NO] = dy;
                }
            }
        };

        var new_menus = function (dy, ml) {
            var mnus = [];
            if (dataMenus.length <= 0 || dataMenus[dy] == undefined)
                return [];
            if (that.custplan[dy] == undefined) return;
            for (var d in dataMenus[dy + ""][ml]) {
                var dts = dataMenus[dy + ""][ml];
                var sel = (Util.nvl(that.custplan[i][ml], "") == dts[d].CODE ? true : false);
                var enab = true;
                // if (that.custplan[dy] != undefined && that.custplan[dy]["delivery_date"] != undefined &&
                //     that.custplan[dy]["delivery_date"].getTime() > that.TODAY_DATE.getTime())
                //     enab = true;

                var tx = new sap.m.CheckBox({
                    customData: [{ key: ml + "%%" + i + "%%" + dts[d].CODE }, { key: dts[d].KEYFLD }],
                    text: dts[d].DESCR + " ",
                    tooltip: dts[d].CODE,
                    selected: sel,
                    enabled: enab
                })
                tx.addStyleClass("txtSubMenu");

                tx.attachBrowserEvent("click", function (e) {
                    var control = this;
                    var cnt = this.getParent().getItems();
                    var cd = this.getCustomData()[0].getKey();
                    var dy = cd.split("%%")[1];
                    var cod = cd.split("%%")[2];
                    var wkno = UtilGen.getControlValue(that.cbWeek);
                    for (var c in cnt)
                        if (cnt[c] instanceof sap.m.CheckBox) cnt[c].setSelected(false);
                    var sq = "update order_cust_plan  set  rfr_" + cd.split("%%")[0] + "=" + Util.quoted(cod) +
                        " where ord_no=" + that.ord_data[0].ORD_NO + " and week_no=" + wkno + " and day_no=" + dy;
                    var dt = Util.execSQL(sq);
                    if (dt.ret == "SUCCESS") {
                        sap.m.MessageToast.show("Succesfully recorded for " + cd.split("%%")[0] + " , day " + dy + " Week " + wkno);
                    }
                    var control = this;
                    setTimeout(function () {
                        control.setSelected(true);
                    });

                });
                mnus.push(tx);
            }
            return mnus;

        }
        initData();
        for (var i = 0; i < this.weekdays; i++) {
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
            if (that.custplan[p] == undefined) continue;
            var dt = Util.nvl(that.custplan[p]["delivery_date"], "");
            var tb = new sap.m.Toolbar();
            var t1 = new sap.m.Title({ text: "Day " + (parseInt(p) + 1) + " - " + sf.format(dt) }).addStyleClass("sapUiSmallMargin titleFontWithoutPad redText");
            var bt = new sap.m.Button({
                customData: [{ key: p }],
                icon: "sap-icon://print",
                text: "Delivery",
                press: function (e) {
                    var ky = this.getCustomData()[0].getKey();
                    that.printDelivery(ky);
                }
            });
            tb.addContent(t1);
            tb.addContent(bt);
            this.vbDetails1.addContent(tb);
            this.vbDetails1.addContent(that.pnlDays[p].breakfast);
            this.vbDetails1.addContent(that.pnlDays[p].lunch);
            this.vbDetails1.addContent(that.pnlDays[p].dinner);
            this.vbDetails1.addContent(that.pnlDays[p].salad);
            this.vbDetails1.addContent(that.pnlDays[p].snack);
            this.vbDetails1.addContent(that.pnlDays[p].soup);
        }
        this.vbDetails1.addContent(new sap.m.VBox({ height: "100px" }));
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
    loadData: function () {
        var that = this;
        if (Util.nvl(this.oController.ord_no, "") == "")
            return;
        var dt = Util.execSQL("select *from order1 where ord_code=1011 and ord_no=" + this.oController.ord_no);
        if (dt.ret != "SUCCESS")
            FormView.err("Err ! loading data for order # " + this.oController.ord_no);
        this.ord_data = JSON.parse("{" + dt.data + "}").data;
        var nm = Util.getSQLValue("select descr from items where reference=" + Util.quoted(this.ord_data[0].SUB_GROUP_ITEM));
        this.txtGroup.setText("PLAN : " + nm);
        this.txtCust.setText("Customer : " + this.ord_data[0].ORD_REF + "-" + this.ord_data[0].ORD_REFNM + " Ord # " + this.ord_data[0].ORD_NO);
        this.txtCustPeriod.setText("Period : " + this.ord_data[0].SUB_FROMDATE + "-" + this.ord_data[0].SUB_TODATE);
        this.selectedGroup = this.ord_data[0].SUB_GROUP_ITEM;
        this.weekdays = 0;
        this.weekdays += (this.ord_data[0].SUB_SUN == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_MON == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_TUE == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_WED == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_THU == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_FRI == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_SAT == "Y" ? 1 : 0);
        that.show_menu_items();

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



