sap.ui.jsfragment("bin.forms.gl.masterAcOld", {

    createContent: function (oController) {
        var that = this;
        this.errStr = "";
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = Util.nvl(oController.qryStr, "");
        this.ac = {};
        this.timeInLong = (new Date()).getTime();
        this.joApp = new sap.m.App({});
        this.vars = {
            keyfld: -1,
            flag: 1,  // 1=closed,2 opened,
            onm: "",
            currency_code: "USD",
            start_date: new Date()
        };
        // this.pgDetail = new sap.m.Page({showHeader: false});

        this.bk = new sap.m.Button({
            text: "Close",
            icon: "sap-icon://nav-back",
            press: function () {
                that.joApp.backFunction();
            }
        });

        this.mainPage = new sap.m.Page({
            showHeader: false,
            content: []
        });
        this.createView();
        this.loadData();
        this.joApp.addPage(this.mainPage);
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage);

        UtilGen.setFormTitle(this.oController.getForm(), "Account Card", this.mainPage);

        return this.joApp;
    },
    createView: function () {
        var that = this;
        var that2 = this;
        var view = this.view;
        UtilGen.clearPage(this.mainPage);
        this.o1 = {};
        var fe = [];
        this.frm = this.createViewHeader();
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

        Util.destroyID("poCmdAlert" + this.timeInLong, this.view);
        this.frm.getToolbar().addContent(new sap.m.Button(this.view.createId("poCmdAlert" + this.timeInLong), {
            icon: "sap-icon://bell",
            text: "Alerts",
            press: function () {
                Util.AlertSettings.init(that2.view);
                Util.AlertSettings.createView();
                Util.setControlValue(Util.AlertSettings.setup_type, "ACACCOUNT", "ACACCOUNT", true);
                Util.AlertSettings.show();
            }
        }));

        // that.createScrollCmds(this.frm.getToolbar());

        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.frm);

        this.mainPage.attachBrowserEvent("keydown", function (oEvent) {
            if (oEvent.key == 'F4') {
                that.get_new_ac();
            }
            if (oEvent.key == 'F2' && that2.view.byId("poCmdEdit" + this.timeInLong).getEnabled()) {
                that2.view.byId("poCmdEdit" + this.timeInLong).setPressed(!that2.view.byId("poCmdEdit" + this.timeInLong).getPressed());
                that2.view.byId("poCmdEdit" + this.timeInLong).firePress();
            }
        });

        this.mainPage.addContent(sc);

    },
    setFormEditable: function () {
        var that2 = this;
        if (that2.qryStr == "") {
            that2.ac.accno.setEditable(true);
            that2.ac.accno.setEnabled(true);
        } else
            that2.ac.accno.setEditable(false);

        that2.ac.name.setEditable(true);
        that2.ac.namea.setEditable(true);
        that2.ac.parentacc.setEnabled(true);
        that2.ac.closeacc.setEnabled(true);
        that2.ac.isbankcash.setEditable(true);
    },
    createViewHeader: function () {
        var that = this;
        var fe = [];
        var titSpan = "XL2 L4 M4 S12";
        var codSpan = "XL3 L2 M2 S12";
        //button for create a/c
        var bt = new sap.m.Button({
            text: "Pick AC [F4]",
            press: function () {
                that.get_new_ac();
            },
            layoutData: new sap.ui.layout.GridData({span: codSpan}),
        });
        bt.dontEnterFocus = true;
        fe.push(bt);

        //accno
        this.ac.accno = UtilGen.addControl(fe, "A/C No", sap.m.Input, "Acc" + this.timeInLong + "_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: codSpan}),
            }, "string", undefined, this.view);

        //name : descr

        this.ac.name = UtilGen.addControl(fe, "@Title", sap.m.Input, "Acc" + this.timeInLong + "_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: titSpan}),
            }, "string", undefined, this.view);

        this.ac.namea = UtilGen.addControl(fe, "Title Eng", sap.m.Input, "Acc" + this.timeInLong + "_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: titSpan}),
            }, "string", undefined, this.view);

        //parentacc : parent a/c
        this.ac.parentacc = UtilGen.addControl(fe, "Parent A/c", sap.m.SearchField, "Acc" + this.timeInLong + "_",
            {
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(this, "", "", true);
                        return;
                    }
                    var control = this;
                    var sq = "select Accno code,Name title from acaccount where childcount>0 order by path ";
                    Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                        UtilGen.setControlValue(control, val, valx, true);
                        var vldtt = Util.execSQL("select name,closeacc from acaccount where accno = " + Util.quoted(valx));
                        if (vldtt.ret != "SUCCESS") {
                            UtilGen.setControlValue(control, "", "", true);
                            return;
                        }
                        var vldt = JSON.parse("{" + vldtt.data + "}").data;
                        var acn = vldt[0].CLOSEACC;
                        var nm = vldt[0].NAME;
                        if (acn != "") {
                            nm = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(acn));
                            UtilGen.setControlValue(that.ac.closeacc, nm + "-" + acn, acn, true);
                        }
                    });

                },
                change: function (e) {
                    var vl = UtilGen.getControlValue(that.ac.parentacc);
                    var vldtt = Util.execSQL("select name,closeacc from acaccount where accno = " + Util.quoted(vl));
                    if (vldtt.ret != "SUCCESS") {
                        UtilGen.setControlValue(this, "", "", true);
                        return;
                    }
                    var vldt = JSON.parse("{" + vldtt.data + "}").data;
                    var acn = vldt[0].CLOSEACC;
                    var nm = vldt[0].NAME;
                    UtilGen.setControlValue(this, nm + "-" + vl, vl, true);
                    if (acn != "") {
                        nm = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(acn));
                        UtilGen.setControlValue(that.ac.closeacc, nm + "-" + acn, acn, true);
                    }

                },
                liveChange: function (e) {
                    UtilGen.setControlValue(this, this.getText(), this.getText(), false);
                }

            }, "string", undefined, this.view);

        //closeacc  : closing a/c
        this.ac.closeacc = UtilGen.addControl(fe, "Close A/c", sap.m.SearchField, "Acc" + this.timeInLong + "_",
            {
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(this, "", "", true);
                        return;
                    }

                    UtilGen.doSearch(e, "select Accno code,Name title from acaccount where actype=1 order by path ", this);
                }

            }, "string", undefined, this.view);


        // isbankcash
        this.ac.isbankcash = UtilGen.addControl(fe, "Bank/Cash", sap.m.CheckBox, "Acc" + this.timeInLong + "_",
            {selected: false}, "boolean", undefined, this.view);
        this.ac.isbankcash.trueValues = ["Y", "N"]; // true value , false value;

        setTimeout(function () {
            Util.navEnter(fe);
        }, 500);
        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    }

    ,
    loadData: function () {
        var view = this.view;
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        this.ac.accno.setEnabled(true);

        if (this.qryStr == "") {
            this.vars.start_date, new Date();
            this.vars.currency_code = sett["DEFAULT_CURRENCY"];
            that.setFormEditable();
            UtilGen.resetDataJson(this.ac);

        } else {
            var dt = Util.execSQL("select *from acaccount where accno=" + Util.quoted(this.qryStr));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                    UtilGen.loadDataFromJson(this.ac, dtx[0], true);
                    this.ac.accno.setEnabled(false);

                    if (Util.nvl(dtx[0].PARENTACC, "") != "") {
                        var s = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(dtx[0].PARENTACC));
                        UtilGen.setControlValue(this.ac.parentacc, s + "-" + dtx[0].PARENTACC, dtx[0].PARENTACC, true);
                    }
                    var s = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(dtx[0].CLOSEACC));
                    UtilGen.setControlValue(this.ac.closeacc, s + "-" + dtx[0].CLOSEACC, dtx[0].CLOSEACC, true);
                }
            }


        }
        if (!this.fromStatus) {
            this.do_status();
        } else this.fromStatus = undefined;
    }
    ,
    validateSave: function () {
        var objs = [this.ac.accno,
            this.ac.closeacc];

        if (UtilGen.showErrorNoVal(objs) > 0)
            return false;

        var pa = UtilGen.getControlValue(this.ac.parentacc);
        if (!this.canAcParent(pa)) {
            sap.m.MessageToast.show(this.errStr);
            return false;
        }

        return true;
    }
    ,
    save_data: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        if (!this.validateSave())
            return;
        var k = ""; //  sql for order1 table.
        // inserting or updating order1 and order1 and order2  tables.
        // var defaultValues = {};
        if (this.qryStr == "") {
            var acn = UtilGen.getControlValue(this.ac.accno);
            var pacn = UtilGen.getControlValue(this.ac.parentacc);
            var pth = this.generateAcPath(pacn, acn);
            k = UtilGen.getSQLInsertString(this.ac, {
                path: Util.quoted(pth),
                start_date: Util.toOraDateString(new Date()),
                levelno: (pth.match(/\\/g) || []).length - 1,
                actype: 0

            })
            ;
            k = "insert into ACACCOUNT " + k + ";";
        } else
            k = UtilGen.getSQLUpdateString(this.ac, "acaccount", {},
                "ACCNO=" + Util.quoted(this.qryStr), ["ACCNO"]) + " ;";
        k = "begin " + k + " end;";

        var oSql = {
            "sql": k,
            "ret": "NONE",
            "data": null
        };
        Util.doAjaxJson("sqlexe", oSql, false).done(function (data) {
            console.log(data);
            if (data == undefined) {
                sap.m.MessageToast.show("Error: unexpected, check server admin");
                return;
            }
            if (data.ret != "SUCCESS") {
                sap.m.MessageToast.show("Error :" + data.ret);
                return;
            }
            var acn = UtilGen.getControlValue(this.ac.accno);
            sap.m.MessageToast.show("Saved Successfully ..!");
            that.qryStr = Util.nvl(acn, this.qryStr);
            that.oController.status = "view";
            that.oController.accno = this.qryStr;
            that.fromStatus = undefined;
            that.loadData();
        });


        this.joApp.backFunction();
    }
    ,
    get_new_ac: function () {
        var that = this;
        if (this.qryStr != "") {
            sap.m.MessageToast.show("You are  Editing A/c # " + this.qryStr);
            return;
        }

        // if (Util.nvl(UtilGen.getControlValue(this.ac.parentacc), "") == "") {
        if ((this.ac.parentacc.getEnabled()) && Util.nvl(UtilGen.getControlValue(this.ac.parentacc), "") == "") {
            UtilGen.doSearch(
                undefined, "select Accno code,Name title from acaccount where usecount=0 order by path ", that.ac.parentacc, function () {
                    if (Util.nvl(UtilGen.getControlValue(that.ac.parentacc), "") == "")
                        return;
                    var pac = Util.nvl(UtilGen.getControlValue(that.ac.parentacc), "");
                    var nn = Util.getSQLValue("select to_number(nvl(max(accno),0))+1 from acaccount where parentacc=" + Util.quoted(pac));
                    if (nn == 1)
                        nn = pac + "01";
                    UtilGen.setControlValue(that.ac.accno, nn, nn, true);
                    var vldtt = Util.execSQL("select name,closeacc from acaccount where accno = " + Util.quoted(UtilGen.getControlValue(that.ac.parentacc)));
                    if (vldtt.ret != "SUCCESS") {
                        UtilGen.setControlValue(this.ac.closeacc, "", "", true);
                        return;
                    }
                    var vldt = JSON.parse("{" + vldtt.data + "}").data;
                    var acn = vldt[0].CLOSEACC;
                    var nm = vldt[0].NAME;
                    if (acn != "") {
                        nm = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(acn));
                        UtilGen.setControlValue(that.ac.closeacc, nm + "-" + acn, acn, true);
                    }
                }, "Select parent A/c");
        } else {
            var pac = Util.nvl(UtilGen.getControlValue(that.ac.parentacc), "");
            var nn = Util.getSQLValue("select to_number(nvl(max(accno),0))+1 from acaccount where parentacc=" + Util.quoted(pac));
            UtilGen.setControlValue(that.ac.accno, nn, nn, true);
        }

    }
    ,
    generateAcPath: function (pac, ac) {
        var that = this;
        var ret = "XXX\\" + ac + "\\";
        if (pac == "")
            return ret;

        var pth = Util.getSQLValue("select nvl(max(path),'') from acaccount where accno=" + Util.quoted(pac));

        if (pth == "")
            return "";
        return pth + ac + "\\";
    }
    ,
    canAcParent: function (pa) {
        this.errStr = "";

        if (!Util.isNull(pa)) {
            var n = Util.getSQLValue("select nvl(count(*),0) from acvoucher2 where accno=" + Util.quoted(pa));
            if (n > 0) {
                this.errStr = "Err ! , Parent A/c is in transaction !";
                return false;
            }
            n = Util.getSQLValue("select nvl(count(*),0) from c_ycust where ac_no=" + Util.quoted(pa));
            if (n > 0) {
                this.errStr = "Err ! , Parent A/c is in  Receivables/Payables !";
                return false;
            }
            n = Util.getSQLValue("select nvl(count(*),0) from cbranch where accno=" + Util.quoted(pa));
            if (n > 0) {
                this.errStr = "Err ! , Parent A/c is in branches !";
                return false;
            }
        }
        return true;
    }
    ,
    do_status: function () {
        var that = this;
        if (this.oController.status == "new") {
            this.view.byId("poCmdEdit" + this.timeInLong).setEnabled(false);
            setTimeout(function () {
                that.frm.setEditable(true);
                if (Util.nvl(that.oController.parentacc, "") != "") {
                    var dt = Util.execSQLWithData("select accno,name from acaccount where accno=" + Util.quoted(that.oController.parentacc));
                    if (dt !== undefined) {
                        UtilGen.setControlValue(that.ac.parentacc, that.oController.parentacc + "-" + dt[0].NAME, that.oController.parentacc, true);
                        that.ac.parentacc.fireChange();
                    }
                }
                that.ac.name.focus();
                that.get_new_ac();

            }, 100)
        }

        if (this.oController.status == "view") {
            if (!Util.nvl(this.oController.accno, "") == "") {
                this.qryStr = this.oController.accno;
                this.fromStatus = true;
                this.loadData();

            }
            this.frm.setEditable(false);
            UtilGen.setFormDisableForEditing(this.frm);
            this.view.byId("poCmdEdit" + this.timeInLong).setEnabled(true);
        }


    }
    ,
    show_list: function () {
        var that = this;
        var sq = "select ACCNO,NAME  from ACACCOUNT  ORDER BY PATH";
        Util.showSearchList(sq, "NAME", "ACCNO", function (valx, val) {
            that.oController.status = "view";
            that.qryStr = valx;
            that.loadData();
        });
    }
    ,
})
;



