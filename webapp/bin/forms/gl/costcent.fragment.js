sap.ui.jsfragment("bin.forms.gl.costcent", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = "";
        this.cs = {};
        this.joApp = new sap.m.App({});
        this.timeInLong = (new Date()).getTime();
        this.vars = {};
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

        var sc = new sap.m.ScrollContainer();

        sc.addContent(this.frm);


        this.mainPage.addContent(sc);

    },

    setFormEditable: function () {
        var that2 = this;
        if (that2.qryStr == "") {
            that2.cs.code.setEditable(true);
        } else
            that2.cs.code.setEditable(false);

        that2.cs.code.setEditable(true);
        that2.cs.title.setEditable(true);
        that2.cs.titlea.setEditable(true);
        that2.cs.parentcostcent.setEnabled(true);
    },

    createViewHeader: function () {
        var that = this;
        var fe = [];
        var titSpan = "XL2 L4 M4 S12";
        var codSpan = "XL3 L2 M2 S12";
        this.cs = {};
        var bt = new sap.m.Button({
            text: "Pick AC [F4]",
            press: function () {
                that.get_new_cc();
            },
            layoutData: new sap.ui.layout.GridData({span: codSpan}),
        });
        bt.dontEnterFocus = true;

        this.cs.code = UtilGen.addControl(fe, "Code", sap.m.Input, "Cs" + this.timeInLong + "_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: codSpan}),
            }, "string", undefined, this.view);
        // this.cs.code.setShowValueHelp(true);
        this.cs.title = UtilGen.addControl(fe, "@Title", sap.m.Input, "cs" + this.timeInLong + "_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: titSpan}),
            }, "string", undefined, this.view);
        this.cs.titlea = UtilGen.addControl(fe, "Title-2", sap.m.Input, "cs" + this.timeInLong + "_",
            {
                enabled: true,
                layoutData: new sap.ui.layout.GridData({span: titSpan}),
            }, "string", undefined, this.view);


        this.cs.parentcostcent = UtilGen.addControl(fe, "Parent", sap.m.SearchField, "cs" + this.timeInLong + "_",
            {
                search: function (e) {
                    if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                        UtilGen.setControlValue(this, "", "", true);
                        return;
                    }

                    UtilGen.doSearch(e, "select code,title from accostcent1 order by path", this);
                }

            }, "string", undefined, this.view);

        setTimeout(function () {
            Util.navEnter(fe);
        }, 500);
        // return UtilGen.formCreate("", true, fe);
        return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    },
    loadData: function () {
        var view = this.view;
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();

        this.cs.code.setEnabled(true);

        if (this.qryStr == "") {
            that.setFormEditable();
            UtilGen.resetDataJson(this.cs);

        } else {
            var dt = Util.execSQL("select *from ACCOSTCENT1 where CODE=" + Util.quoted(this.qryStr));
            if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                if (dt.ret = "SUCCESS" && dt.data.length > 0) {
                    var dtx = JSON.parse("{" + dt.data + "}").data;
                    UtilGen.loadDataFromJson(this.cs, dtx[0], true);
                    this.cs.code.setEnabled(false);

                    if (Util.nvl(dtx[0].PARENTCOSTCENT, "") != "") {
                        var s = Util.getSQLValue("select title from accostcent1 where code=" + Util.quoted(dtx[0].PARENTCOSTCENT));
                        UtilGen.setControlValue(this.cs.parentcostcent, s + "-" + dtx[0].PARENTCOSTCENT, dtx[0].PARENTCOSTCENT, true);
                    }
                }
            }


        }
        if (!this.fromStatus) {
            this.do_status();
        } else this.fromStatus = undefined;
    }
    ,
    validateSave: function () {

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
        var acn = this.qryStr;
        if (this.qryStr == "") {
            acn = UtilGen.getControlValue(this.cs.code);
            var pacn = UtilGen.getControlValue(this.cs.parentcostcent);
            var pth = this.generateCCPath(pacn, acn);
            k = UtilGen.getSQLInsertString(this.cs, {
                path: Util.quoted(pth),
                levelno: (pth.match(/\\/g) || []).length - 1,
                type: 3,
                CLOSECTG: 0
            })
            ;
            k = "insert into accostcent1 " + k + ";";
        } else
            k = UtilGen.getSQLUpdateString(this.cs, "accostcent1", {},
                "CODE=" + Util.quoted(this.qryStr), ["CODE"]) + " ;";
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

            sap.m.MessageToast.show("Saved Successfully ..!");
            that.qryStr = Util.nvl(acn, this.qryStr);
            this.oController.status = "view";
            this.oController.code = this.qryStr;
            this.fromStatus=undefined;
            that.loadData();
        });


        // this.joApp.backFunction();
    },

    get_new_cc: function () {
        var that = this;
        if (this.qryStr != "") {
            sap.m.MessageToast.show("You are  Editing CC # " + this.qryStr);
            return;
        }

        // if (Util.nvl(UtilGen.getControlValue(this.cs.parentcostcent), "") == "") {
        if ((this.cs.parentcostcent.getEnabled()) && Util.nvl(UtilGen.getControlValue(this.cs.parentcostcent), "") == "") {
            UtilGen.doSearch(
                undefined, "select code, title from accostcent1 where usecount=0 order by path ", that.cs.parentcostcent, function () {
                    if (Util.nvl(UtilGen.getControlValue(that.cs.parentcostcent), "") == "")
                        return;
                    var pac = Util.nvl(UtilGen.getControlValue(that.cs.parentcostcent), "");
                    var nn = Util.getSQLValue("select to_number(nvl(max(code),0))+1 from accostcent1 where parentcostcent=" + Util.quoted(pac));
                    if (nn == 1)
                        nn = pac + "01";

                    UtilGen.setControlValue(that.cs.code, nn, nn, true);
                }, "Select parent CC");
        } else {
            var pac = Util.nvl(UtilGen.getControlValue(that.cs.parentcostcent), "");
            var nn = Util.getSQLValue("select to_number(nvl(max(code),0))+1 from accostcent1 where parentcostcent=" + Util.quoted(pac));
            UtilGen.setControlValue(that.cs.code, nn, nn, true);
        }

    },
    generateCCPath: function (pac, ac) {
        var that = this;
        var ret = "XXX\\" + ac + "\\";
        if (pac == "")
            return ret;

        var pth = Util.getSQLValue("select nvl(max(path),'') from accostcent1 where code=" + Util.quoted(pac));

        if (pth == "")
            return "";
        return pth + ac + "\\";
    },
    canAcParent: function (pa) {
        this.errStr = "";
        return true;
    },
    do_status: function () {
        var that = this;
        if (this.oController.status == "new") {
            this.view.byId("poCmdEdit" + this.timeInLong).setEnabled(false);
            setTimeout(function () {
                that.frm.setEditable(true);
                if (Util.nvl(that.oController.parentcostcent, "") != "") {
                    var dt = Util.execSQLWithData("select code,title from accostcent1 where code=" + Util.quoted(that.oController.parentcostcent));
                    if (dt !== undefined) {
                        UtilGen.setControlValue(that.cs.parentcostcent, that.oController.parentcostcent + "-" + dt[0].TITLE, that.oController.parentcostcent, true);
                        that.cs.parentcostcent.fireChange();
                    }
                }
                that.cs.title.focus();
                that.get_new_cc();

            }, 100)
        }

        if (this.oController.status == "view") {
            if (!Util.nvl(this.oController.code, "") == "") {
                this.qryStr = this.oController.code;
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
        var sq = "select CODE,TITLE  from accostcent1  ORDER BY PATH";
        Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
            that.oController.status = "view";
            that.qryStr = valx;
            that.loadData();
        });
    }
});



