sap.ui.jsview("bin.forms.yd.cu", {

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
        this.helperFunctions.init(this);
        this.Util.init(this);
        this.addStyleClass("sapUiSizeCompact");
        this.joApp = new sap.m.SplitApp({ mode: sap.m.SplitAppMode.ShowHideMode });
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
        setTimeout(function () {
            frag.joApp.showMaster();
        }, 100);
        this.loginDB = false;
        this.loginCust = false;
        this.loginToDB();
        if (this.loginDB)
            this.loginToCust();
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

        return this.joApp;

    },
    loginToDB: function () {
        var that = this;
        var pth = "login?user=P&password=P&file=YD.ini&language=EN";
        var dt = null;
        this.oController.doAjaxGet(pth, "", false).done(function (data) {
            dt = JSON.parse(data);
            var oModel = new sap.ui.model.json.JSONModel(dt);
            sap.ui.getCore().setModel(oModel, "settings");

            that.current_profile = oModel.getData()["CURRENT_PROFILE_CODE"];
            // that.current_profile_name = Util.getSQLValue("select title from C6_MAIN_GROUPS where code=" + Util.quoted(this.current_profile));
            // this.style_debit_numbers = Util.nvl(oModel.getData()["STYLE_DEBIT_NUMBERS"], "color:green");
            // this.style_credit_numbers = Util.nvl(oModel.getData()["STYLE_CREDIT_NUMBERS"], "color:red");
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
        var Util = this.Util;
        var that = this;
        var view = this;
        that.loginCust = false;
        var url = new URL(window.location.href);
        this.ordNo = url.searchParams.get("ord_no");
        if (Util.nvl(this.ordNo, "") == "") {
            setTimeout(function () {
                sap.m.MessageToast.show("No Subscription order specfied !");
            }, 500);
            return;
        }
        var dt = Util.execSQL("select ord_no,ord_ref,ord_refnm,to_char(sub_fromdate,'dd/mm/rrrr') sub_fromdate,to_char(sub_todate,'dd/mm/rrrr') sub_todate," +
            " ord_date,ORD_TXT_IID,sub_group_item, (select descr from items where reference=sub_group_item) group_name, " +
            " sub_weight , sub_height, sub_address , sub_mobileno ," +
            " SUB_SAT, SUB_SUN, SUB_MON, SUB_TUE, SUB_WED, SUB_THU, SUB_FRI " +
            " from order1 where ord_code=1011 and ord_no=" + this.ordNo);
        this.ord_data = JSON.parse("{" + dt.data + "}").data;

        if (Util.nvl(this.ord_data[0].ORD_TXT_IID, "") == "") {
            setTimeout(function () {
                sap.m.MessageToast.show("Not allowed to logon !");
            }, 500);
            return;
        }
        this.weekdays = 0;
        this.weekdays += (this.ord_data[0].SUB_SUN == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_MON == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_TUE == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_WED == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_THU == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_FRI == "Y" ? 1 : 0);
        this.weekdays += (this.ord_data[0].SUB_SAT == "Y" ? 1 : 0);

        var cnt = that.helperFunctions.getInfoContent("logon");
        cnt.addContent(new sap.m.VBox({ height: "25px" }));
        Util.destroyID("logonPwd", view);
        var hb1 = new sap.m.HBox({
            alignItems: sap.m.FlexAlignItems.Center,
            alignContent: sap.m.FlexAlignContent.Center,
            items: [
                new sap.m.Text({ text: "Password : ." }),
                new sap.m.Input(view.createId("logonPwd"), { type: "Password" })
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
            buttons: [new sap.m.Button({
                text: "Logon",
                press: function () {
                    if (that.ord_data[0].ORD_TXT_IID != that.byId("logonPwd").getValue()) {
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
                        that.joApp.showMaster();
                        that.joApp.toMaster(that.pgMaster);
                        that.joApp.toDetail(that.mainPage);
                        that.oController.clearPage(that.mainPage);
                        var img = new sap.m.Image({ src: "comp1.png", width: "100%" });
                        that.mainPage.addContent(img);
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
        }, 500);



    },
    createView: function () {
        var that = this;
        var Util = this.Util;
        this.createMasterView();
    },

    createMasterView: function () {
        var that = this;
        var Util = this.Util;
        var sett = sap.ui.getCore().getModel("settings").getData();
        this.oController.clearPage(this.pgMaster);
        this.pgMaster.addContent(new sap.m.Title({ width: "100%", text: sett["COMPANY_NAME"] }).addStyleClass("sapUiMediumMargin"));
        var cnt = this.helperFunctions.getInfoContent("master",
            {
                width: "300px",
                cssText: [
                    "padding-left:10px;" +
                    "padding-top:20px;" +
                    "border-width: thin;" +
                    "border-style: solid;" +
                    "border-color: lightgreen;" +
                    "margin: 10px;" +
                    "border-radius:25px;"
                ]
            }
        );
        this.pgMaster.addContent(cnt);
        this.pgMaster.addContent(new sap.m.VBox({ height: "30px" }));
        // basic data
        this.mnuBasic = new sap.m.Text({
            text: "معلومات اساسية",
            width: "100%"

        }).addStyleClass("masterMenu");

        this.mnuBasic.attachBrowserEvent("click", function (e) {
            that.joApp.hideMaster();
            that.joApp.toDetail(that.pgBasicData, "slide");
            that.showViewBasicData();
        });
        //week 1
        this.week1 = new sap.m.Text({
            text: "الأسبوع الأول",
            width: "100%"

        }).addStyleClass("masterMenu");

        this.week1.attachBrowserEvent("click", function (e) {
            that.joApp.hideMaster();
            that.joApp.toDetail(that.pgBasicData, "slide");
            Util.doSpin();
            that.weekno = 1;
            that.showWeekPage();
            setTimeout(function () {
                Util.stopSpin();
            });

        });
        //week 2
        this.week2 = new sap.m.Text({
            text: "الأسبوع الثاني",
            width: "100%"

        }).addStyleClass("masterMenu");

        this.week2.attachBrowserEvent("click", function (e) {
            that.joApp.hideMaster();
            that.joApp.toDetail(that.pgBasicData, "slide");
            that.weekno = 2;
            Util.doSpin();
            that.showWeekPage();
            setTimeout(function () {
                Util.stopSpin();
            });
        });

        //week 3
        this.week3 = new sap.m.Text({
            text: "الأسبوع الثالث",
            width: "100%"

        }).addStyleClass("masterMenu");

        this.week3.attachBrowserEvent("click", function (e) {
            that.joApp.hideMaster();
            that.joApp.toDetail(that.pgBasicData, "slide");
            that.weekno = 3;
            Util.doSpin();
            that.showWeekPage();
            setTimeout(function () {
                Util.stopSpin();
            });
        });

        //week 4
        this.week4 = new sap.m.Text({
            text: "الأسبوع الرابع",
            width: "100%"

        }).addStyleClass("masterMenu");

        this.week4.attachBrowserEvent("click", function (e) {
            that.joApp.hideMaster();
            that.joApp.toDetail(that.pgBasicData, "slide");
            that.weekno = 4;
            that.showWeekPage();
            Util.doSpin();
            setTimeout(function () {
                Util.stopSpin();
            });

        });

        this.pgMaster.addContent(this.mnuBasic);
        this.pgMaster.addContent(this.week1);
        this.pgMaster.addContent(this.week2);
        this.pgMaster.addContent(this.week3);
        this.pgMaster.addContent(this.week4);



    },
    showViewBasicData: function () {
        var that = this;
        var Util = this.Util;
        var hf = this.helperFunctions;
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
        var preId = "basic";
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
        Util.destroyID(Util.nvl(preId, "") + "custName", view);
        Util.destroyID(Util.nvl(preId, "") + "address", view);
        Util.destroyID(Util.nvl(preId, "") + "mobileno", view);
        Util.destroyID(Util.nvl(preId, "") + "weight", view);
        Util.destroyID(Util.nvl(preId, "") + "height", view);

        var fe = [
            hf.getLabelTxt("Name", "25%"),
            new sap.m.Input(view.createId(Util.nvl(preId, "") + "custName"), { value: "", width: "75%", editable: true }),
            hf.getLabelTxt("Address", "25%"),
            new sap.m.Input(view.createId(Util.nvl(preId, "") + "address"), { value: "", width: "75%", editable: true }),
            hf.getLabelTxt("Mobile No", "25%"),
            new sap.m.Input(view.createId(Util.nvl(preId, "") + "mobileno"), { width: "25%", editable: true }),
            hf.getLabelTxt("Weight", "25%", "@"),
            new sap.m.Input(view.createId(Util.nvl(preId, "") + "weight"), { width: "25%", editable: true }),
            hf.getLabelTxt("Height", "25%", ""),
            new sap.m.Input(view.createId(Util.nvl(preId, "") + "height"), { width: "25%", editable: true })

        ];
        var cnt = Util.formCreate2("", true, fe, undefined, sap.m.ScrollContainer, settings, "sapUiSizeCompact", "5px");
        cnt.addContent(new sap.m.VBox({ height: "50px" }));
        cnt.addContent(new sap.m.Button({
            text: "Save",
            press: function () {
                var on = that.ord_data[0].ORD_NO;
                var sq = " begin update order1  " +
                    " set ord_refnm=:NAME , sub_address=:ADDRESS, sub_weight=:WEIGHT, sub_mobileno=:MOBILE, sub_height=:HEIGHT " +
                    " where ord_code=1011 and ord_no=" + on + "; " +
                    " update c_ycust " +
                    " set name=:NAME , addr=:ADDRESS where code=" + Util.quoted(that.ord_data[0].ORD_REF) + "; " +
                    " end; ";
                sq = sq.replaceAll(":NAME", Util.quoted(view.byId("basiccustName").getValue()));
                sq = sq.replaceAll(":ADDRESS", Util.quoted(view.byId("basicaddress").getValue()));
                sq = sq.replaceAll(":WEIGHT", Util.quoted(view.byId("basicweight").getValue()));
                sq = sq.replaceAll(":MOBILE", Util.quoted(view.byId("basicmobileno").getValue()));
                sq = sq.replaceAll(":HEIGHT", Util.quoted(view.byId("basicheight").getValue()));
                var dt = Util.execSQL(sq);
                if (dt.ret == "SUCCESS") {
                    sap.m.MessageToast.show("Data updated !");
                    that.ord_data[0].ORD_REFNM = view.byId("basiccustName").getValue();
                    that.ord_data[0].SUB_WEIGHT = view.byId("basicweight").getValue();
                    that.ord_data[0].SUB_HEIGHT = view.byId("basicheight").getValue();
                    that.ord_data[0].SUB_ADDRESS = view.byId("basicaddress").getValue();
                    that.ord_data[0].SUB_MOBILENO = view.byId("basicmobileno").getValue();
                }

            }
        }));
        that.pgBasicData.addContent(cnt);
        if (this.ord_data != undefined) {
            view.byId(Util.nvl(preId, "") + "custName").setValue(this.ord_data[0].ORD_REFNM);
            view.byId(Util.nvl(preId, "") + "weight").setValue(this.ord_data[0].SUB_WEIGHT);
            view.byId(Util.nvl(preId, "") + "mobileno").setValue(this.ord_data[0].SUB_MOBILENO);
            view.byId(Util.nvl(preId, "") + "height").setValue(this.ord_data[0].SUB_HEIGHT);
            view.byId(Util.nvl(preId, "") + "address").setValue(this.ord_data[0].SUB_ADDRESS);

        }
    },

    showWeekPage: function () {
        var that = this;
        var Util = this.Util;
        var profile = 'GENERAL';
        var wkno = this.weekno;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var sf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"] + " E");
        this.oController.clearPage(this.pgBasicData);
        that.selectedGroup = that.ord_data[0].SUB_GROUP_ITEM;
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
            new sap.m.Title({ text: "Week " + wkno })]
        });
        this.pgBasicData.setShowSubHeader(true);
        this.pgBasicData.setSubHeader(tb);

        var heightPanle = "10rem";// UtilGen.getControlValue(this.txtPanelSize);

        var dataMenus = [];
        that.custplan = [];
        that.vbHeader = new sap.m.VBox().addStyleClass("sapUiMediumMargin");
        that.vbDetails1 = new sap.ui.layout.Grid(
            {
                vSpacing: 0,
                hSpacing: 0,
                width: "100%",
                defaultSpan: "XL12 L12 M12 S12"
            }
        );
        that.pgBasicData.addContent(that.vbHeader);
        that.pgBasicData.addContent(that.vbDetails1);

        var clear_menu_items = function () {

            if (that.pnlDays != undefined)
                for (var pn in this.pnlDays) {
                    this.pnlDays[pn].breakfast.removeAllContent();
                    this.pnlDays[pn].lunch.removeAllContent();
                    this.pnlDays[pn].dinner.removeAllContent();
                    this.pnlDays[pn].salad.removeAllContent();
                    this.pnlDays[pn].snack.removeAllContent();
                    this.pnlDays[pn].soup.removeAllContent();
                }
            that.vbDetails1.removeAllContent();
            that.pnlDays = [];
        }

        var new_tb = function (tit, kd) {
            return new sap.m.Toolbar({
                content: [
                    new sap.m.Title({ text: tit }),
                    new sap.m.ToolbarSpacer()
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

            var dt = Util.execSQL("select day_no,DELIVERY_DATE,RFR_BREAKFAST, RFR_LUNCH, RFR_DINNER, RFR_SALAD, RFR_SNACK, RFR_SOUP from order_cust_plan WHERE ORD_NO=" + that.ord_data[0].ORD_NO + " and week_no=" + wkno + " order by day_no");
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
                var sel = (Util.nvl(that.custplan[dy][ml], "") == dts[d].CODE ? true : false);
                var enab = false;
                if (that.custplan[dy] != undefined && that.custplan[dy]["delivery_date"] != undefined &&
                    that.custplan[dy]["delivery_date"].getTime() > that.TODAY_DATE.getTime())
                    enab = true;
                var tx = new sap.m.CheckBox({
                    customData: [{ key: ml + "%%" + i + "%%" + dts[d].CODE }, { key: dts[d].KEYFLD }],
                    text: dts[d].DESCR + " ",
                    selected: sel,
                    enabled: enab

                })
                tx.addStyleClass("txtSubMenu");

                tx.attachBrowserEvent("click", function (e) {
                    var control = this;
                    if (!this.getEnabled()) return;
                    var cnt = this.getParent().getItems();
                    var cd = this.getCustomData()[0].getKey();
                    var dy = cd.split("%%")[1];
                    var cod = cd.split("%%")[2];
                    var wkno = that.weekno;
                    for (var c in cnt)
                        if (cnt[c] instanceof sap.m.CheckBox) cnt[c].setSelected(false);
                    var sq = "update order_cust_plan  set  rfr_" + cd.split("%%")[0] + "=" + Util.quoted(cod) + ", ORDERED_BY=" + Util.quoted(that.ord_data[0].ORD_REF) +
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
        clear_menu_items();
        initData();
        for (var i = 0; i < that.weekdays; i++) {
            var day = {
                breakfast: new sap.m.Panel(
                    {
                        expanded: false,
                        headerToolbar: new_tb("Breakfast - إفطار", "breakfast%%" + i),
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
                        headerToolbar: new_tb("Lunch - غداء", "lunch%%" + i),
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
                        headerToolbar: new_tb("Dinner - عشاء", "dinner%%" + i),
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
                        headerToolbar: new_tb("Salad - سلطة", "salad%%" + i),
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
                        headerToolbar: new_tb("Snack - سناك", "snack%%" + i),
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
                        headerToolbar: new_tb("Soup - شوربة ", "soup%%" + i),
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

        for (var p in that.pnlDays) {
            if (that.custplan[p] == undefined) continue;
            var dt = Util.nvl(that.custplan[p]["delivery_date"], "");
            var dystr = that.weekArbDays[dt.getDay()];
            var t1 = new sap.m.Title({ text: "Day " + (parseInt(p) + 1) + " - " + sf.format(dt) + " / " + dystr }).addStyleClass("sapUiSmallMargin titleFontWithoutPad redText");
            that.vbDetails1.addContent(t1);
            that.vbDetails1.addContent(that.pnlDays[p].breakfast);
            that.vbDetails1.addContent(that.pnlDays[p].lunch);
            that.vbDetails1.addContent(that.pnlDays[p].dinner);
            that.vbDetails1.addContent(that.pnlDays[p].salad);
            that.vbDetails1.addContent(that.pnlDays[p].snack);
            that.vbDetails1.addContent(that.pnlDays[p].soup);
        }
        that.vbDetails1.addContent(new sap.m.VBox({ height: "100px" }));
    },
    loadData: function () {
        if (!this.logonCust || !this.logonDB)
            return;

    },
    helperFunctions: {
        init: function (pview) {
            this.view = pview;

        },
        getLabelTxt: function (ptxt, pwidth, preText) {
            var Util = this.view.Util;

            return Util.nvl(preText, "") + '{\"text\":\"' + ptxt + '\",\"width\":\"' + Util.nvl(pwidth, "15%") + '\","textAlign":"End","styleClass":""}'
        },
        getInfoContent: function (preId, pSettings) {

            var view = this.view;
            var Util = view.Util;
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
            Util.destroyID(Util.nvl(preId, "") + "ord_no", view);
            Util.destroyID(Util.nvl(preId, "") + "cust_code", view);
            Util.destroyID(Util.nvl(preId, "") + "cust_name", view);
            Util.destroyID(Util.nvl(preId, "") + "group_name", view);
            Util.destroyID(Util.nvl(preId, "") + "fromdate", view);
            Util.destroyID(Util.nvl(preId, "") + "todate", view);
            var fe = [
                this.getLabelTxt("Ord No", "25%"),
                new sap.m.Text(view.createId(Util.nvl(preId, "") + "ord_no"), { value: "", width: "75%", editable: false }),
                this.getLabelTxt("Subscription", "25%"),
                new sap.m.Text(view.createId(Util.nvl(preId, "") + "group_name"), { value: "", width: "75%", editable: false }),
                this.getLabelTxt("Customer", "25%"),
                new sap.m.Text(view.createId(Util.nvl(preId, "") + "cust_code"), { width: "25%", editable: false }),
                this.getLabelTxt("", "1%", "@"),
                new sap.m.Text(view.createId(Util.nvl(preId, "") + "cust_name"), { width: "49%", editable: false }),
                this.getLabelTxt("Period", "25%"),
                new sap.m.Text(view.createId(Util.nvl(preId, "") + "fromdate"), { value: "", width: "37%", editable: false }),
                this.getLabelTxt("", "1%", "@"),
                new sap.m.Text(view.createId(Util.nvl(preId, "") + "todate"), { value: "", width: "37%", editable: false }),


            ];
            var cnt = Util.formCreate2("", true, fe, undefined, sap.m.ScrollContainer, settings, "sapUiSizeCompact", "5px");
            if (view.ord_data != undefined) {
                view.byId(Util.nvl(preId, "") + "ord_no").setText(view.ord_data[0].ORD_NO);
                view.byId(Util.nvl(preId, "") + "cust_code").setText(view.ord_data[0].ORD_REF);
                view.byId(Util.nvl(preId, "") + "cust_name").setText(view.ord_data[0].ORD_REFNM);
                view.byId(Util.nvl(preId, "") + "cust_name").setText(view.ord_data[0].ORD_REFNM);
                view.byId(Util.nvl(preId, "") + "group_name").setText(view.ord_data[0].GROUP_NAME);
                view.byId(Util.nvl(preId, "") + "fromdate").setText(view.ord_data[0].SUB_FROMDATE);
                view.byId(Util.nvl(preId, "") + "todate").setText(view.ord_data[0].SUB_TODATE);
            }
            return cnt;

        }
    },
    Util: {
        init: function (pview) {
            this.view = pview;
        },
        quoted: function (qt) {
            return "'" + this.nvl(qt, "") + "'";
        },
        doSpin: function (str) {
            this.busyDialog = new sap.m.BusyDialog({
                text: str,
            });
            this.busyDialog.open();

        },
        stopSpin: function () {
            if (this.busyDialog != undefined) {
                this.busyDialog.close();
                this.busyDialog.destroy();
                this.busyDialog = undefined;
            }
        },
        nvl: function (val1, val2) {
            if (typeof val1 == "function")
                return val1;

            return ((val1 == null || val1 == undefined || val1.length == 0) ? val2 : val1);
        }, extractNumber: function (pvr, df) {
            var vr = this.nvl(pvr, "");
            if (vr == "")
                return null;
            var neg = (vr.toString().startsWith("-") ? "-" : "");
            var val = vr.toString().replace(/[^\d\.]/g, '').replace(/,/g, '');
            if (df != undefined)
                val = parseFloat(neg + (df.formatBack(val)));
            else
                val = parseFloat("" + neg + val);
            return val;
        },
        getSQLValue: function (sql) {
            var dat = this.execSQL(sql);
            if (dat.ret == "SUCCESS" && dat.data.length > 0) {
                var dtx = JSON.parse("{" + dat.data + "}").data;
                if (dtx.length == 0) return "";
                return dtx[0][Object.keys(dtx[0])[0]];
                //return dtx[0].VALUE;
            }
            return "";
        },
        execSQL: function (sql) {
            var dtx = undefined;
            var view = this.view;
            if (sql.toLowerCase().startsWith("select")) {
                view.oController.doAjaxJson("sqlmetadata", {
                    sql: sql,
                    ret: "NONE",
                    data: null
                }
                    ,
                    false
                ).done(function (data) {
                    dtx = data;
                });
            }
            else {
                var oSql = {
                    "sql": sql,
                    "ret": "NONE",
                    "data": null
                };

                view.oController.doAjaxJson("sqlexe", oSql, false).done(function (data) {
                    dtx = data;
                });
            }
            if (dtx == undefined || dtx.ret != "SUCCESS") {
                console.log(sql);
                if (dtx != undefined)
                    throw dtx.ret;
                else
                    throw "Unexpected error in executing sql";
            }
            return dtx;
        },
        destroyID(id, view) {
            var ids = [];
            if (!Array.isArray(id))
                ids = [id];
            else ids = id;
            for (var i in ids)
                if (view != undefined)
                    (view.byId(ids[i]) != undefined ? view.byId(ids[i]).destroy() : null);
                else
                    (sap.ui.getCore().byId(ids[i]) != undefined ? sap.ui.getCore().byId(ids[i]).destroy() : null);
        },
        formCreate2: function (title, editable, content, pHbSet, classCont, contSetting, contCssClass, lastAddVB) {
            var Util = this;
            var cc = Util.nvl(contCssClass, "");
            if (contSetting != undefined && contSetting.hasOwnProperty("width")) {
                if (typeof contSetting.width == "object") {
                    var newr = "L";
                    if (sap.ui.Device.resize.width <= 639)
                        newr = "S";
                    if (sap.ui.Device.resize.width > 640 && sap.ui.Device.resize.width <= 1007)
                        newr = "M";
                    if (sap.ui.Device.resize.width > 1007)
                        newr = "L";
                    contSetting.width = contSetting.width[newr] + "px";
                    console.log("DEVICE " + newr + " -width=" + sap.ui.Device.resize.width + " records=" + contSetting.width);
                }
            }
            var sc = new classCont(Util.nvl(contSetting, {})).addStyleClass(cc);
            if (Util.nvl(contSetting, {}).hasOwnProperty("cssText")) {
                setTimeout(function () {
                    var ar = [].concat(contSetting["cssText"]);
                    for (var ix in ar)
                        sc.$().css("cssText", ar);
                }, 200);
            }
            var totWd = Util.nvl(Util.nvl(contSetting, {})["width"], "600px").replace("px", "");

            var fnAdd = function (cnt) {
                if (typeof sc.addItem == "function")
                    sc.addItem(cnt);
                else if (typeof sc.addContent == "function")
                    sc.addContent(cnt);
            };
            var cnt = [];
            var hz = [];
            var hbSet = Util.nvl(pHbSet, {});
            // if (hbSet.hasOwnProperty("width"))
            //     hbSet["width"] = "100%";
            if (hbSet.hasOwnProperty("height"))
                hbSet["height"] = "24px";
            var hb = new sap.m.HBox(hbSet);

            for (var i in content) {
                if (content[i] == undefined) {
                    console.log("form element " + i + " is undefined !");
                    continue;
                }
                fnAdd(hb);
                if (typeof content[i] === "string" && !content[i].startsWith("@") &&
                    !content[i].startsWith("#")) {
                    var cn = {};
                    try {
                        cn = JSON.parse(content[i]);
                    } catch (e) {
                        cn = { text: content[i] };
                    }
                    var setx = cn;
                    if (setx.hasOwnProperty("width") && setx["width"].endsWith("%")) {
                        var wd = (totWd / 100) * Util.extractNumber(setx["width"]);
                        setx["width"] = wd + "px";
                    }
                    var lbl = new sap.m.Label(setx);
                    if (setx.hasOwnProperty("styleClass"))
                        lbl.addStyleClass(setx["styleClass"]);
                    hb = new sap.m.HBox(hbSet);
                    fnAdd(hb);
                    hb.addItem(lbl);

                } else if (typeof content[i] === "string" && content[i].startsWith("@")) {
                    var cn = {};
                    try {
                        cn = JSON.parse(content[i].substr(1));
                    } catch (e) {
                        cn = { text: content[i].substr(1) };
                    }

                    var setx = cn;
                    if (setx.hasOwnProperty("width") && setx["width"].endsWith("%")) {
                        var wd = (totWd / 100) * Util.extractNumber(setx["width"]);
                        setx["width"] = wd + "px";
                    }
                    var lbl = new sap.m.Label(setx);
                    if (setx.hasOwnProperty("styleClass"))
                        lbl.addStyleClass(setx["styleClass"]);
                    hb.addItem(lbl);
                    // cnt.push(new sap.m.Text(setx));
                } else if (typeof content[i] === "string" && content[i].startsWith("#")) {
                    var cn = {};
                    try {
                        cn = JSON.parse(content[i].substr(1));
                    } catch (e) {
                        cn = { text: content[i].substr(1) };
                    }
                    var setx = cn;
                    if (setx.hasOwnProperty("width") && setx["width"].endsWith("%")) {
                        var wd = (totWd / 100) * Util.extractNumber(setx["width"]);
                        setx["width"] = wd + "px";
                    }
                    var lbl = new sap.m.Title(setx);
                    if (setx.hasOwnProperty("styleClass"))
                        lbl.addStyleClass(setx["styleClass"]);
                    if (setx.hasOwnProperty("style"))
                        lbl.$().attr("style", setx["style"]);

                    hb = new sap.m.HBox(hbSet);
                    fnAdd(hb);
                    hb.addItem(lbl);
                    // hb.addItem(new sap.m.Title({text: content[i].substr(1)}));
                    // hb = new sap.m.HBox(hbSet);
                    // fnAdd(hb);
                    // hb.addItem(new sap.m.Title({text: content[i].substr(1)}));
                }
                else {
                    if (typeof content[i].setWidth == "function" && content[i].getWidth().endsWith("%")) {
                        var wd = (totWd / 100) * Util.extractNumber(content[i].getWidth());
                        content[i].setWidth(wd + "px");
                    }
                    hb.addItem(content[i]);

                }
                hb.addStyleClass("formRow");

            }
            if (lastAddVB != undefined)
                fnAdd(new sap.m.VBox({ height: lastAddVB }));
            return sc;
        }
    }

});