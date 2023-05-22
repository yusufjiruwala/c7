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
        UtilGen.DBView = this;

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
            title: Util.getLangText("gl"),
            homeIcon: "./css/chn.png",
            showCopilot: true,
            showSearch: true,
            showNotifications: true,
            showProductSwitcher: false,
            showMenuButton: true,
            notificationsNumber: "0",
            homeIconPressed: function () {
                var md = (that.app.getMode() == sap.m.SplitAppMode.HideMode ? sap.m.SplitAppMode.StretchCompressMode : sap.m.SplitAppMode.HideMode);
                that.app.setMode(md);
            },
            copilotPressed: function () {
                // var md = (that.app.getMode() == sap.m.SplitAppMode.HideMode ? sap.m.SplitAppMode.StretchCompressMode : sap.m.SplitAppMode.HideMode);
                // that.app.setMode(md);
                UtilGen.setControlValue(that.lstPgs, "main");
                that.lstPgs.fireSelectionChange();
            },
            notificationsPressed: function (event) {
                Util.Notifications.showList(event, event.getParameter("button"));
            },
            menuButtonPressed: function (ev) {
                // var md = (that.app.getMode() == sap.m.SplitAppMode.HideMode ? sap.m.SplitAppMode.StretchCompressMode : sap.m.SplitAppMode.HideMode)
                // that.app.setMode(md);
                // if (that.app.getMode() == sap.m.SplitAppMode.HideMode)
                //     that.app.toMaster(that.pgMain);
                // else {
                //     that.app.toDetail(that.pg);
                //     that.show_main_menus();
                // }

                // that.app.showMaster();
                if (that.app.isMasterShown()) {
                    that.app.hideMaster();
                }
                else
                    that.app.showMaster();
            },
            menu: new sap.m.Menu({
                items: [
                    new sap.m.MenuItem({
                        text: "Refresh..", icon: "sap-icon://menu2", press: function () {
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
        this.txtExeCmd = new sap.m.TextArea({ height: "25px", width: "100%" });
        this.txtExeCmd.attachBrowserEvent("dblclick", function (e) {
            that.showPopCmd();
        });
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
                that.txtExeCmd.selectText();
                that.showPopCmd();

            }
        });

        Util.destroyID("txtWindow", this);
        this.lstPgs = new sap.m.ComboBox(this.createId("txtWindow"), {
            selectionChange: function (e) {
                that.lstPageChange();
            }
        });// Database

        var nxt = new sap.m.Button({
            icon: "sap-icon://journey-arrive",
            press: function (e) {
                var cn = that.lstPgs.getItems().indexOf(that.lstPgs.getSelectedItem());
                cn++;
                if (cn > that.lstPgs.getItems().length - 1)
                    cn = 0;
                that.lstPgs.setSelectedItem(that.lstPgs.getItems()[cn]);
                that.lstPgs.fireSelectionChange();
            }
        });

        var itm = new sap.ui.core.ListItem({
            text: "Main", key: "main"
        });

        this.lstPgs.addItem(itm);
        this.lstPgs.setSelectedItem(itm);

        // detail page where all sections and main menus will display..
        this.pg = new sap.m.Page({
            showHeader: false,
            showSubHeader: true,
            showFooter: false,
            enableScrolling: true,
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
            var itm = new sap.ui.core.ListItem({ text: Util.nvl(dtx.formTitle, dtx.formName), key: dtx.formName });
            that.lstPgs.addItem(itm);
            that.lstPgs.setSelectedItem(itm);
            pg1.item = itm;
            return pg1;

        };
        // action side menu page.
        this.pgMain = new sap.m.Page({
            showHeader: true,
            showFooter: true,
            enableScrolling: false,
            content: [],
        });
        var appMaster = new sap.m.App({ height: "90%", pages: [this.pgMain] });
        this.app = new sap.m.SplitApp({
            detailPages: [this.pg],
            masterPages: [appMaster],
            mode: sap.m.SplitAppMode.StretchCompressMode,
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
                        new sap.m.Text({ text: "Pages :", width: "80px" }), this.lstPgs, nxt, this.txtExeCmd, that.cmdExe
                    ]
                })
            ]

        });
        this.txt = new sap.m.Text().addStyleClass("redMiniText blinking");
        this.today_date = new sap.m.DatePicker({
            width: "150px",
            change: function () {
                that.loadData(false, false);
            }

        });
        Util.destroyID("lblLastDay" + this.timeInLong, this);
        var tb = new sap.m.Toolbar({
            content: [
                new sap.m.Button({
                    text: Util.getLangText("refresh"),
                    tooltip: Util.getLangText("refreshTip"),
                    icon: "sap-icon://refresh", press: function () {
                        that.loadData(false, false);
                    }
                }),
                this.today_date, new sap.m.Label(this.createId("lblLastDay" + this.timeInLong)),
                new sap.m.ToolbarSpacer(), this.txt]
        });
        this.app2 = new sap.m.App({ pages: [this.mainPage], height: "99%", width: "100%" });
        this.pg.setSubHeader(tb);
        Util.Notifications.init(3000, this.sp, this);

        this.loadData();
        this.mainPage.setShowSubHeader(true);
        var tbS = new sap.m.Bar({
        }).addStyleClass("toolBarBackgroundColor2");
        this.mainPage.setSubHeader(tbS);
        setTimeout(function () {
            that.app.showMaster();
            var tb = that.mainPage.getSubHeader();
            // that.show_main_menus();
        }, 10);


        UtilGen.toolBarBackColor = "#addfad";
        return this.app2;

    },
    showShortcuts: function () {
        var that = this;
        var tb = that.mainPage.getSubHeader();
        if (tb == null || tb == undefined) return;
        var str = (this.sLangu == "AR" ? " nvl(nvl(short_titlea,menu_titlea),nvl(short_title,menu_title)) menu_title " : " nvl(short_title,menu_title) menu_title ");
        var str2 = (this.sLangu == "AR" ? " nvl(menu_titlea,menu_title) menu_title2 " : " menu_title menu_title2 ");
        var dt = Util.execSQL("select menu_code," + str + ",js_command,SHORTCUT_ICON," + str2 + " from c7_menus where shortcut = 'Y' and group_code = " + Util.quoted(that.current_profile) + " order by menu_path");
        if (dt.ret != "SUCCESS")
            Util.err(dt.ret);
        var dtx = JSON.parse("{" + dt.data + "}").data;
        tb.removeAllContentMiddle();
        tb.removeAllContentRight();
        for (var i = 0; i < dtx.length; i++) {
            var bt = new sap.m.Button({
                text: dtx[i].MENU_TITLE,
                tooltip: dtx[i].MENU_TITLE2,
                icon: Util.nvl(dtx[i].SHORTCUT_ICON, "sap-icon://form"),
                customData: [{ key: dtx[i].CODE }, { key: dtx[i].JS_COMMAND }],
                press: function () {
                    var js = this.getCustomData()[1].getKey();
                    UtilGen.execCmd(js, that, this, that.newPage);
                }
            }).addStyleClass("");
            tb.addContentMiddle(bt);

        }
    },
    showPopCmd: function () {
        var that = this;
        var txt = new sap.m.TextArea({
            width: "100%",
            height: "100%",
            value: that.txtExeCmd.getValue()
        });
        var rbt = new sap.m.Button({
            text: "x", press: function () {
                that.txtExeCmd.setValue(txt.getValue());
                pop.close();
            }
        });
        var fe = [];
        var cmdList = UtilGen.addControl(fe, "Setup Type", sap.m.ComboBox, "cmdList" + this.timeInLong + "_",
            {
                enabled: true,
                customData: [{ key: "" }],
                items: {
                    path: "/",
                    template: new sap.ui.core.ListItem({ text: "{COMMAND}", key: "{KEYFLD}" }),
                    templateShareable: true
                },
                selectionChange: function (ev) {
                    var kf = UtilGen.getControlValue(this);
                    var cmd = Util.getSQLValue("select exec_line from C7_COMMANDS where keyfld=" + kf);
                    cmd = cmd.replaceAll('**', ':');
                    cmd = cmd.replaceAll('*.', "'");
                    cmd = cmd.replaceAll(/\\n/g, '\n');
                    txt.setValue(cmd);
                },
                value: ""
            }, "string", undefined, this, undefined, "select KEYFLD ,COMMAND FROM C7_COMMANDS ORDER BY KEYFLD");
        var pop = new sap.m.Popover({
            contentHeight: "30%",
            contentWidth: "70%",
            content: [txt],
            placement: sap.m.PlacementType.Auto,
            modal: false,
            customHeader: new sap.m.Toolbar({
                content: [
                    new sap.m.Button({
                        text: "F5 -Execute", press: function () {
                            rbt.firePress();
                            that.cmdExe.firePress();
                        }
                    }),
                    cmdList,
                    new sap.m.Button({
                        icon: "sap-icon://save",
                        press: function (e) {
                            var str = "begin delete from c7_commands where command=':command';" +
                                " insert into c7_commands (keyfld,command,exec_line) values " +
                                "((select nvl(max(keyfld),0)+1 from c7_commands),':command',':exec_line');" +
                                "end; ";
                            var tx = txt.getValue();
                            // tx = tx.replaceAll(/\n/g, "\\n");
                            tx = tx.replaceAll(/:/g, "**");
                            tx = tx.replaceAll(/\'/g, "*.");
                            tx = tx.replaceAll(/\n/g, "\\n");

                            str = str.replaceAll(":command", cmdList.getValue());
                            str = str.replaceAll(":exec_line", tx);
                            Util.execSQL(str);
                            sap.m.MessageToast.show("Saved command, #" + cmdList.getValue());
                        }
                    }),
                    new sap.m.ToolbarSpacer(),
                    rbt
                ]
            })
        })
            ;

        pop.openBy(that.txtExeCmd);

        txt.attachBrowserEvent("keydown", function (e) {
            if (e.key == 'F5') {
                rbt.firePress();
                that.cmdExe.firePress();
            }
        });
        setTimeout(function () {
            // var parentId = txt.getParent().getId();
            // var heightParent = $("#" + parentId + "-cont").css("height");
            txt.setHeight("1000px");
            txt.setValue(that.txtExeCmd.getValue());
            txt.focus();
            var l = $("#" + txt.getId() + "-inner")[0].value.length;
            $("#" + txt.getId() + "-inner")[0].setSelectionRange(l, l);
            $("#" + txt.getId() + "-inner").attr("spellcheck", false);

        }, 500);
    },
    recentClick: function (ri) {
        var tbl = this.rdtx[ri].TABLE_NAME;
        var tt = this.rdtx[ri].TRANS_TYPE;
        var vp1 = this.rdtx[ri].VAL_PARA_1;
        var vp2 = this.rdtx[ri].VAL_PARA_2;
        var vp3 = this.rdtx[ri].VAL_PARA_3;
        if (tbl == "ACACCOUNT" && (tt == "UPDATE" || tt == "INSERT"))
            UtilGen.execCmd("bin.forms.gl.masterAc formType=dialog formSize=650px,350px status=view accno=" + vp1, this, this, this.newPage);
        if (tbl == "ACVOUCHER1" && (tt == "UPDATE" || tt == "INSERT") && vp2 == "VOU_CODE=1,TYPE=1")
            UtilGen.execCmd("bin.forms.gl.jv formType=page status=view keyfld=" + vp1, this, this, this.newPage);
    },
    do_logon: function (fnLoad) {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var ln = sap.ui.getCore().getConfiguration().getLanguage();
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
        var np = new sap.m.Input(this.createId("txtPassword"), { type: sap.m.InputType.Password }); // New Password
        var cp = new sap.m.ComboBox(this.createId("txtFile"), {
            width: "100%",
            items: {
                path: "/",
                template: new sap.ui.core.ListItem({ text: "{file}", key: "{file}" }),
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
                template: new sap.ui.core.ListItem({ text: "{file}", key: "{file}" }),
                templateShareable: true

            },
            selectionChange: fnInitChange
        });
        cp2.addEventDelegate({
            onfocusout: $.proxy(fnInitChange)

        });
        var op2 = new sap.m.Input(this.createId("txtUser2")); // User name
        var np2 = new sap.m.Input(this.createId("txtPassword2"), { type: sap.m.InputType.Password }); // New Password
        var hs = new sap.m.Input(this.createId("txtHost"), { value: "jdbc:oracle:thin:@HOST:1521:orcl" });

        Util.doAjaxGet("exe?command=get-init-files", "", false).done(function (data) {
            var oModel = new sap.ui.model.json.JSONModel();
            var dt = JSON.parse(data);
            dt.push({ file: ".Schema" });
            dt.push({ file: ".New Init" });
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
        var url = new URL(window.location.href);
        var user = url.searchParams.get("user");
        if (user != undefined)
            op.setValue(user);
        if (url.searchParams.get("password") != undefined)
            np.setValue(url.searchParams.get("password"));
        if (url.searchParams.get("file") != undefined)
            cp.setValue(url.searchParams.get("file"));
        if (Util.nvl(np.getValue(), "") != "" &&
            Util.nvl(op.getValue(), "") != "" &&
            Util.nvl(cp.getValue(), "") != "")
            setTimeout(function () {
                that.byId("cmdLogon").firePress();
                var locUrl = location.href;
                var newURL = locUrl.split("?")[0];
                var newPara = "";
                var ar1 = ["user", "password", "file"];
                var u1 = locUrl.split("?")[1].split("&");
                for (var ui in u1)
                    if (ar1.indexOf(u1[ui].split("=")[0]) < 0)
                        newPara += (newPara.length > 0 ? "&" : "") + u1[ui];
                newURL = newURL + (newPara.length > 0 ? "?" : "") + newPara;
                console.log(newURL);
                window.history.pushState({}, document.title, newURL);
                // setTimeout(function () {
                //     that.exeParams();
                // }, 1000);

            });

        var vb = new sap.m.VBox({
            items: [
                new sap.m.Text({ text: Util.getLangText("loginName") }),
                op,
                new sap.m.Text({ text: Util.getLangText("loginPwd") }),
                np,
                new sap.m.Text({ text: Util.getLangText("loginDatabase") }),
                cp,
                new sap.m.HBox({ width: "100%", items: [al] }),

            ]
        }).addStyleClass("sapUiSmallMargin");

        var bts = [
            new sap.m.Button({
                text: ln == "AR" ? "EN" : "عر",
                icon: "sap-icon://keyboard-and-mouse",
                press: function () {
                    var ln2 = (ln == "AR" ? "EN" : "AR");
                    var locUrl = location.href;
                    var newURL = locUrl.split("?")[0] + "?" + "user=&sap-language=" + ln2;
                    window.history.pushState({}, document.title, newURL);
                    window.onbeforeunload = undefined;
                    location.reload();
                    window.onbeforeunload = function () { return " " }

                }
            }),
            new sap.m.Button({
                text: "New file", press: function () {
                    dlg.removeAllButtons();
                    dlg.removeAllContent();
                    dlg.addContent(vbInit);
                }
            }),
            new sap.m.Button(this.createId("cmdLogon"), {
                text: Util.getLangText("loginCmd"),
                icon: "sap-icon://initiative",
                press: function () {
                    if (that.loginPress()) {
                        sap.m.MessageToast.show(Util.getLangText("loginMsg1"));
                        that.loadData_main();
                        that.show_main_menus();
                        dlg.close();
                        setTimeout(function () {
                            that.exeParams();
                        }, 1000);
                    }

                }
            })];

        var vbInit = new sap.m.VBox({
            items: [
                tb,
                new sap.m.Text({ text: "Database" }),
                cp2,
                new sap.m.Text({ text: "{i18n>login_name}" }),
                op2,
                new sap.m.Text({ text: "{i18n>login_pwd}" }),
                np2,
                new sap.m.Text({ text: "{i18n>login_databaseHost}" }),
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
    loadData: function (pexePara, pChangeProfile) {
        var that = this;
        var changeProfile = Util.nvl(pChangeProfile, true);
        var exePara = Util.nvl(pexePara, true);
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
        var url = new URL(window.location.href);
        var user = url.searchParams.get("user");
        if (exePara && user != undefined) {
            this.do_logon();
            return;
        }

        if (changeProfile && !(Object.keys(sett).length === 0
            && Object.getPrototypeOf(sett) === Object.prototype)) {
            this.current_profile = sett["CURRENT_PROFILE_CODE"];
            var tit = (Util.getLangDescrAR("title", "nvl(titlea,title) title"));
            this.current_profile_name = Util.getSQLValue("select " + tit + " from C6_MAIN_GROUPS where code=" + Util.quoted(this.current_profile));
            this.style_debit_numbers = Util.nvl(sett["STYLE_DEBIT_NUMBERS"], "color:green");
            this.style_credit_numbers = Util.nvl(sett["STYLE_CREDIT_NUMBERS"], "color:red");

        }
        this.show_main_menus();
        this.loadData_main();
        if (exePara)
            setTimeout(function () {
                that.exeParams();
            }, 1000);
    }
    ,
    exeParams: function () {
        var url = new URL(window.location.href);
        var cmd = url.searchParams.get("cmd");
        if (Util.nvl(cmd, "") == "")
            return;
        var para = url.searchParams.get("para");
        var pr = (Util.nvl(para, "").length > 0 ? " " : "") + Util.nvl(para, "");
        pr = pr.replaceAll("@@", "=");
        UtilGen.execCmd(cmd + pr, UtilGen.DBView, UtilGen.DBView.txtExeCmd, UtilGen.DBView.newPage);
    }
    ,
    loginPress: function () {
        var that = this;
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
            var tit = (Util.getLangDescrAR("title", "nvl(titlea,title) title"));
            that.current_profile = oModel.getData()["CURRENT_PROFILE_CODE"];
            that.current_profile_name = Util.getSQLValue("select " + tit + " from C6_MAIN_GROUPS where code=" + Util.quoted(this.current_profile));
            this.style_debit_numbers = Util.nvl(oModel.getData()["STYLE_DEBIT_NUMBERS"], "color:green");
            this.style_credit_numbers = Util.nvl(oModel.getData()["STYLE_CREDIT_NUMBERS"], "color:red");



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
        var sett = sap.ui.getCore().getModel("settings").getData();
        var tit = (Util.getLangDescrAR("title", "nvl(titlea,title) title"));
        this.current_profile = sett["CURRENT_PROFILE_CODE"];
        this.current_profile_name = Util.getSQLValue("select " + tit + " from C6_MAIN_GROUPS where code=" + Util.quoted(this.current_profile));
        this.style_debit_numbers = Util.nvl(sett["STYLE_DEBIT_NUMBERS"], "color:green");
        this.style_credit_numbers = Util.nvl(sett["STYLE_CREDIT_NUMBERS"], "color:red");
        return true;
        // document.location.href = "/bi.html" + (s.length > 0 ? "?" : "") + s;

    }
    ,
    loadData_main: function () {
        var that = this;
        Util.Notifications.checkNewNotifications();
        var sett = sap.ui.getCore().getModel("settings").getData();
        that.today_date.setValueFormat(sett["ENGLISH_DATE_FORMAT"]);
        that.today_date.setDisplayFormat(sett["ENGLISH_DATE_FORMAT"]);
        var lstVouDate = Util.getSQLValue("select to_char(max(vou_date),'dd/mm/rrrr') from acvoucher1 ");
        this.byId("lblLastDay" + this.timeInLong).setText(Util.getLangText("lastVouEntry")+" :" + lstVouDate);
        if (Util.nvl(that.today_date.getDateValue(), undefined) == undefined) {
            var svdt = Util.getSQLValue("select to_char(sysdate,'mm/dd/rrrr') from dual ");
            that.today_date.setDateValue(new Date(svdt));
        }
        var cmp = sett["MASTER_USER"] + " >  " + sett["LOGON_USER"] + "@" + sett["COMPANY_NAME"];
        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
        var sdf = new simpleDateFormat(sett["ENGLISH_DATE_FORMAT"]);
        
        var secs = {};

        UtilGen.clearPage(this.pg);

        this.app.toDetail(this.pg);



        this.updateMenus();
        var sq = "select v_secs.*  from v_secs where menu_group='" + that.current_profile + "' and menu_id=1 order by ms_id,ss_id,tile_id";
        var dt = Util.execSQL(sq);

        if (dt.ret == "SUCCESS" && dt.data.length > 0) {
            var dtxM = JSON.parse("{" + dt.data + "}").data;

            Util.destroyID("ObjectPageLayout");
            var oObjectPage = new sap.uxap.ObjectPageLayout("ObjectPageLayout", {
                subSectionLayout: sap.uxap.ObjectPageSubSectionLayout.TitleOnTop,
                // showHeaderContent: false,
                height: "80%"
            });
            // var sc = new sap.m.ScrollContainer({content: [oObjectPage], height: "100%", vertical: true});
            this.pg.addContent(oObjectPage);

            var oHeaderTitle = new sap.uxap.ObjectPageHeader();
            // oHeaderTitle.setObjectTitle(cmp);
            // oObjectPage.setHeaderTitle(new sap.m.Toolbar());
            oObjectPage.setShowAnchorBar(true);
            // setTimeout(function () {
            //     // $(".sapUxAPObjectPageHeaderTitleText").css("cssText", "color:blue!important;font-size:12px!important;");
            //     $(".sapUxAPObjectPageHeaderTitleText").addClass("redMiniText");
            //     $(".sapUxAPObjectPageHeaderTitleText").addClass("blinking");
            //     // $(".sapUxAPObjectPageHeaderTitleText").css("cssText", "");
            // }, 1200);
            this.txt.setText(cmp);
            for (var i in dtxM) {
                if (!secs.hasOwnProperty(dtxM[i].MS_ID)) {
                    secs[dtxM[i].MS_ID] = {
                        "title": dtxM[i].MS_TITLE_1, ss: {}, msObj: new sap.uxap.ObjectPageSection({
                            title: dtxM[i].MS_TITLE_1, showTitle: false, titleUppercase: false
                        })
                    };
                    oObjectPage.addSection(secs[dtxM[i].MS_ID].msObj);
                }
                if (!secs[dtxM[i].MS_ID].ss.hasOwnProperty(dtxM[i].SS_ID)) {
                    secs[dtxM[i].MS_ID].ss[dtxM[i].SS_ID] = {
                        "title": dtxM[i].SS_TITLE_1,
                        tiles: {},
                        ssObj: new sap.uxap.ObjectPageSubSection({
                            title: (dtxM[i].SS_TITLE_1 == "ALL" ? "" : dtxM[i].SS_TITLE_1),
                            titleUppercase: false,
                            showTitle: true,
                        }),
                        hbox: new sap.m.ScrollContainer().addStyleClass("paddingTinyBot")
                        // hbox: new sap.ui.layout.Grid({
                        //     vSpacing: 1,
                        //     hSpacing: 1,
                        //     width: "100%",
                        //     defaultSpan: "XL2 L3 M3 S12"
                        // })
                    }
                        ;
                    secs[dtxM[i].MS_ID].msObj.addSubSection(secs[dtxM[i].MS_ID].ss[dtxM[i].SS_ID].ssObj);
                }

                if (!secs[dtxM[i].MS_ID].ss[dtxM[i].SS_ID].tiles.hasOwnProperty(dtxM[dtxM[i].TILE_ID])) {
                    var fv = "";
                    var tileC = new sap.m.TileContent({});
                    if (Util.nvl(dtxM[i].FOOTER_SQL, "").length > 0)
                        fv = Util.getSQLValue(dtxM[i].FOOTER_SQL);

                    secs[dtxM[i].MS_ID].ss[dtxM[i].SS_ID].tiles[dtxM[i].TILE_ID] = {
                        "title": dtxM[i].TILE_TITLE_1,
                        "FORM_NAME": dtxM[i].EXEC_LINE,
                        "EXEC_TYPE": dtxM[i].EXEC_TYPE,
                        "tileObj": Util.nvl(dtxM[i].CUSTOM_OBJ, "") != "" ? eval(dtxM[i].CUSTOM_OBJ) :
                            new sap.m.GenericTile({
                                frameType: Util.nvl(dtxM[i].TILE_SIZE, "OneByHalf"),
                                header: dtxM[i].TILE_TITLE_1,
                                tileContent: tileC,
                                press: function (ev) {
                                    that.tileExe(this);
                                }
                            }).addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginTop")
                    };

                    if (Util.nvl(dtxM[i].CONTENT_JS, "").length > 0)
                        try {
                            eval(dtxM[i].CONTENT_JS);
                        } catch (ex) {
                            console.log(ex);
                        }
                    ;

                    secs[dtxM[i].MS_ID].ss[dtxM[i].SS_ID].tiles[dtxM[i].TILE_ID].tileObj["dtx"] = dtxM[i];
                    secs[dtxM[i].MS_ID].ss[dtxM[i].SS_ID].tiles[dtxM[i].TILE_ID].tileObj.addStyleClass("mytilex");
                    if (secs[dtxM[i].MS_ID].ss[dtxM[i].SS_ID].hbox.getContent() == 0)
                        secs[dtxM[i].MS_ID].ss[dtxM[i].SS_ID].ssObj.addBlock(secs[dtxM[i].MS_ID].ss[dtxM[i].SS_ID].hbox);

                    secs[dtxM[i].MS_ID].ss[dtxM[i].SS_ID].hbox.addContent(secs[dtxM[i].MS_ID].ss[dtxM[i].SS_ID].tiles[dtxM[i].TILE_ID].tileObj);
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
        var btnMnu = new sap.m.Button({
            icon: "sap-icon://drop-down-list",
            text: this.current_profile_name,
            width: "100%",

            press: function () {
                if (sap.ui.getCore().getModel("profiles") == undefined) {
                    pth = "exe?command=get-profile-list";
                    Util.doAjaxGet(pth, "", false).done(function (data) {
                        if (data != undefined) {
                            var dt = JSON.parse(data);
                            var oModel = new sap.ui.model.json.JSONModel(dt);
                            sap.ui.getCore().setModel(oModel, "profiles");
                        }
                    });
                }
                var ps = sap.ui.getCore().getModel("profiles").getData();
                var mnus = [];
                var pList = ps.list;
                for (var i in pList) {
                    var mnu = new sap.m.MenuItem({
                        text: pList[i].code + "-" + pList[i].name,
                        customData: { key: pList[i].code + "::=" + pList[i].name },
                        press: function (ev) {
                            var cs = this.getCustomData()[0].getKey();
                            that.current_profile = cs.split("::=")[0];
                            that.current_profile_name = cs.split("::=")[1];
                            this.setText(cs.split("::=")[1]);
                            that.show_main_menus();
                            that.loadData_main();
                        }
                    });
                    mnus.push(mnu);
                }
                var mnu = new sap.m.Menu({
                    title: "",
                    items: mnus
                }).addStyleClass("profileMenus");

                mnu.openBy(this);
            }
        }).addStyleClass("profileMenus");
        var tb = new sap.m.Toolbar({
            width: "100%",
            content: [
                new sap.m.Button({
                    icon: "sap-icon://log", press: function () {
                        that.do_log_out();
                    }
                }),
                btnMnu
            ]
        }).addStyleClass("profileMenus");
        this.pgMain.removeAllHeaderContent();
        this.pgMain.addHeaderContent(tb);

        // if (this.mv == undefined)
        this.mv = new QueryView("mainMenus");
        var mnuTit = Util.getLangDescrAR("MENU_TITLE", "NVL(MENU_TITLEA,MENU_TITLE) MENU_TITLE ");
        var dt = Util.execSQL("select menu_code," + mnuTit + ",parent_menucode,childcount,JS_COMMAND,JS_PARAMS,SHORTCUT_ICON" +
            " from C7_MENUS where group_code='" + that.current_profile + "' order by menu_path")
        // var dt = Util.execSQL("select accno menu_code,name menu_title, parentacc from acaccount order by path ")


        if (dt.ret != "SUCCESS")
            Util.err(dt.ret);

        var mv = this.mv;

        mv.mColCode = "MENU_CODE";
        mv.mColName = "MENU_TITLE";
        mv.mColParent = "PARENT_MENUCODE";
        mv.switchType("tree");

        mv.setJsonStr("{" + dt.data + "}");

        mv.mLctb.getColByName("MENU_CODE").getMUIHelper().display_width = "100";
        mv.mLctb.getColByName("MENU_TITLE").getMUIHelper().display_width = "250";
        mv.mLctb.getColByName("MENU_TITLE").mTitle = Util.getLangText("mainMenus");
        // mv.mLctb.getColByName("MENU_TITLE").mCfOperator = ":CHILDCOUNT>0";
        // mv.mLctb.getColByName("MENU_TITLE").mCfTrue = "color:blue;font-weight: bold;";

        mv.mLctb.getColByName("MENU_CODE").mHideCol = true;
        mv.mLctb.getColByName("PARENT_MENUCODE").mHideCol = true;
        mv.mLctb.getColByName("CHILDCOUNT").mHideCol = true;
        mv.mLctb.getColByName("JS_COMMAND").mHideCol = true;
        mv.mLctb.getColByName("JS_PARAMS").mHideCol = true;
        mv.mLctb.getColByName("SHORTCUT_ICON").mHideCol = true;

        mv.switchType("tree");
        // var sc = new sap.m.ScrollContainer({ content: [mv.getControl()] });
        // sc.setHeight("100%");
        this.pgMain.addContent(mv.getControl());
        // this.pgMain.addContent(new sap.m.VBox({ height: "200px" }));
        // mv.getControl().expandToLevel(10);
        mv.getControl().collapseAll();
        mv.getControl().setFixedBottomRowCount(0);
        // mv.getControl().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
        // mv.getControl().setVisibleRowCount(100);
        mv.getControl().setSelectionMode(sap.ui.table.SelectionMode.Single);
        mv.getControl().setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
        mv.getControl().addStyleClass("sapUiSizeCondensed " + Util.getLangDescrAR("menuTable", "menuTableAR"));
        mv.getControl().attachRowSelectionChange(undefined, function () {

            var sl = mv.getControl().getSelectedIndices();
            if (sl.length > 0) {
                if (mv.getControl().isExpanded(sl[0]))
                    mv.getControl().collapse(sl[0]);
                else mv.getControl().expand(sl[0]);

                var odata = mv.getControl().getContextByIndex(sl[0]);
                var data = (odata.getProperty(odata.getPath()));
                UtilGen.execCmd(data.JS_COMMAND, that, this, that.newPage);
                mv.getControl().setSelectedIndex(-1);
            }

        });
        mv.loadData();
        mv.getControl().collapseAll();
        setTimeout(function () {
            that.showShortcuts();

        });
    }
    ,
    new_tile: function () {
        var that = this;

    }
    ,
    do_log_out: function () {
        var that = this;
        if (sap.m.MessageBox == undefined)
            jQuery.sap.require("sap.m.MessageBox");
        sap.m.MessageBox.confirm("Are you sure to LOG OFF ?  ", {
            title: "Confirm",                                    // default
            onClose: function (oAction) {
                var ln = sap.ui.getCore().getConfiguration().getLanguage();
                if (oAction == sap.m.MessageBox.Action.OK) {
                    var locUrl = location.href;
                    var newURL = locUrl.split("?")[0] + "?" + "user=&sap-language=" + ln;
                    window.history.pushState({}, document.title, newURL);
                    window.onbeforeunload = undefined;
                    location.reload();
                    window.onbeforeunload = function () { return " " }
                }
            },                                       // default
            styleClass: "",                                      // default
            initialFocus: null,                                  // default
            textDirection: sap.ui.core.TextDirection.Inherit     // default
        });
    },
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
        if (pg1 != undefined) {
            this.app.toDetail(pg1, "baseSlide");
            if (pg1.getContent().length > 0 && pg1.getContent()[0].displayBack != undefined)
                pg1.getContent()[0].displayBack();
        }
        if (this.lstPgs.getValue() == "Main")
            this.loadData_main();

    },
    destroyPage: function (pg) {
        var that = this;
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
        this.lstPgs.setSelectedItem(this.lstPgs.getItems()[this.lstPgs.getItems().length - 1]);
        this.pg.destroyContent();
        this.pg.destroyHeaderContent();
        this.pg.destroyCustomHeader();
        setTimeout(function () {
            that.lstPgs.fireSelectionChange();
        });


    },
    show_list_cmd: function (txt2) {
        var sq = Util.getFromWord(txt2, 2);
        var prnt = "";
        var cols = [];
        var js = undefined;
        if (sq.indexOf(";") > -1) {
            var sqq = sq.split(";")[0];
            js = sq.split(";")[1];
            sq = sqq;
            js = JSON.parse("[" + js + "]");
        }

        if (sq.toLowerCase().startsWith("select")) {
            Util.show_list(sq, undefined, "", function (data) {
                return true;
            }, "100%", "100%", undefined, false, undefined, undefined, undefined, js);
        }
    },

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
