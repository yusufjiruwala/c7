sap.ui.jsview("bin.forms.rm.mo", {

    /** Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf view.View1
    */
    getControllerName: function () {
        return "bin.forms.yd.cu";
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf view.View1
    */
    createContent: function (oController) {
        var frag = this;
        jQuery.sap.require("sap.viz.library");
        jQuery.sap.require("sap.ui.table.library");
        jQuery.sap.require("sap.ui.layout.library");
        jQuery.sap.require("sap.ui.commons.library");
        Util.setLanguageModel(this);
        this.helperFunctions.init(this);
        this.timeInLong = (new Date()).getTime();
        this.addStyleClass("sapUiSizeCompact");
        this.joApp = new sap.m.SplitApp({ mode: sap.m.SplitAppMode.HideMode });
        UtilGen.DBView = this;
        frag.mainPage = new sap.m.Page({
            showHeader: false,
            showNavButton: false,
            enableScroll: true,
            height: "100%",
            content: []
        });

        frag.pgMaster = new sap.m.Page(this.createId("pgMaster"), {
            showHeader: false,
            showFooter: true,
            showNavButton: false,
            enableScroll: true,
            height: "100%",
            content: [new sap.m.Title({ text: "Menus" })]
        });
        frag.pgBasicData = new sap.m.Page(this.createId("pgBasic"), {
            showHeader: false,
            showSubHeader: true,
            showNavButton: false,
            enableScroll: true,
            height: "100%",
            content: []
        });



        frag.joApp.addDetailPage(frag.pgBasicData);
        frag.joApp.addDetailPage(frag.mainPage);
        frag.joApp.addMasterPage(frag.pgMaster);
        frag.joApp.toDetail(frag.pgMaster);
        // setTimeout(function () {
        //     frag.joApp.showMaster();
        // }, 100);
        this.loginDB = false;
        this.loginCust = false;
        this.loginToDB();
        if (this.loginDB)
            this.loginToCust();

        return this.joApp;

    },
    loginToDB: function () {
        var that = this;
        var url = new URL(window.location.href);
        var fn = Util.nvl(url.searchParams.get("filename"), "EMR.ini");
        var pth = "login?user=P&password=P&file=" + fn + "&language=EN";
        var dt = null;
        this.oController.doAjaxGet(pth, "", false).done(function (data) {
            dt = JSON.parse(data);
            var oModel = new sap.ui.model.json.JSONModel(dt);
            sap.ui.getCore().setModel(oModel, "settings");

            that.current_profile = oModel.getData()["CURRENT_PROFILE_CODE"];

            that.loginDB = true;
            setTimeout(function () {
                sap.m.MessageToast.show("User Logon success !");
            }, 500);
        });
        if (dt.errorMsg != null && dt.errorMsg.length > 0) {
            setTimeout(function () {
                sap.m.MessageToast.show(dt.errorMsg);
            }, 500);
            return;
        }
        pth = "exe?command=get-profile-list";
        this.oController.doAjaxGet(pth, "", false).done(function (data) {
            if (data != undefined) {
                var dt = JSON.parse(data);
                var oModel = new sap.ui.model.json.JSONModel(dt);
                sap.ui.getCore().setModel(oModel, "profiles");
            }
        });

    },

    loginToCust: function () {
        var that = this;
        var view = this;
        that.loginCust = false;
        var url = new URL(window.location.href);
        this.mngId = url.searchParams.get("managerId");
        this.pwd = url.searchParams.get("password");
        if (Util.nvl(this.mngId, "") == "") {
            setTimeout(function () {
                sap.m.MessageToast.show("No Subscription order specfied !");
            }, 500);
            return;
        }
        var dt = Util.execSQL("select password from cp_users where is_admin='Y' and username='" + this.mngId + "'");
        this.ord_data = JSON.parse("{" + dt.data + "}").data;

        if (Util.nvl(this.ord_data[0].PASSWORD, "") == "") {
            setTimeout(function () {
                sap.m.MessageToast.show("Not allowed to logon !");
            }, 500);
            return;
        }
        var cnt = new sap.m.ScrollContainer();//that.helperFunctions.getInfoContent("logon");
        cnt.addContent(new sap.m.VBox({ height: "25px" }));
        Util.destroyID("logonPwd", view);
        var hb1 = new sap.m.HBox({
            alignItems: sap.m.FlexAlignItems.Center,
            alignContent: sap.m.FlexAlignContent.Center,
            items: [
                new sap.m.Text({ text: "Password : ." }),
                new sap.m.Input(view.createId("logonPwd"), { type: "Password", value: Util.nvl(that.pwd, "") })
            ]
        })
        cnt.addContent(hb1);
        var dt = Util.execSQL("select TRUNC(sysdate) today_date from dual ");
        if (dt.ret == "SUCCESS") {
            var dtx = JSON.parse("{" + dt.data + "}").data;
            this.TODAY_DATE = new Date(dtx[0].TODAY_DATE.replaceAll(".", ":"));
        }
        var dlg = new sap.m.Dialog({
            contentHeight: "250px",
            contentWidth: "400px",
            content: cnt,
            title: "Logon ",
            draggable: true,
            buttons: [new sap.m.Button(view.createId("logonCmd"), {
                text: "Logon",
                press: function () {
                    if (that.ord_data[0].PASSWORD != that.byId("logonPwd").getValue()) {
                        setTimeout(function () {
                            sap.m.MessageToast.show("Not authorized, contact customer care  !");

                        }, 500);
                        return;
                    }

                    that.loginCust = true;
                    dlg.close();
                    that.createView();
                    that.loadData();
                    setTimeout(function () {
                        // that.joApp.showMaster();
                        that.joApp.toMaster(that.pgMaster);
                        that.joApp.toDetail(that.pgBasicData);
                        // that.oController.clearPage(that.mainPage);
                        // var img = new sap.m.Image({ src: "comp1.png", width: "100%" });
                        // that.mainPage.addContent(img);
                        var tb = new sap.m.Toolbar({
                            content: [new sap.m.Button({
                                icon: "sap-icon://paging",
                                press: function () {
                                    setTimeout(function () {
                                        that.joApp.showMaster();
                                        that.joApp.toMaster(that.pgMaster);
                                    })
                                }
                            }),
                            new sap.m.Title({ text: "Main Page" })]
                        });
                        that.mainPage.setShowSubHeader(true);
                        that.mainPage.setSubHeader(tb);
                    }, 200);
                }
            })]
        });
        setTimeout(function () {
            dlg.open();
            if (Util.nvl(that.pwd, "") != "")
                that.byId("logonCmd").firePress();
        }, 500);



    },
    createView: function () {
        var that = this;
        this.createMasterView();
    },

    createMasterView: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.oController.clearPage(this.pgMaster);
        this.pgMaster.addContent(new sap.m.Title({ width: "100%", text: sett["COMPANY_NAME"] }).addStyleClass("sapUiMediumMargin"));
        var cnt = new sap.m.ScrollContainer();
        this.pgMaster.addContent(cnt);
        this.pgMaster.addContent(new sap.m.VBox({ height: "30px" }));

        this.pgMaster.addContent(this.mnuBasic);
        this.showViewBasicData();

    },
    showViewBasicData: function () {
        var that = this;
        var hf = this.helperFunctions;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + " E");
        this.oController.clearPage(this.pgBasicData);
        var tb = new sap.m.Toolbar({
            content: [new sap.m.Button({
                icon: "sap-icon://paging",
                press: function () {
                    setTimeout(function () {
                        that.joApp.showMaster();
                        that.joApp.toMaster(that.pgMaster);
                    })
                }
            }),
            new sap.m.Title({ text: "Basic data" })]
        });
        this.pgBasicData.setShowSubHeader(true);
        this.pgBasicData.setSubHeader(tb);

        that.createTable();
        that.createOtherInfo();
    },
    createTable: function () {

        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var hf = this.helperFunctions;
        var preId = "";
        // this.oController.clearPage(this.pgBasicData);
        this.qv = new QueryView("lstRepTbl" + that.timeInLong);
        this.qv.getControl().addStyleClass("monTable");
        this.qv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);
        this.qv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        this.qv.getControl().setAlternateRowColors(false);
        this.qv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
        this.qv.getControl().setFixedBottomRowCount(0);
        this.qv.getControl().setVisibleRowCount(UtilGen.dispTblRecsByDevice({ "S": 4, "M": 8, "L": 16 }));
        this.qv.getControl().view = this;
        this.qv.onRowRender = function (qv, dispRow, rowno, currentRowContext, startCell, endCell) {
            var oModel = this.getControl().getModel();
            var oqty = parseFloat(oModel.getProperty("OQTY", currentRowContext));
            var dlv = parseFloat(oModel.getProperty("DLV_QTY", currentRowContext));
            var due = parseFloat(oModel.getProperty("DUE_QTY", currentRowContext));

            if (oqty > 0 && oqty - dlv <= 0)
                for (var i = startCell; i < endCell; i++) {
                    var cs = qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("text-align");
                    cs = (cs != "" ? "text-align:" + cs : "");
                    var bg = qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("background-color");
                    cs += (cs != "" ? ";" : "") + (bg != "" ? "background-color:" + bg : "");
                    qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("cssText", cs + ";color:#a9a9a9");
                    qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("cssText", cs + ";color:#a9a9a9");
                }

            if (oqty == 0 && oqty - dlv < 0)
                for (var i = startCell; i < endCell; i++) {
                    var cs = qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("text-align");
                    cs = (cs != "" ? "text-align:" + cs : "");
                    var bg = qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("background-color");
                    cs += (cs != "" ? ";" : "") + (bg != "" ? "background-color:" + bg : "");
                    qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().css("cssText", cs + ";color:red");
                    qv.getControl().getRows()[dispRow].getCells()[i - startCell].$().parent().parent().css("cssText", cs + ";color:#1e90ff");
                }



        };


        this.today_date = new sap.m.DatePicker({ width: "140px", editable: true, change: function () { that.loadData() } });
        this.location = new sap.m.Input({ value: "", width: "100px", editable: true });
        this.autoPos = new sap.m.CheckBox({ selected: true, text: "Auto Position" });
        this.txtMsg = new sap.m.Text({ width: "100px", text: "ss" }).addStyleClass("redText");

        this.timeRefresh = UtilGen.addControl([],
            "", sap.m.ComboBox,
            "",
            {
                width: "120px",
                value: "3000",
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                    templateShareable: true
                },
                selectionChange: function (event) {
                    that.loadData();
                }
            }, "string",
            "", this.view, undefined, "@15/15secs,20/20secs,30/30secs,40/40secs");
        this.timeRefresh.setSelectedItem(this.timeRefresh.getItems()[0]);
        if (this.ord_data != undefined) {
            this.today_date.setValueFormat(sett["ENGLISH_DATE_FORMAT"]);
            this.today_date.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"]);
            this.today_date.setDateValue(new Date());
            this.location.setValue("");
        }

        that.qv.createToolbar("", ["ORD_REF", "CUST_NAME", "B_NAME", "ORD_ITEM", "DESCR"],
            // EVENT ON APPLY PERSONALIZATION
            function (prsn, qv) {
                // var cod = rep.code + "-" + rptNo + "-" + qv.qrNo;
                var jstr = JSON.stringify(prsn).replaceAll(":", "->");
                var sq = "begin delete from c7_prsn_qry where usernm=':usernm' and qry_code=':qry_code';" +
                    " insert into c7_prsn_qry(KEYFLD, USERNM, QRY_CODE, JS_STR) " +
                    " values " +
                    "((select nvl(max(keyfld),0)+1 from c7_prsn_qry), " +
                    "':usernm', ':qry_code', ':js_str') ; end; ";
                sq = sq.replaceAll(":usernm", sett["LOGON_USER"]);
                sq = sq.replaceAll(":qry_code", 'RM_MON');
                sq = sq.replaceAll(":js_str", jstr);

                var dt = Util.execSQL(sq);
                if (dt.ret == "SUCCESS")
                    sap.m.MessageToast.show("Saved personalization to this query");
            },
            // EVENT ON REVERT PERSONALIZATION TO ORIGINAL
            function (qv) {
                var sq = "begin delete from c7_prsn_qry where usernm=':usernm' and qry_code=':qry_code';end; ";
                sq = sq.replaceAll(":usernm", sett["LOGON_USER"]);
                sq = sq.replaceAll(":qry_code", 'RM_MON');
                var dt = Util.execSQL(sq);
                if (dt.ret == "SUCCESS") {
                    sap.m.MessageToast.show("Revert to original !");
                    hf.showPersonalizeQueries();
                }
            }
        );
        this.qv.showToolbar.toolbar.addContent(new sap.m.Button({
            icon: "sap-icon://print",
            press: function () {
                that.colData = {};
                that.reportsData = {
                    report_info: { report_name: "Delivery Monitoring system" }
                };
                that.qv.printHtml(that, "para");
            }
        }));
        this.qv.showToolbar.toolbar.addContent(this.timeRefresh);
        this.qv.showToolbar.toolbar.addContent(this.today_date);
        this.qv.showToolbar.toolbar.addContent(this.autoPos);
        this.qv.showToolbar.toolbar.addContent(this.txtMsg);
        // this.qv.showToolbar.toolbar.addContent(this.location);

        that.pgBasicData.addContent(this.qv.showToolbar.toolbar);
        that.pgBasicData.addContent(this.qv.getControl());

    },
    createOtherInfo: function () {
        var that = this;
        var hf = this.helperFunctions;
        var settings = {
            width: { "S": 400, "M": 500, "L": 600 },
            cssText: [
                "padding-left:10px;" +
                "padding-top:20px;" +
                "border-width: thin;" +
                "border-style: solid;" +
                "border-color: lightgreen;" +
                "margin: 10px;" +
                "border-radius:25px;" +
                "background-color:ivory;"
            ]
        };
        var gd = new sap.ui.layout.Grid(
            {
                vSpacing: 0,
                hSpacing: 0,
                width: "100%",
                defaultSpan: "XL12 L12 M12 S12"
            }
        ).addStyleClass("sapUiMediumMargin");

        this.tot_oqty = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "200px", editable: false, height: "24px" }).addStyleClass("monQtyTxt");
        this.tot_dlvqty = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "200px", editable: false, height: "24px" }).addStyleClass("monQtyTxt");;
        this.tot_dueqty = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "200px", editable: false, height: "24px" }).addStyleClass("monQtyTxt");;

        this.dlv_time = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "300px", editable: false });
        this.dlv_no = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "150px", editable: false });
        this.dlv_cust = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "300px", editable: false });
        this.dlv_item = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "300px", editable: false });
        this.dlv_qty = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "300px", editable: false });

        this.pu_tot = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "27%", editable: false });
        this.pu_act = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "27%", editable: false });
        this.pu_ava = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "27%", editable: false });

        this.mx_tot = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "27%", editable: false });
        this.mx_act = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "27%", editable: false });
        this.mx_ava = new sap.m.Input({ textAlign: sap.ui.core.TextAlign.Center, width: "27%", editable: false });

        var fe = [
            hf.getLabelTxt("", "15%"), hf.getLabelTxt("totalTxt", "28%", "@"), hf.getLabelTxt("activeTxt", "28%", "@"), hf.getLabelTxt("availTxt", "28%", "@"),
            hf.getLabelTxt("pumpTxt", "15%"), this.pu_tot, hf.getLabelTxt("", "1%", "@"), this.pu_act, hf.getLabelTxt("", "1%", "@"), this.pu_ava,
            hf.getLabelTxt("mixerTxt", "15%"), this.mx_tot, hf.getLabelTxt("", "1%", "@"), this.mx_act, hf.getLabelTxt("", "1%", "@"), this.mx_ava
        ];
        var cnt = UtilGen.formCreate2("", true, fe, undefined, sap.m.ScrollContainer, { width: "375px" }, "sapUiSizeCompact", "");

        this.pu_tot.attachBrowserEvent("click", function () {
            that.show_vehicles(that.noPu, "total");
        });
        this.pu_act.attachBrowserEvent("click", function () {
            that.show_vehicles(that.noPu, "active");
        });
        this.pu_ava.attachBrowserEvent("click", function () {
            that.show_vehicles(that.noPu, "free");
        });

        this.mx_tot.attachBrowserEvent("click", function () {
            that.show_vehicles(that.noMx, "total");
        });
        this.mx_act.attachBrowserEvent("click", function () {
            that.show_vehicles(that.noMx, "active");
        });
        this.mx_ava.attachBrowserEvent("click", function () {
            that.show_vehicles(that.noMx, "free");
        });

        var new_tb = function (tit) {
            return new sap.m.Toolbar({
                content: [
                    new sap.m.Title({ text: tit }),
                    new sap.m.ToolbarSpacer()
                ]
            }).addStyleClass("toolBarBackgroundColor1");
        };
        var newHB = function (cnt, width, height) {
            return new sap.m.HBox(
                {
                    height: Util.nvl(height, "25px"),
                    width: Util.nvl(width, "300px"),
                    alignItems: sap.m.FlexAlignItems.Center,
                    alignContent: sap.m.FlexAlignContent.Center,
                    items: cnt
                }).addStyleClass("formRow");
        }
        var hb1 = newHB([new sap.m.Text({ width: "200px", text: Util.getLangText("orderQtyTxt") }).addStyleClass("titleFontWithoutPad"),
        this.tot_oqty], "300px", "25px");
        var hb2 = newHB([new sap.m.Text({ width: "200px", text: Util.getLangText("dlvQtyTxt") }).addStyleClass("titleFontWithoutPad"),
        this.tot_dlvqty], "300px", "25px");

        var hb3 = newHB([new sap.m.Text({ width: "200px", text: Util.getLangText("dueQtyTxt") }).addStyleClass("titleFontWithoutPad"),
        this.tot_dueqty], "300px", "25px");
        var hc1 = newHB([new sap.m.Text({ width: "100px", text: Util.getLangText("timeTxt") }),
        this.dlv_time], "300px", "25px");
        var hc2 = newHB([new sap.m.Text({ width: "100px", text: Util.getLangText("noTxt") }),
        this.dlv_no]
            , "300px", "25px");
        var hc3 = newHB([new sap.m.Text({ width: "100px", text: Util.getLangText("refCode") }),
        this.dlv_cust], "300px", "25px");
        var hc4 = newHB([new sap.m.Text({ width: "100px", text: Util.getLangText("itemCode") }),
        this.dlv_item]
            , "300px", "25px");
        var hc5 = newHB([
            new sap.m.Text({ width: "100px", text: Util.getLangText("orderQtyTxt") }),
            this.dlv_qty], "300px", "25px");

        var pnl_oqty = new sap.m.Panel(
            {
                expanded: true,
                height: "200px",
                headerToolbar: new_tb(Util.getLangText("totalTxt")),
                content: new sap.m.VBox({
                    width: "100%",
                    alignItems: sap.m.FlexAlignItems.Start,
                    alignContent: sap.m.FlexAlignContent.Start,
                    items: [hb1, hb2, hb3]
                }),
                customData: [{ key: "" }],
                layoutData: new sap.ui.layout.GridData({
                    span: "XL4 L4 M6 S6"
                })
            }).addStyleClass("menuTile");
        var pnl_dlv2 = new sap.m.Panel(
            {
                expanded: true,
                height: "200px",
                headerToolbar: new_tb(Util.getLangText("lastDlv")),
                content: new sap.m.VBox({
                    width: "100%",
                    alignItems: sap.m.FlexAlignItems.Start,
                    alignContent: sap.m.FlexAlignContent.Start,
                    items: [hc1, hc2, hc3, hc4, hc5]
                }),
                customData: [{ key: "" }],
                layoutData: new sap.ui.layout.GridData({
                    span: "XL4 L4 M6 S6"
                })
            }).addStyleClass("menuTile");

        var pnl_vehicles = new sap.m.Panel(
            {
                expanded: true,
                height: "200px",
                headerToolbar: new_tb(Util.getLangText("vehiclesTxt")),
                content: new sap.m.VBox({
                    width: "100%",
                    alignItems: sap.m.FlexAlignItems.Start,
                    alignContent: sap.m.FlexAlignContent.Start,
                    items: cnt
                }),
                customData: [{ key: "" }],
                layoutData: new sap.ui.layout.GridData({
                    span: "XL4 L4 M6 S6"
                })
            }).addStyleClass("menuTile");
        gd.addContent(pnl_oqty);
        gd.addContent(pnl_dlv2);
        gd.addContent(pnl_vehicles);
        that.pgBasicData.addContent(gd);
    },
    show_vehicles: function (ar, plt, tit) {
        var that = this;
        var ld = new LocalTableData();
        var c = new Column();
        c.mColName = "VEHICLE";
        c.mColpos = ld.cols.length;
        c.parentmLcTb = ld;
        c.getMUIHelper().data_type = "string";
        c.getMUIHelper().display_width = 200;
        c.mTitle = Util.nvl(Util.getLangText("vehiclesTxt"), c.mColName);
        ld.cols.push(c);
        c = new Column();
        c.mColName = "CNTS";
        c.mColpos = ld.cols.length;
        c.parentmLcTb = ld;
        c.getMUIHelper().data_type = "number";
        c.getMUIHelper().display_width = 100;
        c.mTitle = Util.nvl("No Of Delivery", c.mColName);

        ld.cols.push(c);
        Object.keys(ar).forEach((key, index) => {
            if (plt == "total") {
                var rn = ld.addRow();
                ld.setFieldValue(rn, "VEHICLE", key);
                ld.setFieldValue(rn, "CNTS", ar[key]);
            }
            if (plt == "active" && ar[key] > 0) {
                var rn = ld.addRow();
                ld.setFieldValue(rn, "VEHICLE", key);
                ld.setFieldValue(rn, "CNTS", ar[key]);
            }
            if (plt == "free" && ar[key] == 0) {
                var rn = ld.addRow();
                ld.setFieldValue(rn, "VEHICLE", key);
                ld.setFieldValue(rn, "CNTS", ar[key]);
            }

        });
        Util.show_list("", ["VEHICLE"], "", function (data) {
            if (data.length <= 0) return false;
            return true;
        }, "100%", "100%", undefined, false, undefined, undefined, ld);

    },
    showWeekPage: function () {
        var that = this;
        var profile = 'GENERAL';
        var wkno = this.weekno;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + " E");
        this.oController.clearPage(this.pgBasicData);

    },
    reFormatCol: function (ld) {
        var that = this;
        ld.cols[ld.getColPos("TYP")].mHideCol = true;
        ld.cols[ld.getColPos("LOCATION_CODE")].mHideCol = true;

        ld.cols[ld.getColPos("ORD_DATE")].mUIHelper.display_format = "SHORT_DATE_FORMAT";
        ld.cols[ld.getColPos("ORD_DATE")].mTitle = Util.getLangText("dateTxt");
        ld.cols[ld.getColPos("LOC_NAME")].mTitle = Util.getLangText("locationTxt");
        ld.cols[ld.getColPos("ORD_REF")].mTitle = Util.getLangText("refCode");
        ld.cols[ld.getColPos("ORD_BRANCH")].mTitle = Util.getLangText("branchNoTxt");
        ld.cols[ld.getColPos("CUST_NAME")].mTitle = Util.getLangText("refName");
        ld.cols[ld.getColPos("B_NAME")].mTitle = Util.getLangText("branchNmTxt");
        ld.cols[ld.getColPos("ORD_ITEM")].mTitle = Util.getLangText("itemTxt");
        ld.cols[ld.getColPos("DESCR")].mTitle = Util.getLangText("descrTxt");
        ld.cols[ld.getColPos("OQTY")].mTitle = Util.getLangText("orderQtyTxt");
        ld.cols[ld.getColPos("DLV_QTY")].mTitle = Util.getLangText("dlvQtyTxt");
        ld.cols[ld.getColPos("DUE_QTY")].mTitle = Util.getLangText("dueQtyTxt");
        ld.cols[ld.getColPos("CUST_BALANCE")].mTitle = Util.getLangText("custBalance");
        ld.cols[ld.getColPos("CRD_LIMIT")].mTitle = Util.getLangText("crdLimit");
        ld.cols[ld.getColPos("MIXER")].mTitle = Util.getLangText("mixerTxt");
        ld.cols[ld.getColPos("PUMP")].mTitle = Util.getLangText("pumpTxt");

        ld.cols[ld.getColPos("MIXER")].valOnZero = "";
        ld.cols[ld.getColPos("PUMP")].valOnZero = "";


        ld.cols[ld.getColPos("DLV_QTY")].mUIHelper.display_format = "QTY_FORMAT";
        ld.cols[ld.getColPos("OQTY")].mUIHelper.display_format = "QTY_FORMAT";
        ld.cols[ld.getColPos("DUE_QTY")].mUIHelper.display_format = "QTY_FORMAT";

        ld.cols[ld.getColPos("CUST_BALANCE")].mUIHelper.display_format = "MONEY_FORMAT";
        ld.cols[ld.getColPos("CRD_LIMIT")].mUIHelper.display_format = "MONEY_FORMAT";

        // ld.cols[ld.getColPos("OQTY")].mSummary = "SUM";
        // ld.cols[ld.getColPos("DLV_QTY")].mSummary = "SUM";
        // ld.cols[ld.getColPos("DUE_QTY")].mSummary = "SUM";

        ld.cols[ld.getColPos("ORD_DATE")].mUIHelper.display_align = "center";
        ld.cols[ld.getColPos("DLV_QTY")].mUIHelper.display_align = "center";
        ld.cols[ld.getColPos("OQTY")].mUIHelper.display_align = "center"
        ld.cols[ld.getColPos("DUE_QTY")].mUIHelper.display_align = "center"
    },
    loadData: function () {
        var that = this;
        if (!this.loginCust || !this.loginDB)
            return;
        var hf = this.helperFunctions;
        this.ERROR_ON_RCV_DATA = false;
        var td = this.today_date.getDateValue();
        var dt = Util.execSQL("select ORD_DATE, OQTY, DLV_QTY,0 DUE_QTY, LOCATION_CODE, LOC_NAME, " +
            " ORD_REF, ORD_BRANCH, CUST_NAME, B_NAME, ORD_ITEM, " +
            " DESCR, TYP ,0 cust_balance,crd_limit,mixer,pump " +
            " from V_DAILY_PROD " +
            " where trunc(ord_date)=" + Util.toOraDateString(td) + " order by OQTY-dlv_qty ");
        this.qv.setJsonStrMetaData("{" + dt.data + "}");
        var ld = this.qv.mLctb;
        this.reFormatCol(ld);
        this.noMx = {}; // no of active mixers today
        this.noPu = {}; // no of pumps active today
        var ldt = Util.execSQL("select name from relists where idlist='MIXERS'");
        if (ldt != undefined && ldt.ret == "SUCCESS") {
            var ldtx = JSON.parse("{" + ldt.data + "}").data;
            for (var ldi = 0; ldi < ldtx.length; ldi++)
                this.noMx[ldtx[ldi].NAME] = 0;

        }

        ldt = Util.execSQL("select name from relists where idlist='PUMPS'");
        if (ldt != undefined && ldt.ret == "SUCCESS") {
            var ldtx = JSON.parse("{" + ldt.data + "}").data;
            for (var ldi = 0; ldi < ldtx.length; ldi++)
                this.noPu[ldtx[ldi].NAME] = 0;
        }

        this.qv.eventCalc = function (qv, cs, rowno, reAmt) {
            var sett = sap.ui.getCore().getModel("settings").getData();
            var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
            if (rowno >= 0) return;
            var to = 0, td = 0, tu = 0;
            for (var i = 0; i < qv.mLctb.rows.length; i++) {
                var qo = qv.mLctb.getFieldValue(i, "OQTY");
                var qd = qv.mLctb.getFieldValue(i, "DLV_QTY");
                qv.mLctb.setFieldValue(i, "DUE_QTY", qo - qd);
                to += Util.nvl(qv.mLctb.getFieldValue(i, "OQTY"), 0);
                td += Util.nvl(qv.mLctb.getFieldValue(i, "DLV_QTY"), 0);
                tu += Util.nvl(qv.mLctb.getFieldValue(i, "DUE_QTY"), 0);
            }
            view.tot_oqty.setValue(to);
            view.tot_dlvqty.setValue(td);
            view.tot_dueqty.setValue(tu);

            var cntmx = Object.keys(that.noMx).length;
            var cntpu = Object.keys(that.noPu).length;
            that.pu_tot.setValue(cntpu);
            that.mx_tot.setValue(cntmx);
            qv.updateDataToControl();
        };

        this.qv.mLctb.parse("{" + dt.data + "}", true);
        this.qv.loadData();
        hf.showPersonalizeQueries();
        hf.do_timer();
        this.txtMsg.setText("");

    },
    helperFunctions: {
        init: function (pview) {
            this.view = pview;

        },
        do_timer: function () {
            var thatRV = this.view;
            var that = this;
            if (thatRV.rcv_data_timer != undefined)
                clearInterval(thatRV.rcv_data_timer);

            if (!Util.nvl(thatRV.ERROR_ON_RCV_DATA, false))
                thatRV.rcv_data_timer = setInterval(function () {
                    console.log(new Date());
                    that._rcvData(thatRV.qv);
                    if (thatRV.ERROR_ON_RCV_DATA == true)
                        clearInterval(thatRV.rcv_data_timer);
                }, parseInt(Util.nvl(UtilGen.getControlValue(thatRV.timeRefresh), "10")) * 1000);
            setTimeout(function () {
                that._rcvData(thatRV.qv);
            });
        },
        _rcvData: function (qv) {
            var view = this.view;
            var that = this;
            var td = view.today_date.getDateValue();
            var ld = new LocalTableData();
            var tmxs = parseInt(view.mx_tot.getValue());
            var tpus = parseInt(view.pu_tot.getValue());
            var sett = sap.ui.getCore().getModel("settings").getData();
            var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);

            var td = view.today_date.getDateValue();
            view.txtMsg.setText("Fetching..");
            var dt = Util.execSQL("select ORD_DATE, OQTY, DLV_QTY,0 DUE_QTY, LOCATION_CODE, LOC_NAME, " +
                " ORD_REF, ORD_BRANCH, CUST_NAME, B_NAME, ORD_ITEM, " +
                " DESCR, TYP, 0 cust_balance,crd_limit,mixer,pump  " +
                " from V_DAILY_PROD " +
                " where trunc(ord_date)=" + Util.toOraDateString(td));
            // ld.setJsonStrMetaData("{" + dt.data + "}");
            ld.parse("{" + dt.data + "}", false);
            var qd = qv.mLctb;
            if (ld.rows.length != qd.rows.length) {
                clearInterval(view.rcv_data_timer);
                view.loadData();
                return;
            }
            setTimeout(function () {
                view.txtMsg.setText("");
                qv.colorRows();
            });

            var fromr = qv.getControl().getFirstVisibleRow();
            var disp = qv.getControl().getVisibleRowCount();

            var cst = {}; //customer balance 
            var cstIn = "";
            for (var ci = 0; ci < ld.rows.length; ci++)
                cst[ld.getFieldValue(ci, "ORD_REF")] = 0;
            Object.keys(cst).forEach((key, index) => {
                cstIn += (cstIn.length > 0 ? "," : "") + Util.quoted(key)
            });
            var codeIn = (cstIn.length > 0 ? " and c_ycust.code in (" + cstIn + ") " : "");
            var cdt = Util.execSQL("select c_ycust.code,sum(debit-credit) bal from c_ycust,acvoucher2 where acvoucher2.flag=2 and acvoucher2.cust_code=c_ycust.code " + codeIn + " group by c_ycust.code order by c_ycust.code ")
            if (cdt != undefined && cdt.ret == "SUCCESS") {
                var cdtx = JSON.parse("{" + cdt.data + "}").data;
                for (var cdi = 0; cdi < cdtx.length; cdi++)
                    cst[cdtx[cdi].CODE] = Util.nvl(cdtx[cdi].BAL, 0);
            }

            for (var ci = 0; ci < ld.rows.length; ci++) {
                var loc = ld.getFieldValue(ci, "LOCATION_CODE");
                var lcc = ld.getFieldValue(ci, "ORD_REF");
                var ldat = ld.getFieldValue(ci, "ORD_DATE");
                var litm = ld.getFieldValue(ci, "ORD_ITEM");
                var lsite = ld.getFieldValue(ci, "ORD_BRANCH");
                ld.setFieldValue(ci, "CUST_BALANCE", df.format(Util.nvl(cst[lcc], 0))); // updating new cust_balance on ld table

                for (var cj = 0; cj < ld.rows.length; cj++) {
                    var ploc = qd.getFieldValue(cj, "LOCATION_CODE");
                    var qcc = qd.getFieldValue(cj, "ORD_REF");
                    var qdat = qd.getFieldValue(cj, "ORD_DATE");
                    var qitm = qd.getFieldValue(cj, "ORD_ITEM");
                    var qsite = qd.getFieldValue(cj, "ORD_BRANCH");
                    if (loc == ploc && lcc == qcc && ldat == qdat && litm == qitm && lsite == qsite) {
                        for (var cl = 0; cl < qd.cols.length; cl++) {
                            if (qd.cols[cl].mHideCol) continue;
                            if (["ORD_DATE", "ORD_REF", "ORD_ITEM", "ORD_BRANCH"].indexOf(qd.cols[cl].mColName) >= 0) continue;
                            qd.setFieldValue(cj, qd.cols[cl].mColName, ld.getFieldValue(ci, qd.cols[cl].mColName));
                            if (cj >= fromr && cj < (fromr + disp)) {
                                var colno = UtilGen.getTableColNo(qv.getControl(), qd.cols[cl].mColName);
                                if (colno >= 0) {
                                    var vl = qd.getFieldValue(cj, qd.cols[cl].mColName);
                                    if (["CRD_LIMIT", "MIXER", "PUMP"].indexOf(qd.cols[cl].mColName) >= 0 && vl == 0) vl = "";
                                    qv.getControl().getRows()[cj - fromr].getCells()[colno].setText(vl);
                                }
                            }
                        }
                    }



                    var qo = qv.mLctb.getFieldValue(cj, "OQTY");
                    var qdd = qv.mLctb.getFieldValue(cj, "DLV_QTY");

                    qv.mLctb.setFieldValue(ci, "DUE_QTY", qo - qdd);
                    colno = UtilGen.getTableColNo(qv.getControl(), 'DUE_QTY');

                    if (cj >= fromr && cj < (fromr + disp))
                        qv.getControl().getRows()[cj - fromr].getCells()[colno].setText(qo - qdd);

                }
            }

            var to = 0, td = 0, tu = 0, mxs = 0, pus = 0;
            var tdy = view.today_date.getDateValue();
            Object.keys(view.noMx).forEach((key, index) => {
                view.noMx[key] = 0;
            });
            Object.keys(view.noPu).forEach((key, index) => {
                view.noPu[key] = 0;
            });

            var ldt = Util.execSQL("select PAYTERM,NVL(COUNT(*),0) CNT from C_ORDER1 WHERE trunc(ORD_DATE)=" + Util.toOraDateString(tdy) + " group by payterm having NVL(COUNT(*),0)>0");
            if (ldt != undefined && ldt.ret == "SUCCESS") {
                var ldtx = JSON.parse("{" + ldt.data + "}").data;
                for (var ldi = 0; ldi < ldtx.length; ldi++) {
                    view.noPu[ldtx[ldi].PAYTERM] = Util.nvl(ldtx[ldi].CNT, 0);
                    pus++;
                }
            }
            var ldt = Util.execSQL("select VALIDATIY,NVL(COUNT(*),0) CNT from C_ORDER1 WHERE trunc(ORD_DATE)=" + Util.toOraDateString(tdy) + " group by VALIDATIY having NVL(COUNT(*),0)>0 ");
            if (ldt != undefined && ldt.ret == "SUCCESS") {
                var ldtx = JSON.parse("{" + ldt.data + "}").data;
                for (var ldi = 0; ldi < ldtx.length; ldi++) {
                    view.noMx[ldtx[ldi].VALIDATIY] = Util.nvl(ldtx[ldi].CNT, 0);
                    mxs++;
                }
            }

            for (var i = 0; i < qv.mLctb.rows.length; i++) {
                to += Util.nvl(qv.mLctb.getFieldValue(i, "OQTY"), 0);
                td += Util.nvl(qv.mLctb.getFieldValue(i, "DLV_QTY"), 0);
                tu += Util.nvl(qv.mLctb.getFieldValue(i, "OQTY"), 0) - Util.nvl(qv.mLctb.getFieldValue(i, "DLV_QTY"), 0);
            }
            view.tot_oqty.setValue(to);
            view.tot_dlvqty.setValue(td);
            view.tot_dueqty.setValue(tu);


            view.pu_act.setValue(pus);
            view.mx_act.setValue(mxs);

            view.pu_ava.setValue(tpus - pus);
            view.mx_ava.setValue(tmxs - mxs);


            var lst = Util.getSQLValue("select max(keyfld) from c_order1 where ord_date=" + Util.toOraDateString(tdy));

            if (Util.nvl(lst, "") != "") {
                var dt = Util.execSQL("select c_order1.location_code,c_order1.ord_date,c_order1.ORD_NO,c_order1.ord_ref,c_order1.ord_refnm,c_order1.ord_ship,c_order1.CREATDT,c_order1.TQTY,items.descr descr,c_order1.ord_discamt from c_order1,items  where items.reference=c_order1.ord_ship and  c_order1.keyfld=" + lst);
                if (dt != undefined && dt.ret == "SUCCESS") {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                    view.dlv_cust.setValue(dtx[0].ORD_REF + "-" + dtx[0].ORD_REFNM);
                    view.dlv_time.setValue(dtx[0].CREATDT);
                    view.dlv_item.setValue(dtx[0].ORD_SHIP + "-" + dtx[0].DESCR);
                    view.dlv_no.setValue(dtx[0].ORD_NO);
                    view.dlv_qty.setValue(dtx[0].TQTY + " M3");
                    var ld = qv.mLctb;
                    for (var cj = 0; cj < ld.rows.length; cj++) {
                        var loc = ld.getFieldValue(cj, "LOCATION_CODE");
                        var lcc = ld.getFieldValue(cj, "ORD_REF");
                        var ldat = ld.getFieldValue(cj, "ORD_DATE");
                        var litm = ld.getFieldValue(cj, "ORD_ITEM");
                        var lsite = ld.getFieldValue(cj, "ORD_BRANCH");
                        if (loc == dtx[0].LOCATION_CODE && lcc == dtx[0].ORD_REF && litm == dtx[0].ORD_SHIP && lsite == dtx[0].ORD_DISCAMT) {
                            qv.getControl().setSelectionInterval(cj, cj);
                            if (view.autoPos.getSelected()) {
                                var autopos = 0;
                                if (cj - 2 > -1) autopos = (cj - 2);
                                qv.getControl().setFirstVisibleRow(autopos);
                                break;
                            }
                        }


                    }

                }

            }
            // qv.updateDataToControl();
        },
        getLabelTxt: function (ptxt, pwidth, preText, styleText) {
            return Util.nvl(preText, "") + '{\"text\":\"' + ptxt + '\",\"width\":\"' + Util.nvl(pwidth, "15%") + '\","textAlign":"End","styleClass":"' + Util.nvl(styleText, "") + '"}'
        },
        getInfoContent: function (preId, pSettings) {

            var view = this.view;
            var settings = {
                ...{
                    width: "350px",
                    cssText: [
                        "padding-left:10px;" +
                        "padding-top:10px;"
                    ]
                    , ...pSettings
                }
            };
        },
        showPersonalizeQueries: function () {
            var that = this.view;
            setTimeout(function () {
                var sett = sap.ui.getCore().getModel("settings").getData();
                var cod = "RM_MON";
                var dt = Util.execSQL("select *from c7_prsn_qry " +
                    " where usernm=" + Util.quoted(sett["LOGON_USER"]) + " AND " +
                    " qry_code=" + Util.quoted(cod));
                if (dt != undefined && dt.ret == "SUCCESS") {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                    if (dtx.length > 0) {
                        var jstr = dtx[0].JS_STR.replaceAll("->", ":");
                        var prs = JSON.parse(jstr);
                        that.qv.personalize(prs);
                    } else if (that.qv.prsnOrigin != undefined)
                        that.qv.personalize(that.qv.prsnOrigin);
                }

            });
        },
    }

});