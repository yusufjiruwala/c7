sap.ui.jsview('bin.Dashboard', {

    /**
     * Specifies the Controller belonging to this View.
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf bin.Dashboard **/
    getControllerName: function () {
        return 'bin.Dashboard';
    },

    /**
     * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed.
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf bin.Dashboard **/
    createContent: function (oController) {
        jQuery.sap.require("sap.viz.library");
        jQuery.sap.require("sap.ui.table.library");
        jQuery.sap.require("sap.ui.layout.library");
        jQuery.sap.require("sap.ui.commons.library");
        jQuery.sap.require("sap.f.ShellBar");
        this.addStyleClass("sapUiSizeCompact");

        Util.setLanguageModel(this);

        var that = this;

        that.screen = -1;
        that.screen_name = "";
        that.screen_type = "Dashboard";
        this.mLctb = undefined;

        var url = new URL(window.location.href);
        var code = url.searchParams.get("screen");
        if (code != undefined)
            that.screen_init = code;

        Util.doAjaxGet("settings", "", false).done(function (data) {
            var dt = JSON.parse(data);
            var oModel = new sap.ui.model.json.JSONModel(dt);
            sap.ui.getCore().setModel(oModel, "settings");
        });
        this.sp = new sap.f.ShellBar({
            title: "Actions",
            homeIcon: "./resources/sap/ui/documentation/sdk/images/logo_ui5.png",
            showCopilot: true,
            showSearch: true,
            showNotifications: true,
            showProductSwitcher: false,
            showMenuButton: false,
            notificationsNumber: "0",
            menuButtonPressed: function (ev) {
                var md = (that.app.getMode() == sap.m.SplitAppMode.HideMode ? sap.m.SplitAppMode.StretchCompressMode : sap.m.SplitAppMode.HideMode)
                that.app.setMode(md);
                if (that.app.getMode() == sap.m.SplitAppMode.HideMode)
                    that.app.toMaster(that.pgMain);
                else {
                    that.app.toDetail(that.pg);
                    that.show_main_menus();
                }


            },
            menu: new sap.m.Menu({
                items: [
                    new sap.m.MenuItem({
                        text: "Show/Hide Menus..", icon: "sap-icon://menu2", press: function () {
                            var md = (that.app.getMode() == sap.m.SplitAppMode.HideMode ? sap.m.SplitAppMode.StretchCompressMode : sap.m.SplitAppMode.HideMode)
                            that.app.setMode(md);
                            if (that.app.getMode() == sap.m.SplitAppMode.HideMode)
                                that.app.toMaster(that.pgMain);
                            else {
                                that.app.toDetail(that.pg);
                                that.show_main_menus();
                            }
                        }
                    }),
                    new sap.m.MenuItem({
                        text: "Log out..", icon: "sap-icon://log", press: function () {
                            that.do_logon(true);

                        }
                    })
                ]
            })
        }).addStyleClass("sapFShellBar");

        this.txtExeCmd = new sap.m.Input({width: "100%"});
        this.cmdExe = new sap.m.Button(
            {
                text: "Execute",
                icon: "sap-icon://process",
                press: function (e) {
                    UtilGen.execCmd(that.txtExeCmd.getValue(), that, that.txtExeCmd, that.newPage);
                }
            });
        this.txtExeCmd.attachBrowserEvent("keydown", function (oEvent) {
            if (oEvent.key == 'Enter') {
                // sap.ui.getCore().byId($('#navigation button').eq(0).attr("i=d")).firePress();
                that.cmdExe.firePress();
            }
        });

        Util.destroyID("txtWindow", this);
        this.lstPgs = new sap.m.ComboBox(this.createId("txtWindow"), {
            selectionChange: function (e) {
                that.lstPageChange();
            }
        });// Database
        var itm = new sap.ui.core.ListItem({
            text: "Main", key: "main"
        });
        this.lstPgs.addItem(itm);
        this.lstPgs.setSelectedItem(itm);

        // detail page where all sections and main menus will display..
        this.pg = new sap.m.Page({
            showHeader: false,
            showFooter: true,
            enableScrolling: false,
            content: [],
            floatingFooter: false,
        });

        // detail page where forms will display...
        this.pg1 = [];


        this.newPage = function (dtx) {
            var pg1 = new sap.m.Page({
                showHeader: false,
                showFooter: false,
                content: [],
            });
            that.app.addDetailPage(pg1);
            that.pg1.push(pg1);
            var itm = new sap.ui.core.ListItem({text: Util.nvl(dtx.formTitle, dtx.formName), key: "dtx.formName"});
            that.lstPgs.addItem(itm);
            that.lstPgs.setSelectedItem(itm);
            pg1.item = itm;
            return pg1;

        };
        // action side menu page.
        this.pgMain = new sap.m.Page({
            showHeader: true,
            showFooter: false,
            enableScrolling: false,
            content: [],
        });

        this.app = new sap.m.SplitApp({
            detailPages: [this.pg],
            masterPages: [this.pgMain],
            mode: sap.m.SplitAppMode.HideMode
        });
        this.pg1.push(this.pg);
        //main page where split app and shellbar will display...
        this.mainPage = new sap.m.Page({
            showHeader: true,
            showFooter: true,
            enableScrolling: false,
            content: [this.app],
            customHeader: [this.sp],
            footer: [
                new sap.m.Toolbar({
                    content: [
                        new sap.m.Text({text: "Pages :", width: "80px"}), this.lstPgs, this.txtExeCmd, that.cmdExe
                    ]
                })
            ]

        });
        this.app2 = new sap.m.App({pages: [this.mainPage], height: "99%", width: "100%"});
        this.loadData();
        return this.app2;

    },

    do_logon: function (fnLoad) {

        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        Util.destroyID("txtUser", this);
        Util.destroyID("txtPassword", this);
        Util.destroyID("txtFile", this);
        Util.destroyID("chkAuto", this);
        Util.destroyID("cmdLogon", this);

        Util.destroyID("txtFile2", this);
        Util.destroyID("txtUser2", this);
        Util.destroyID("txtPassword2", this);
        Util.destroyID("txtHost", this);

        var op = new sap.m.Input(this.createId("txtUser")); // User name
        var np = new sap.m.Input(this.createId("txtPassword"), {type: sap.m.InputType.Password}); // New Password
        var cp = new sap.m.ComboBox(this.createId("txtFile"), {
            width: "100%",
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{file}", key: "{file}"}),
                templateShareable: true
            }
        });// Database
        var al = new sap.m.CheckBox(this.createId("chkAuto"), {
            width: "100%",
            selected: false,
            text: " Save credentials"
        }).addStyleClass("");
        var fnInitChange = function (ev) {
            var fl = UtilGen.getControlValue(cp2);
            Util.doAjaxGet("exe?command=get-init-data", "file=" + fl, false).done(function (data) {
                var oModel = new sap.ui.model.json.JSONModel();
                var dt = JSON.parse(data);
                op2.setValue(dt.ini_owner);
                np2.setValue(dt.ini_password);
                hs.setValue(dt.ini_dburl);
            });
        };

        var cp2 = new sap.m.ComboBox(this.createId("txtFile2"), {
            width: "100%",
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({text: "{file}", key: "{file}"}),
                templateShareable: true

            },
            selectionChange: fnInitChange
        });
        cp2.addEventDelegate({
            onfocusout: $.proxy(fnInitChange)

        });
        var op2 = new sap.m.Input(this.createId("txtUser2")); // User name
        var np2 = new sap.m.Input(this.createId("txtPassword2"), {type: sap.m.InputType.Password}); // New Password
        var hs = new sap.m.Input(this.createId("txtHost"), {value: "jdbc:oracle:thin:@HOST:1521:orcl"});

        Util.doAjaxGet("exe?command=get-init-files", "", false).done(function (data) {
            var oModel = new sap.ui.model.json.JSONModel();
            var dt = JSON.parse(data);
            dt.push({file: ".Schema"});
            dt.push({file: ".New Init"});
            oModel.setData(dt);

            cp.setModel(oModel);
            cp2.setModel(oModel);
            if (cp.getItems().length > 0)
                cp.setSelectedItem(cp.getItems()[0]);
        });

        var tb = new sap.m.Toolbar({
            content: [
                new sap.m.Button({
                    icon: "sap-icon://nav-back",
                    press: function () {
                        dlg.removeAllContent();
                        dlg.addContent(vb);
                        for (var i in bts)
                            dlg.addButton(bts[i]);
                    }
                }),
                new sap.m.Button({
                    icon: "sap-icon://save",
                    press: function () {

                    }
                })
            ]
        });

        var vb = new sap.m.VBox({
            items: [
                new sap.m.Text({text: "User Name "}),
                op,
                new sap.m.Text({text: "Password "}),
                np,
                new sap.m.Text({text: "Database"}),
                cp,
                new sap.m.HBox({width: "100%", items: [al]}),

            ]
        }).addStyleClass("sapUiSmallMargin");

        var bts = [
            new sap.m.Button({
                text: "New Init", press: function () {
                    dlg.removeAllButtons();
                    dlg.removeAllContent();
                    dlg.addContent(vbInit);
                }
            }),
            new sap.m.Button(this.createId("cmdLogon"), {
                text: "Logon", press: function () {
                    if (that.loginPress()) {
                        sap.m.MessageToast.show("Logon successful !");
                        that.loadData_main();
                        dlg.close();
                    }

                }
            })];

        var vbInit = new sap.m.VBox({
            items: [
                tb,
                new sap.m.Text({text: "Database"}),
                cp2,
                new sap.m.Text({text: "User"}),
                op2,
                new sap.m.Text({text: "Password "}),
                np2,
                new sap.m.Text({text: "Host "}),
                hs,

            ]
        }).addStyleClass("sapUiSmallMargin");

        var dlg = new sap.m.Dialog({
            title: "Logon..",
            buttons: bts,
            content: [vb]
        });
        dlg.open();
        Util.navEnter([op, np, cp, al, this.byId("cmdLogon")]);
        op.focus();
        // op.$().on("keydown", function (event) {
        //     console.log(event);
        //     if (event.keyCode == 13 || event.keyCode == 40) {
        //         np.focus();
        //     }
        // });
        //

    }
    ,
    loadData: function () {
        var mdl = sap.ui.getCore().getModel("settings");
        if (mdl == undefined) {
            this.do_logon();
            return;
        }
        var sett = sap.ui.getCore().getModel("settings").getData();

        if (sett["PROFILENO"] == undefined) {
            this.do_logon();
            return;
        }
        this.loadData_main();
    }
    ,

    loginPress: function () {
        var u = this.byId("txtUser");
        var p = this.byId("txtPassword");
        var f = this.byId("txtFile");
        var a = this.byId("chkAuto");
        var l = this.sLangu;

        var pth = "login?user=" + u.getValue() + "&password=" + p.getValue() + "&file=" + f.getSelectedKey() + "&language=" + l;

        var dt = null;
        Util.doAjaxGet(pth, "", false).done(function (data) {
            dt = JSON.parse(data);
            var oModel = new sap.ui.model.json.JSONModel(dt);

            sap.ui.getCore().setModel(oModel, "settings");

        });
        if (dt.errorMsg != null && dt.errorMsg.length > 0) {
            sap.m.MessageToast.show(dt.errorMsg);
            return;
        }
        pth = "exe?command=get-profile-list";
        Util.doAjaxGet(pth, "", false).done(function (data) {
            if (data != undefined) {
                var dt = JSON.parse(data);
                var oModel = new sap.ui.model.json.JSONModel(dt);
                sap.ui.getCore().setModel(oModel, "profiles");
            }
        });

        //jQuery.sap.require("sap.viz.library");

        // this.app = sap.ui.getCore().byId("mainApp");
        // var page = sap.ui.jsview("SplitPage", "chainel1.SplitPage");
        // this.app.addPage(page);
        // this.app.to(page);while

        var s1 = window.location.search.substring(1).split("&");
        var s = "";
        for (var i in s1) {
            var ss = s1[i].split("=");
            if (ss[0] != "file" && ss[0] != "user" && ss[0] != "password" && ss[0] != "clearCookies")
                s = s + (s.length > 0 ? "&" : "") + (s1[i]);
        }
        if (a.getSelected()) {
            Util.cookieSet("user", u.getValue(), 7);
            Util.cookieSet("password", p.getValue(), 7);
            Util.cookieSet("file", f.getSelectedKey(), 7);
            Util.cookieSet("autoLogon", a.getSelected(), 7);
        } else
            Util.cookiesClear();

        return true;
        // document.location.href = "/bi.html" + (s.length > 0 ? "?" : "") + s;

    }
    ,
    loadData_main: function () {
        var that = this;

        var secs = {};

        UtilGen.clearPage(this.pg);
        this.app.toDetail(this.pg);

        this.updateMenus();
        var sq = "select v_secs.*  from v_secs where menu_id=1 order by ms_id,ss_id,tile_id";
        var dt = Util.execSQL(sq);

        if (dt.ret == "SUCCESS" && dt.data.length > 0) {
            var dtx = JSON.parse("{" + dt.data + "}").data;

            Util.destroyID("ObjectPageLayout");
            var oObjectPage = new sap.uxap.ObjectPageLayout("ObjectPageLayout", {
                subSectionLayout: sap.uxap.ObjectPageSubSectionLayout.TitleOnTop,
            });
            // var sc = new sap.m.ScrollContainer({content: [oObjectPage], height: "100%", vertical: true});
            this.pg.addContent(oObjectPage);

            var oHeaderTitle = new sap.uxap.ObjectPageHeader();
            oHeaderTitle.setObjectTitle("Main Menus");
            oObjectPage.setHeaderTitle(oHeaderTitle);
            oObjectPage.setShowAnchorBar(true);


            for (var i in dtx) {
                if (!secs.hasOwnProperty(dtx[i].MS_ID)) {
                    secs[dtx[i].MS_ID] = {
                        "title": dtx[i].MS_TITLE_1, ss: {}, msObj: new sap.uxap.ObjectPageSection({
                            title: dtx[i].MS_TITLE_1, showTitle: true, titleUppercase: false
                        })
                    };
                    oObjectPage.addSection(secs[dtx[i].MS_ID].msObj);
                }
                if (!secs[dtx[i].MS_ID].ss.hasOwnProperty(dtx[i].SS_ID)) {
                    secs[dtx[i].MS_ID].ss[dtx[i].SS_ID] = {
                        "title": dtx[i].SS_TITLE_1,
                        tiles: {},
                        ssObj: new sap.uxap.ObjectPageSubSection({
                            title: (dtx[i].SS_TITLE_1 == "ALL" ? "" : dtx[i].SS_TITLE_1),
                            titleUppercase: false,
                            showTitle: true,
                        }),
                        hbox: new sap.ui.layout.Grid({
                            vSpacing: 1,
                            hSpacing: 1,
                            width: "100%",
                            defaultSpan: "XL2 L3 M4 S12"
                        })
                    }
                    ;
                    secs[dtx[i].MS_ID].msObj.addSubSection(secs[dtx[i].MS_ID].ss[dtx[i].SS_ID].ssObj);
                }

                if (!secs[dtx[i].MS_ID].ss[dtx[i].SS_ID].tiles.hasOwnProperty(dtx[dtx[i].TILE_ID])) {
                    var fv = "";
                    if (Util.nvl(dtx[i].FOOTER_SQL, "").length > 0)
                        fv = Util.getSQLValue(dtx[i].FOOTER_SQL)
                    secs[dtx[i].MS_ID].ss[dtx[i].SS_ID].tiles[dtx[i].TILE_ID] = {
                        "title": dtx[i].TILE_TITLE_1,
                        "FORM_NAME": dtx[i].EXEC_LINE,
                        "EXEC_TYPE": dtx[i].EXEC_TYPE,
                        "tileObj": new sap.m.GenericTile({
                            frameType: "OneByHalf",
                            header: dtx[i].TILE_TITLE_1,
                            tileContent: new sap.m.TileContent({
                                footer: fv
                            }),
                            press: function (ev) {
                                that.tileExe(this);

                            }
                        }).addStyleClass("dbTile")
                    };
                    secs[dtx[i].MS_ID].ss[dtx[i].SS_ID].tiles[dtx[i].TILE_ID].tileObj["dtx"] = dtx[i];
                    secs[dtx[i].MS_ID].ss[dtx[i].SS_ID].tiles[dtx[i].TILE_ID].tileObj.addStyleClass("mytilex");
                    if (secs[dtx[i].MS_ID].ss[dtx[i].SS_ID].hbox.getContent() == 0)
                        secs[dtx[i].MS_ID].ss[dtx[i].SS_ID].ssObj.addBlock(secs[dtx[i].MS_ID].ss[dtx[i].SS_ID].hbox);

                    secs[dtx[i].MS_ID].ss[dtx[i].SS_ID].hbox.addContent(secs[dtx[i].MS_ID].ss[dtx[i].SS_ID].tiles[dtx[i].TILE_ID].tileObj);
                }
            }
        }

        console.log(secs);
        // loading all c7_commands table data
        this.cmdData = undefined;
        var sq = "select KEYFLD, COMMAND, DESCR, PROFILES, FLAG, EXEC_LINE from c7_commands order by keyfld";
        var dt = Util.execSQL(sq);
        if (dt.ret == "SUCCESS" && dt.data.length > 0) {
            this.cmdData = JSON.parse("{" + dt.data + "}").data;
        }

    }
    ,
    tileExe: function (tile) {
        var that = this;
        UtilGen.execCmd(tile.dtx.EXEC_LINE, this, tile, this.newPage);
    }
    ,
    show_main_menus: function () {
        var that = this;

        UtilGen.clearPage(this.pgMain);

        var itm = [];
        itm.push(new sap.m.Text({text: "Tiles"}).addStyleClass("leftMenuFont1"));
        itm.push(new sap.m.Text({text: "New Tile", width: "100%"}).addStyleClass("leftMenuFont"));
        itm.push(new sap.m.Text({text: "Add Tile"}).addStyleClass("leftMenuFont"));
        itm.push(new sap.m.Text({text: "Remove a Tile"}).addStyleClass("leftMenuFont"));
        itm.push(new sap.m.Text({text: "Copy a Tile"}).addStyleClass("leftMenuFont"));
        itm.push(new sap.m.Text({text: "Users"}).addStyleClass("leftMenuFont1"));
        itm.push(new sap.m.Text({text: "Create a User"}).addStyleClass("leftMenuFont"));
        var vb = new sap.m.VBox({
            items: itm,
            alignItems: sap.m.FlexAlignItems.Center,
            justifyContent: sap.m.FlexJustifyContent.Center,
            height: "100%"
        });
        this.pgMain.addContent(vb);
        itm[1].attachBrowserEvent("click", function (e) {
            that.new_tile();
        });

    }
    ,
    new_tile: function () {
        var that = this;

    }
    ,
    updateMenus: function () {
        var that = this;
        this.sp.getMenu().removeAllItems();

        this.sp.getMenu().addItem(new sap.m.MenuItem({
            text: "Show/Hide Menus..", icon: "sap-icon://menu2", press: function () {
                var md = (that.app.getMode() == sap.m.SplitAppMode.HideMode ? sap.m.SplitAppMode.StretchCompressMode : sap.m.SplitAppMode.HideMode)
                that.app.setMode(md);
                if (that.app.getMode() == sap.m.SplitAppMode.HideMode)
                    that.app.toMaster(that.pgMain);
                else {
                    that.app.toDetail(that.pg);
                    that.show_main_menus();
                }
            }
        }));
        this.sp.getMenu().addItem(
            new sap.m.MenuItem({
                text: "Log out..", icon: "sap-icon://log", press: function () {
                    that.do_logon(true);

                }
            }));
        // add all groups first
        var dt = Util.execSQL("select  *from c7_actions order by action_id");
        if (dt.ret == "SUCCESS" && dt.data.length > 0) {
            var dtx = JSON.parse("{" + dt.data + "}").data;
            var lg = -1;
            var mnu = {};
            for (var i in dtx) {
                var mi = new sap.m.MenuItem({
                    text: dtx[i].MENU_TITLE_1,
                    icon: dtx[i].ICON_NAME,
                    press: function (ev) {
                        that.openAction(this);
                    }
                });
                mi["dtx"] = dtx[i];
                if (Util.nvl(dtx[i].PARENT_MENU, 0) == 0)
                    this.sp.getMenu().addItem(mi);
                else {
                    mnu[dtx[i].PARENT_MENU].addItem(mi);
                }
                mnu[dtx[i].ACTION_ID] = mi;

            }

        }

    }
    ,
    openAction: function (mi) {
        var dtx = mi.dtx;
        UtilGen.execCmd(mi.dtx.FORM_NAME, this, this.sp, this.newPage);
    }
    ,
    lstPageChange: function () {
        var that = this;
        var itm = this.lstPgs.getSelectedItem();
        var ix = -1;
        for (var i in this.lstPgs.getItems()) {
            if (itm == this.lstPgs.getItems()[i]) {
                ix = i;
                break;
            }
        }
        var pg1 = this.pg1[ix];
        if (pg1 != undefined)
            this.app.toDetail(pg1, "baseSlide");


    },
    destroyPage: function (pg) {
        var itm = pg.item;
        var ix = -1;
        for (var i in this.lstPgs.getItems()) {
            if (itm == this.lstPgs.getItems()[i]) {
                ix = i;
                break;
            }
        }
        this.pg1.splice(ix, 1);
        this.lstPgs.removeItem(itm);
        this.lstPgs.setSelectedItem(this.lstPgs.getItems()[0]);
        this.pg.destroyContent();
        this.pg.destroyHeaderContent();
        this.pg.destroyCustomHeader();


    }

    /*
    execCmd: function (txt) {

        if (txt == "")
            return;

        var that = this;
        var txt2 = txt;
        var cm = txt2.split(" ")[0].toUpperCase();
        var pms = txt2.substring(txt2.indexOf(" ") + 1).trim();
        if (this.cmdData != undefined && this.cmdData.length > 0)
            for (var i in this.cmdData)
                if (this.cmdData[i].COMMAND.toUpperCase() == cm)
                    txt2 = this.cmdData[i].EXEC_LINE + (pms.length > 0 ? " " : "") + pms;
        if (txt2.toLowerCase().startsWith("main")) {
            this.app.toDetail(this.pg, "slide");
            return;
        }
        if (!txt2.startsWith("#") && !txt2.startsWith("http")) {
            that.cmdOpenForm(txt2);

            return;
        }
    }
    ,
    cmdOpenForm: function (txt) {
        var that = this;
        // var formName = "", formType = "popover", formSize = "100%,100%", formModal = "true";
        var dtx = {formName: "", formType: "popover", formSize: "100%,100%", formModal: "true"};
        var tokens = txt.split(" ");
        for (var i in tokens) {

            if (i == 0) {
                dtx["formName"] = tokens[i];
                continue;
            }
            var tkn = tokens[i].split("=");
            dtx[tkn[0]] = tkn[1];
        }
        // validate the command and setting default values .......
        // opening form
        var con = this.pg1;
        var dlg = undefined;

        if (dtx.formType == "dialog") {
            var sp = dtx.formSize.split(",");
            var width = "400px", height = "500px";
            if (sp.length >= 1) width = sp[0];
            if (sp.length >= 2) height = sp[1];
            con = new sap.m.Page({showHeader: false, content: []});
            dlg = new sap.m.Dialog({
                title: Util.nvl(dtx.TILE_TITLE_1, ""),
                content: con,
                contentHeight: height,
                contentWidth: width,
            }).addStyleClass("sapUiSizeCompact");
        }
        if (dtx.formType == "popover") {
            var sp = dtx.formSize.split(",");
            var width = "400px", height = "500px";
            if (sp.length >= 1) width = sp[0];
            if (sp.length >= 2) height = sp[1];
            con = new sap.m.Page({showHeader: false, content: []});
            dlg = new sap.m.Popover({
                title: "",
                contentHeight: height,
                contentWidth: width,
                modal: (dtx.formModal == "true" ? true : false),
                content: [con],
                // footer: [hb],
                placement: sap.m.PlacementType.Auto
            }).addStyleClass("sapUiSizeCompact");
        }

        if (dtx.formType == "dialog" || dtx.formType == "page" || dtx.formType == "popover") {
            var pms = {};
            for (var i in dtx)
                if (!(i == "formType" || i == "formName" || i == "formSize" || i == "formModal"))
                    pms[i] = dtx[i];

            var sp = undefined;
            try {
                sp = UtilGen.openForm(dtx.formName, con, pms, this);
            }
            catch (err) {
                // err.message;throw
            }


            if (sp == undefined)
                try {
                    sp = UtilGen.openForm("bin.forms." + dtx.formName, con, pms, this);
                }
                catch (err) {
                    sap.m.MessageToast.show("Err ! opening form " + "bin.forms." + dtx.formName);
                    throw err;
                    return;
                }

            if (sp == undefined) {
                sap.m.MessageToast.show(dtx.formName + " fragment not found !");
                return;
            }
            sp.backFunction = function () {
                if (dlg != undefined) {
                    dlg.close();
                    return;
                }
                that.app.toDetail(that.pg, "show");
                that.loadData();
            };
            UtilGen.clearPage(con);
            con.addContent(sp);
            if (dtx.formType == "page")
                this.app.toDetail(con, "slide");
            else if (dtx.formType == "dialog") dlg.open();
            else if (dtx.formType == "popover") dlg.openBy(this.txtExeCmd);
        }

}
        */
})
;
