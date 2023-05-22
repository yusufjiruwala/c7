sap.ui.jsfragment("bin.forms.gl.masterAc", {

    createContent: function (oController) {
        var that = this;
        this.oController = oController;
        this.view = oController.getView();
        this.qryStr = Util.nvl(oController.code, "");
        this.timeInLong = (new Date()).getTime();
        this.joApp = new sap.m.SplitApp({ mode: sap.m.SplitAppMode.HideMode });
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
        }).addStyleClass("sapUiSizeCompact");
        this.createView();
        this.loadData();
        this.joApp.addDetailPage(this.mainPage);
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage, "show");

        this.joApp.displayBack = function () {
            that.frm.refreshDisplay();
        };
        this.mainPage.attachBrowserEvent("keydown", function (oEvent) {
            if (that.frm.isFormEditable() && oEvent.key == 'F4') {
                that.get_new_ac();
            }
            if (that.frm.isFormEditable() && oEvent.key == 'F10') {
                that.frm.cmdButtons.cmdSave.firePress();
            }

        });

        setTimeout(function () {
            if (that.oController.getForm().getParent() instanceof sap.m.Dialog)
                that.oController.getForm().getParent().setShowHeader(false);

        }, 10);

        // UtilGen.setFormTitle(this.oController.getForm(), "Journal Voucher", this.mainPage);
        return this.joApp;
    },
    get_new_ac: function () {
        var that = this;
        if (this.qryStr != "") {
            sap.m.MessageToast.show("You are  Editing A/c # " + this.qryStr);
            return;
        }
        var pacc = that.frm.objs["qry1.parentacc"].obj;
        var paccname = that.frm.objs["qry1.parentaccname"].obj;
        var accno = that.frm.objs["qry1.accno"].obj;
        var closeacc = that.frm.objs["qry1.closeacc"].obj;
        var closeaccname = that.frm.objs["qry1.closeaccname"].obj;
        // if (Util.nvl(UtilGen.getControlValue(this.ac.parentacc), "") == "") {
        if ((pacc.getEnabled()) && Util.nvl(UtilGen.getControlValue(pacc), "") == "") {
            UtilGen.doSearch(
                undefined, "select Accno code,Name title from acaccount where usecount=0 order by path ", pacc, function () {
                    if (Util.nvl(UtilGen.getControlValue(pacc), "") == "")
                        return;
                    var pac = Util.nvl(UtilGen.getControlValue(pacc), "");
                    var nn = Util.getSQLValue("select to_number(nvl(max(accno),0))+1 from acaccount where parentacc=" + Util.quoted(pac));
                    if (nn == 1)
                        nn = pac + "01";
                    UtilGen.setControlValue(accno, nn, nn, true);
                    var vldtt = Util.execSQL("select name,closeacc from acaccount where accno = " + Util.quoted(UtilGen.getControlValue(pacc)));
                    if (vldtt.ret != "SUCCESS") {
                        UtilGen.setControlValue(closeacc, "", "", true);
                        UtilGen.setControlValue(closeaccname, "", "", true);
                        return;
                    }
                    var vldt = JSON.parse("{" + vldtt.data + "}").data;
                    var acn = vldt[0].CLOSEACC;
                    var nm = vldt[0].NAME;
                    if (acn != "") {
                        nm = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(acn));
                        UtilGen.setControlValue(closeacc, acn, acn, true);
                        UtilGen.setControlValue(closeaccname, nm, nm, true);
                    }
                }, "Select parent A/c", paccname);
        } else {
            var pac = Util.nvl(UtilGen.getControlValue(pacc), "");
            var nn = Util.getSQLValue("select to_number(nvl(max(accno),0))+1 from acaccount where parentacc=" + Util.quoted(pac));
            if (nn == 1)
                nn = pac + "01";
            UtilGen.setControlValue(accno, nn, nn, true);
        }

    },
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
    },
    generateAcPath: function (pac, ac) {
        var that = this;
        var ret = "XXX\\" + ac + "\\";
        if (pac == "")
            return ret;

        var pth = Util.getSQLValue("select nvl(max(path),'') from acaccount where accno=" + Util.quoted(pac));

        if (pth == "")
            return "";
        return pth + ac + "\\";
    },
    createView: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var that2 = this;
        var thatForm = this;
        var view = this.view;
        var fullSpan = "XL8 L8 M8 S12";
        var codSpan = "XL3 L3 M3 S12";
        var sumSpan = "XL2 L2 M2 S12";
        var sumSpan2 = "XL2 L6 M6 S12";
        var dmlSq = "select acvoucher2.*,acvoucher2.descr2 acname,cc.title csname from acvoucher2,accostcent1 cc " +
            " where vou_code=" + this.vars.vou_code + " " +
            " and acvoucher2.keyfld=':keyfld' " +
            " and cc.code(+)=acvoucher2.costcent order by acvoucher2.pos";
        Util.destroyID("cmdA" + this.timeInLong, this.view);
        UtilGen.clearPage(this.mainPage);
        this.frm;
        var js = {
            form: {
                title: "Account Card",
                toolbarBG: Util.nvl(UtilGen.toolBarBackColor, "ivory"),
                formSetting: {
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
                },
                customDisplay: function (vbHeader) {
                    Util.destroyID("numtxt" + thatForm.timeInLong, thatForm.view);
                    Util.destroyID("txtMsg" + thatForm.timeInLong, thatForm.view);
                    var txtMsg = new sap.m.Text(thatForm.view.createId("txtMsg" + thatForm.timeInLong)).addStyleClass("redMiniText");
                    var txt = new sap.m.Text(thatForm.view.createId("numtxt" + thatForm.timeInLong, { text: "0.000" }));
                    var hb = new sap.m.Toolbar({
                        content: [txt, new sap.m.ToolbarSpacer(), txtMsg]
                    });
                    txt.addStyleClass("totalVoucherTxt titleFontWithoutPad");
                    vbHeader.addItem(hb);
                },
                print_templates: [],
                events: {
                    afterExeSql: function (oSql) {
                        thatForm.frm.setFieldValue("pac", thatForm.frm.getFieldValue("qry1.accno"));
                    },
                    afterLoadQry: function (qry) {

                        var sett = sap.ui.getCore().getModel("settings").getData();
                        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
                        if (qry.name == "qry1") {
                            setTimeout(function () {
                                if (thatForm.view.byId("numtxt" + thatForm.timeInLong) != undefined) {
                                    var dt = Util.getSQLValue("select sum(debit-credit) from acc_transaction where path like (select path||'%' from acaccount where accno=" + qry.formview.getFieldValue("accno") + ")");
                                    thatForm.view.byId("numtxt" + thatForm.timeInLong).setText("Balance : " + df.format(dt));

                                    var nos = Util.getSQLValue("select nvl(count(*),0) from acc_transaction where path like (select path||'%' from acaccount where accno=" + qry.formview.getFieldValue("accno") + ")");
                                    var chld = Util.getSQLValue("select nvl(count(*),0) from acaccount  where parentacc=" + qry.formview.getFieldValue("accno"));
                                    var str = "Posted Records # " + nos + "\n Childerens # " + chld;
                                    thatForm.view.byId("txtMsg" + thatForm.timeInLong).setText(str);
                                }

                            });
                            var par = that.frm.getFieldValue("qry1.parentacc");
                            if (Util.nvl(par, "") != "") {
                                var s = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(par));
                                UtilGen.setControlValue(that.frm.objs["qry1.parentacc"].obj, par, par, true);
                                UtilGen.setControlValue(that.frm.objs["qry1.parentaccname"].obj, s, s, true);
                            }
                            var cls = that.frm.getFieldValue("qry1.closeacc");
                            if (Util.nvl(cls, "") != "") {
                                var s = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(cls));
                                UtilGen.setControlValue(that.frm.objs["qry1.closeacc"].obj, cls, cls, true);
                                UtilGen.setControlValue(that.frm.objs["qry1.closeaccname"].obj, s, s, true);
                            }
                        }
                    },
                    beforeLoadQry: function (qry, sql) {

                        return sql;
                    },
                    afterSaveQry: function (qry) {

                    },
                    afterSaveForm: function (frm, nxtStatus) {
                        // that.frm.setQueryStatus(undefined, Util.nvl(nxtStatus, FormView.RecordStatus.NEW));
                    },
                    addSqlAfterInsert: function (qry, rn) {
                        if (qry.name == "qry1" && Util.nvl(that.frm.getFieldValue("par"), "") == "") {
                            var pac = that.frm.getFieldValue("qry1.parentacc");
                            var s1 = "";
                            if (pac != "") {
                                s1 = "update acaccount set childcount=(select nvl(count(*),0) from acaccount where parentacc=':qry1.parentacc') where accno=':qry1.parentacc' ; "
                                s1 = that.frm.parseString(s1);
                            }
                            return s1;
                        }

                        return "";
                    },
                    addSqlBeforeUpdate: function (qry, rn) {
                        if (qry.name == "qry1" && Util.nvl(that.frm.getFieldValue("par"), "") == "") {
                            var pac = Util.getSQLValue("select parentacc from acaccount where accno=" + that.frm.getFieldValue("qry1.accno"));
                            var s1 = "";
                            if (pac != "") {
                                s1 = "update acaccount set childcount=(select nvl(count(*),0) from acaccount where parentacc=':qry1.parentacc') where accno=':qry1.parentacc' ; "
                                s1 = that.frm.parseString(s1);
                            }
                            return s1;
                        }

                        return "";
                    },

                    addSqlAfterUpdate: function (qry, rn) {
                        if (qry.name == "qry1" && Util.nvl(that.frm.getFieldValue("par"), "") == "") {
                            var pac = Util.getSQLValue("select parentacc from acaccount where accno=" + that.frm.getFieldValue("qry1.accno"));
                            var s1 = "";
                            if (pac != "") {
                                s1 = "update acaccount set childcount=(select nvl(count(*),0) from acaccount where parentacc=':qry1.parentacc') where accno=':qry1.parentacc' ; "
                                s1 = that.frm.parseString(s1);
                            }
                            return s1;
                        }

                        return "";
                    },
                    beforeSaveQry: function (qry, sqlRow, rowNo) {
                        if (qry.name == "qry1") {
                            var par = that.frm.getFieldValue("qry1.parentacc");
                            var ac = that.frm.getFieldValue("qry1.accno");
                            if (!that.canAcParent(par))
                                FormView.err(that.errStr);
                            sqlRow["path"] = Util.quoted(that.generateAcPath(par, ac));
                            sqlRow["levelno"] = (sqlRow["path"]).match((/\\/g) || []).length - 1;
                        }

                        return "";
                    },
                    afterNewRow: function (qry, idx, ld) {
                        if (qry.name == "qry1") {
                            var dt = new Date();
                            that.frm.setFieldValue("qry1.currency_code", sett["DEFAULT_CURRENCY"], sett["DEFAULT_CURRENCY"], true);
                            that.frm.setFieldValue("qry1.start_date", dt, dt, true);
                            that.frm.setFieldValue("pac", "", "", true);
                            that.view.byId("txtMsg" + thatForm.timeInLong).setText("");
                            that.view.byId("numtxt" + thatForm.timeInLong).setText("");
                        }
                    },
                    beforeDeleteValidate: function (frm) {
                        var qry = that.frm.objs["qry1"];
                        if (qry.name == "qry1" && (qry.status == FormView.RecordStatus.EDIT) ||
                            (qry.status == FormView.RecordStatus.VIEW)) {
                            var valx = that.frm.getFieldValue("pac");
                            var accno = that.frm.getFieldValue("qry1.accno");
                            if (valx != accno) {
                                FormView.err("Account not same as " + accno + " <> " + valx + " , Refresh data !");
                            }
                            var vldtt = Util.getSQLValue("select usecount from acaccount where accno = " + Util.quoted(valx));
                            if (Util.nvl(vldtt, 0) > 0) {
                                FormView.err("Err ! , this account have transaction #" + vldtt);
                            }
                            vldtt = Util.getSQLValue("select childcount from acaccount where accno = " + Util.quoted(valx));
                            if (Util.nvl(vldtt, 0) > 0) {
                                FormView.err("Err ! , this account have branches  #" + vldtt);
                            }
                            vldtt = Util.getSQLValue("select nvl(count(*),0) from acvoucher2 where accno = " + Util.quoted(valx));
                            if (Util.nvl(vldtt, 0) > 0) {
                                FormView.err("Err ! , this account have transaction # " + vldtt);
                            }

                        }
                    },
                    beforeDelRow: function (qry, idx, ld, data) {

                    },
                    afterDelRow: function (qry, ld, data) {
                        if (qry.name == "qry1") {
                            var pac = that.frm.getFieldValue("qry1.parentacc");
                            var s1 = "";
                            if (pac != "") {
                                s1 = "update acaccount set childcount=(select nvl(count(*),0) from ACACCOUNT where parentacc=':qry1.parentacc') where accno=':qry1.parentacc' ; "
                                s1 = that.frm.parseString(s1);
                            }

                            return s1;
                        }

                    },
                    onCellRender: function (qry, rowno, colno, currentRowContext) {
                    },
                    beforePrint: function (rptName, params) {
                        return params;
                    }

                },
                parameters: [
                    {
                        para_name: "pac",
                        data_type: FormView.DataType.String,
                        value: ""
                    }
                ],
                db: [
                    {
                        type: "query",
                        name: "qry1",
                        dml: "select *from acaccount where accno=':pac'",
                        where_clause: " accno=':accno'",
                        update_exclude_fields: ['accno', "tit1", "parentaccname", "closeaccname"],
                        insert_exclude_fields: ["tit1", "parentaccname", "closeaccname"],
                        insert_default_values: {
                            "CREATDT": "sysdate",
                            "USERNM": Util.quoted(sett["LOGON_USER"]),
                            "ACTYPE": 0
                        },
                        update_default_values: {},
                        table_name: "ACACCOUNT",
                        edit_allowed: true,
                        insert_allowed: true,
                        delete_allowed: false,
                        fields: {
                            accno: {
                                colname: "accno",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"accNo\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "25%" },
                                edit_allowed: false,
                                insert_allowed: true,
                                require: true
                            },
                            name: {
                                colname: "name",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"titleTxt\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "No",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "45%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true
                            },
                            namea: {
                                colname: "namea",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"titleTxt2\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "85%" },
                                list: undefined,
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false,
                            },
                            parentacc: {
                                colname: "parentacc",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"parentAc\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "30%",
                                    showValueHelp: true,
                                    valueHelpRequest: function (e) {
                                        if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                                            UtilGen.setControlValue(this, "", "", true);
                                            UtilGen.setControlValue(thatForm.frm.objs["qry1.parentaccname"].obj, "", "", true);
                                            return;
                                        }
                                        var control = this;
                                        var pacnm = thatForm.frm.objs["qry1.parentaccname"].obj
                                        var closeacc = thatForm.frm.objs["qry1.closeacc"].obj;
                                        var closeaccname = thatForm.frm.objs["qry1.closeaccname"].obj;
                                        var sq = "select Accno code,Name title from acaccount where childcount>0 order by path ";
                                        Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                                            UtilGen.setControlValue(control, valx, valx, true);
                                            UtilGen.setControlValue(pacnm, val, val, true);
                                            var vldtt = Util.execSQL("select name,closeacc from acaccount where accno = " + Util.quoted(valx));
                                            if (vldtt.ret != "SUCCESS") {
                                                UtilGen.setControlValue(control, "", "", true);
                                                UtilGen.setControlValue(pacnm, "", "", true);
                                                return;
                                            }
                                            var vldt = JSON.parse("{" + vldtt.data + "}").data;
                                            var acn = vldt[0].CLOSEACC;
                                            var nm = vldt[0].NAME;
                                            if (acn != "") {
                                                nm = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(acn));
                                                UtilGen.setControlValue(closeacc, acn, acn, true);
                                                UtilGen.setControlValue(closeaccname, nm, nm, true);
                                            }
                                        });

                                    },
                                    change: function (e) {
                                        var vl = this.getValue();
                                        var vldtt = Util.execSQL("select name,closeacc from acaccount where accno = " + Util.quoted(vl));
                                        if (vldtt.ret != "SUCCESS") {
                                            UtilGen.setControlValue(this, "", "", true);
                                            UtilGen.setControlValue(thatForm.frm.objs["qry1.parentaccname"].obj, "", "", true);
                                            return;
                                        }
                                        var closeacc = thatForm.frm.objs["qry1.closeacc"].obj;
                                        var closeaccname = thatForm.frm.objs["qry1.closeaccname"].obj;
                                        var vldt = JSON.parse("{" + vldtt.data + "}").data;
                                        var acn = vldt[0].CLOSEACC;
                                        var nm = vldt[0].NAME;
                                        UtilGen.setControlValue(this, vl, vl, false);
                                        UtilGen.setControlValue(thatForm.frm.objs["qry1.parentaccname"].obj, nm, nm, false);
                                        if (acn != "") {
                                            nm = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(acn));
                                            UtilGen.setControlValue(closeacc, acn, acn, false);
                                            UtilGen.setControlValue(closeaccname, nm, nm, true);
                                        }

                                    },

                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            parentaccname: {
                                colname: "parentaccname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "54%",
                                },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: false

                            },
                            closeacc: {
                                colname: "closeacc",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"closeAc\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "30%",
                                    showValueHelp: true,
                                    valueHelpRequest: function (e) {
                                        if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                                            UtilGen.setControlValue(this, "", "", true);
                                            UtilGen.setControlValue(thatForm.frm.objs["qry1.closeaccname"].obj, "", "", true);
                                            return;
                                        }
                                        UtilGen.doSearch(e, "select Accno code,Name title from acaccount where actype=1 order by path ", this,
                                            undefined, undefined, thatForm.frm.objs["qry1.closeaccname"].obj);
                                    },
                                },

                                edit_allowed: false,
                                insert_allowed: true,
                                require: true
                            },
                            closeaccname: {
                                colname: "closeaccname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Close A/c\",\"width\":\"1%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "54%",
                                },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: true
                            },
                            isbankcash: {
                                colname: "isbankcash",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '{\"text\":\"isBankCash\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_LEFT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "35%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            flag: {
                                colname: "flag",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '@{\"text\":\"lockAc\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "35%", trueValues: [2, 1] },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false,
                                trueValues: [2, 1]
                            },
                            start_date: {
                                colname: "start_date",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: '@{\"text\":\"startDate\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "40%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true
                            },
                            currency_code: {
                                colname: "currency_code",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"currencyCode\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "No",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "25%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true
                            },
                            costcent: {
                                colname: "costcent",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.SEARCHFIELD,
                                title: '@{\"text\":\"costCent\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "No",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "45%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            tit1: {
                                colname: "tit1",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.LABEL,
                                title: '#{\"text\":\"otherInfo\",\"width\":\"99%\","textAlign":"Begin","styleClass":"qrGroup","style":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "1%" },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: false
                            },
                        }

                    }
                ],
                canvas: [],
                commands: [
                    {
                        name: "cmdSave",
                        canvas: "default_canvas",
                        onPress: function (e) {
                            // var ac = that2.frm.getFieldValue("accno");
                            // var ac = that2.frm.parseString("select from acaccount where accno=':pac'");
                            // var sv = that2.frm.getSQLUpdateString("qry1", undefined, ['code'], " CODE=':code' ");
                            // console.log(sv);
                            // sap.m.MessageToast.show("Saved...", {
                            //     my: sap.ui.core.Popup.Dock.RightBottom,
                            //     at: sap.ui.core.Popup.Dock.RightBottom
                            // });

                            return true;
                        }
                    },
                    {
                        name: "cmdDel",
                        canvas: "default_canvas",
                    }, {
                        name: "cmdEdit",
                        canvas: "default_canvas",
                    },
                    {
                        name: "cmdNew",
                        canvas: "default_canvas",
                        onPress: function (e) {
                            that.frm.setFieldValue("pac", "", "", true);
                        }
                    },
                    {
                        name: "cmdList",
                        canvas:
                            "default_canvas",
                        list_name:
                            "list1"
                    }
                    ,
                    {
                        name: "cmdPrint",
                        canvas:
                            "default_canvas",
                        title: Util.getLangText("soaTxt"),
                        onPress:

                            function (e) {
                                var ac = that.frm.getFieldValue("pac");
                                UtilGen.execCmd("testRep5 formType=dialog repno=1 para_PARAFORM=false para_EXEC_REP=true fromacc=" + ac + " toacc=" + ac + " fromdate=@01/01/2020", UtilGen.DBView, UtilGen.DBView, UtilGen.DBView.newPage);
                                return true;
                            }
                    }
                    ,
                    {
                        name: "cmdClose",
                        canvas:
                            "default_canvas",
                        obj: new sap.m.Button({
                            icon: "sap-icon://decline",
                            text: Util.getLangText("cmdClose"),
                            press: function () {
                                that2.joApp.backFunction();
                            }
                        })
                    }
                ],
                lists: [
                    {
                        name: 'list1',
                        title: "List of A/Cs",
                        list_type: "sql",
                        cols: [
                            {
                                colname: 'ACCNO',
                                return_field: "pac",
                            },
                            {
                                colname: "NAME",
                            },
                        ],  // [{colname:'code',width:'100',return_field:'pac' }]
                        sql: "select ACCNO,NAME  from ACACCOUNT  ORDER BY PATH",
                        afterSelect: function (data) {
                            that2.frm.loadData(undefined, "view");
                            return true;
                        }
                    }
                ]

            }
        }
            ;
        this.frm = new FormView(this.mainPage);
        this.frm.view = view;
        this.frm.pg = this.mainPage;
        this.frm.parseForm(js);
        this.frm.createView();

        // this.mainPage.addContent(sc);

    },
    setFormEditable: function () {

    }
    ,

    createViewHeader: function () {
        var that = this;
        var fe = [];
        var titSpan = "XL2 L4 M4 S12";
        var codSpan = "XL3 L2 M2 S12";


        // this.cs = {};
        // this.cs.code = UtilGen.addControl(fe, "Code", sap.m.Input, "Cs" + this.timeInLong + "_",
        //     {
        //         enabled: true,
        //         layoutData: new sap.ui.layout.GridData({span: codSpan}),
        //     }, "string", undefined, this.view);
        // this.cs.title = UtilGen.addControl(fe, "@Title", sap.m.Input, "cs" + this.timeInLong + "_",
        //     {
        //         enabled: true,
        //         layoutData: new sap.ui.layout.GridData({span: titSpan}),
        //     }, "string", undefined, this.view);
        //
        //
        // return UtilGen.formCreate("", true, fe);
        // return UtilGen.formCreate("", true, fe, undefined, undefined, [1, 1, 1]);

    }
    ,
    loadData: function () {
        this.frm.setQuery
        if (Util.nvl(this.oController.parentacc, "") != "") {
            this.frm.setQueryStatus(undefined, FormView.RecordStatus.NEW);
            this.frm.setFieldValue("qry1.parentacc", this.oController.parentacc, this.oController.parentacc, true);
            this.frm.objs["qry1.parentacc"].obj.fireChange();
            this.get_new_ac();
            this.oController.parentacc = "";
            return;
        }

        if (Util.nvl(this.oController.accno, "") != "" &&
            Util.nvl(this.oController.status, "view") == FormView.RecordStatus.VIEW) {
            this.frm.setFieldValue("pac", this.oController.accno, this.oController.accno, true);
            this.frm.loadData(undefined, FormView.RecordStatus.VIEW);
            this.oController.accno = "";
            return;

        }
        if (Util.nvl(this.oController.accno, "") != "" &&
            Util.nvl(this.oController.status, "view") == FormView.RecordStatus.EDIT) {
            this.frm.setFieldValue("pac", this.oController.accno, this.oController.accno, true);
            this.frm.loadData(undefined, FormView.RecordStatus.EDIT);
            this.oController.accno = "";
            return;

        }
        this.frm.setQueryStatus(undefined, FormView.RecordStatus.NEW);
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



