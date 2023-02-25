sap.ui.jsfragment("bin.forms.yd.sl", {

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
            ord_code: 1011,
            ord_type: 1
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
    show_link: function () {
        var that = this;
        var qry = that.frm.objs["qry1"];
        var sett = sap.ui.getCore().getModel("settings").getData();
        var genPwd = function (length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }
            return result;
        };


        if (qry.status == FormView.RecordStatus.EDIT ||
            qry.status == FormView.RecordStatus.NEW)
            that.frm.save_data();
        var on = that.frm.getFieldValue("pac");
        var pwStr = Util.getSQLValue("select ORD_TXT_IID from order1 where ord_no=" + on);
        var fe = [];
        var formSet = {
            width: "350px",
            cssText: [
                "padding-left:10px;" +
                "padding-top:10px;"
            ]
        };
        var fn1 = function (e) {
            navigator.clipboard.writeText(obj.getValue());
        }
        var fn2 = function () {
            navigator.clipboard.writeText(pwd.getValue());
        }
        var lblLnk = '{\"text\":\"Link\",\"width\":\"15%\","textAlign":"End","styleClass":""}';
        var pwdLnk = '{\"text\":\"Password\",\"width\":\"15%\","textAlign":"End","styleClass":""}';
        var lblcmdLnk = '@{\"text\":\"@\",\"width\":\"1%\","textAlign":"End","styleClass":""}';
        var lblcmdPwd = '@{\"text\":\"@\",\"width\":\"1%\","textAlign":"End","styleClass":""}';
        var obj = UtilGen.addControl(fe,
            lblLnk, sap.m.Input,
            "lnk" + this.timeInLong,
            { width: "70%" }, "string",
            "", this.view, undefined, "");
        var cmdCpy1 = UtilGen.addControl(fe,
            lblcmdLnk, sap.m.Button,
            "cmdLnk" + this.timeInLong,
            { icon: "sap-icon://copy", width: "14%", press: fn1 }, "string",
            "", this.view, undefined, "");
        var pwd = UtilGen.addControl(fe,
            pwdLnk, sap.m.Input,
            "pwd" + this.timeInLong,
            { width: "70%" }, "string",
            "", this.view, undefined, "");
        var cmdCpy1 = UtilGen.addControl(fe,
            lblcmdPwd, sap.m.Button,
            "cmdPwd" + this.timeInLong,
            { icon: "sap-icon://copy", width: "14%", press: fn2 }, "string",
            "", this.view, undefined, "");

        if (Util.nvl(pwStr, "") == "") pwStr = genPwd(6);
        UtilGen.setControlValue(pwd, pwStr, pwStr, true);
        var str = "http://" + sett["IP_SERVER_1"] + "/custInv.html?ord_no=" + on;
        UtilGen.setControlValue(obj, str, str, true);

        var cnt = UtilGen.formCreate2("", true, fe, undefined, sap.m.ScrollContainer, formSet, "sapUiSizeCondensed", "5px");
        var dlg = new sap.m.Dialog({
            contentHeight: "250px",
            contentWidth: "400px",
            content: cnt,
            title: "Copy Link and password ",
            draggable: true,
            buttons: [new sap.m.Button({
                text: "UPDATE",
                press: function () {
                    var ordno = that.frm.getFieldValue("pac");
                    var dt = Util.execSQL("update order1 set ORD_TXT_IID=" + Util.quoted(pwd.getValue()) + " where ord_code=1011 and ord_no=" + ordno);
                    if (dt.ret != "SUCCESS")
                        FormView.err("Password not updated !");
                    else
                        sap.m.MessageToast.show("Password updated !");
                    dlg.close();
                }
            })]
        });
        dlg.open();
    },
    createView: function () {
        var that = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var that2 = this;
        var thatForm = this;
        var view = this.view;
        var codSpan = "XL3 L3 M3 S12";
        Util.destroyID("cmdA" + this.timeInLong, this.view);
        UtilGen.clearPage(this.mainPage);
        this.frm;
        var js = {
            form: {
                title: "الاشتراكات",
                toolbarBG: "#fff0f5",
                formSetting: {
                    width: { "S": 400, "M": 650, "L": 750 },
                    cssText: [
                        "padding-left:10px;" +
                        "padding-top:20px;" +
                        "border-width: thin;" +
                        "border-style: solid;" +
                        "border-color: lightgreen;" +
                        "margin: 10px;" +
                        "border-radius:25px;" +
                        "background-color:#fff0f5;"
                    ]
                },
                customDisplay: function (vbHeader) {
                    Util.destroyID("numtxt" + thatForm.timeInLong, thatForm.view);
                    Util.destroyID("txtMsg" + thatForm.timeInLong, thatForm.view);
                    var txtMsg = new sap.m.Text(thatForm.view.createId("txtMsg" + thatForm.timeInLong)).addStyleClass("redMiniText");
                    var txt = new sap.m.Text(thatForm.view.createId("numtxt" + thatForm.timeInLong, { text: "0.000" }));
                    var bt = new sap.m.Button(thatForm.view.createId("cmdSub" + thatForm.timeInLong), {
                        text: "Schedule",
                        icon: "sap-icon://customer",
                        press: function (e) {
                            var qry = that.frm.objs["qry1"];
                            if (qry.status == FormView.RecordStatus.EDIT ||
                                qry.status == FormView.RecordStatus.NEW)
                                that.frm.save_data();
                            var ordno = that.frm.getFieldValue("pac");
                            UtilGen.execCmd("bin.forms.yd.cp ord_no=" + ordno, UtilGen.DBView, UtilGen.DBView.txtExeCmd, UtilGen.DBView.newPage, function () {
                                var on = that.frm.getFieldValue("pac");
                                var sqcnt = Util.getSQLValue("select nvl(count(*),0) from order_cust_plan where ord_no=" + on + "  and " +
                                    " (RFR_BREAKFAST is not null OR RFR_LUNCH  is not null OR  RFR_DINNER  is not null OR  RFR_SALAD  is not null OR  RFR_SNACK  is not null OR  RFR_SOUP  is not null) ");
                                if (sqcnt > 0) {
                                    that.frm.cmdButtons.cmdEdit.setEnabled(false);
                                    that.frm.cmdButtons.cmdDel.setEnabled(false);
                                } else {
                                    that.frm.cmdButtons.cmdEdit.setEnabled(true);
                                    that.frm.cmdButtons.cmdDel.setEnabled(true);
                                }
                            });
                        }
                    });
                    var bt2 = new sap.m.Button(thatForm.view.createId("cmdSub2" + thatForm.timeInLong), {
                        text: "رابط المشاركة",
                        icon: "sap-icon://share-2",
                        press: function (e) {
                            that.show_link();
                        }
                    });
                    var hb = new sap.m.Toolbar({
                        content: [bt, txt, new sap.m.ToolbarSpacer(), bt2, txtMsg]
                    });
                    txt.addStyleClass("totalVoucherTxt titleFontWithoutPad");
                    vbHeader.addItem(hb);
                },
                print_templates: [],
                events: {
                    afterExeSql: function (oSql) {
                        thatForm.frm.setFieldValue("pac", thatForm.frm.getFieldValue("qry1.ord_no"));
                    },
                    afterLoadQry: function (qry) {
                        if (qry.name == "qry1") {
                            var on = that.frm.getFieldValue("pac");
                            var nm = Util.getSQLValue("select descr from items where reference=" + Util.quoted(that.frm.objs["qry1.ord_ship"].obj.getValue()));
                            that.frm.setFieldValue('qry1.itemdes', nm, nm, true);
                            nm = Util.getSQLValue("select descr from items where reference=" + Util.quoted(that.frm.objs["qry1.sub_group_item"].obj.getValue()));
                            that.frm.setFieldValue('qry1.grpname', nm, nm, true);
                            var sqcnt = Util.getSQLValue("select nvl(count(*),0) from order_cust_plan where ord_no=" + on + "  and " +
                                " (RFR_BREAKFAST is not null OR RFR_LUNCH  is not null OR  RFR_DINNER  is not null OR  RFR_SALAD  is not null OR  RFR_SNACK  is not null OR  RFR_SOUP  is not null) ");
                            if (sqcnt > 0) {
                                that.frm.cmdButtons.cmdEdit.setEnabled(false);
                                that.frm.cmdButtons.cmdDel.setEnabled(false);
                            } else {
                                that.frm.cmdButtons.cmdEdit.setEnabled(true);
                                that.frm.cmdButtons.cmdDel.setEnabled(true);
                            }

                        }
                    },
                    beforeLoadQry: function (qry, sql) {
                        return sql;
                    },
                    afterSaveQry: function (qry) {
                    },
                    afterSaveForm: function (frm, nxtStatus) {
                    },
                    beforeSaveQry: function (qry, sqlRow, rowNo) {
                        // if (qry.name == "qry1") {
                        //     var par = that.frm.getFieldValue("qry1.parentcostcent");
                        //     var ac = that.frm.getFieldValue("qry1.code");
                        //     if (!that.canAcParent(par))
                        //         FormView.err(that.errStr);
                        //     sqlRow["path"] = Util.quoted(that.generateAcPath(par, ac));
                        // }

                        return "";
                    },
                    afterNewRow: function (qry, idx, ld) {
                        if (qry.name == "qry1") {
                            that.frm.setFieldValue("pac", "", "", true);
                            that.view.byId("txtMsg" + thatForm.timeInLong).setText("");
                            that.view.byId("numtxt" + thatForm.timeInLong).setText("");
                            that.frm.setFieldValue("qry1.sub_tot_amt", 0, 0, true);
                            that.frm.setFieldValue("qry1.ord_ref", thatForm.oController.ord_ref, thatForm.oController.ord_ref, true);
                            that.frm.setFieldValue("qry1.ord_refnm", thatForm.oController.ord_refnm, thatForm.oController.ord_refnm, true);
                            var kfld = Util.getSQLValue("select nvl(max(ord_no),0)+1 from order1 where ord_code=" + that.vars.ord_code);
                            that.frm.setFieldValue("qry1.ord_no", kfld, kfld, true);
                            qry.formview.setFieldValue("qry1.ord_date", new Date(new Date().toDateString()), new Date(new Date().toDateString()), true);
                            qry.formview.setFieldValue("qry1.sub_fromdate", new Date(new Date().toDateString()), new Date(new Date().toDateString()), true);
                            that.frm.setFieldValue("qry1.ord_ship", '9901', '9901', true);
                            var itmnm = Util.getSQLValue("select descr from items where reference='9901'");
                            that.frm.setFieldValue("qry1.itemdes", itmnm, itmnm, true);
                            that.frm.setFieldValue("qry1.sub_active_days", 1, 1, true);
                            that.frm.setFieldValue("qry1.sub_noactive_days", 0, 0, true);
                            that.frm.setFieldValue("qry1.sub_delivered_days", 0, 0, true);
                            that.frm.setFieldValue("qry1.sub_add_days", 0, 0, true);
                            that.frm.setFieldValue("qry1.sub_sun", "Y", "Y", true);
                            that.frm.setFieldValue("qry1.sub_mon", "Y", "Y", true);
                            that.frm.setFieldValue("qry1.sub_tue", "Y", "Y", true);
                            that.frm.setFieldValue("qry1.sub_wed", "Y", "Y", true);
                            that.frm.setFieldValue("qry1.sub_thu", "Y", "Y", true);

                            // that.calcToDate();

                        }
                    },
                    addSqlAfterInsert: function (qry, rn) {
                        if (qry.name = "qry1" && Util.nvl(that.frm.getFieldValue("par"), "") == "") {
                            var sq = "delete from order2 where ord_code=:ORD_CODE and ord_no=:ORD_NO ; " +
                                " DELETE FROM ORDER_CUST_PLAN WHERE ord_no=:ORD_NO ; " +
                                " insert into order2(PERIODCODE, ORD_NO, ORD_CODE, ORD_POS, ORD_DATE, ORD_REFER,ORD_PRICE,ORD_PKQTY,ORD_ALLQTY,ORD_PACKD,ORD_UNITD, ORD_PACK) " +
                                " VALUES (:PERIODCODE, :ORD_NO, :ORD_CODE, :ORD_POS, :ORD_DATE, :ORD_REFER,:ORD_PRICE, :ORD_PKQTY, :ORD_ALLQTY, :ORD_PACKD, :ORD_UNITD, :ORD_PACK) ";
                            var dt = that.frm.objs["qry1.ord_date"].obj.getValue();
                            sq = sq.replaceAll(":PERIODCODE", Util.quoted(sett["CURRENT_PERIOD"]));
                            sq = sq.replaceAll(":ORD_NO", ":qry1.ord_no");
                            sq = sq.replaceAll(":ORD_CODE", that.vars.ord_code);
                            sq = sq.replaceAll(":ORD_POS", "1");
                            sq = sq.replaceAll(":ORD_DATE", Util.toOraDateString(dt));
                            sq = sq.replaceAll(":ORD_REFER", "':qry1.ord_ship'");
                            sq = sq.replaceAll(":ORD_PRICE", "':qry1.sub_tot_amt'");
                            sq = sq.replaceAll(":ORD_PKQTY", 1);
                            sq = sq.replaceAll(":ORD_ALLQTY", 1);
                            sq = sq.replaceAll(":ORD_PACKD", "'PCS'");
                            sq = sq.replaceAll(":ORD_UNITD", "'PCS'");
                            sq = sq.replaceAll(":ORD_PACK", 1);
                            var sq2 = that.generateDaysSql();
                            sq = that.frm.parseString(sq) + ";" + that.frm.parseString(sq2) + ";";

                            return sq;
                        }
                        return "";
                    },
                    beforeDeleteValidate: function (frm) {
                        var qry = that.frm.objs["qry1"];
                        if (qry.name == "qry1" && (qry.status == FormView.RecordStatus.EDIT) ||
                            (qry.status == FormView.RecordStatus.VIEW)) {
                            var valx = that.frm.getFieldValue("pac");
                            var vldtt = Util.getSQLValue("select ord_flag from order1 where ord_code=" + thatForm.vars.ord_code + " and  ord_no = " + Util.quoted(valx));
                            if (vldtt >= 2)
                                FormView.err("Err ! , this order is posted / invoiced !");

                        }
                    },
                    beforeDelRow: function (qry, idx, ld, data) {

                    },
                    afterDelRow: function (qry, ld, data) {
                        if (qry.name == "qry1" && (qry.status == FormView.RecordStatus.EDIT) ||
                            (qry.status == FormView.RecordStatus.VIEW)) {
                            var valx = that.frm.getFieldValue("pac");
                            var sq = "delete from order2 where ord_code=:ORD_CODE and ord_no=:ORD_NO ; " +
                                " DELETE FROM ORDER_CUST_PLAN WHERE ord_no=:ORD_NO ; ";
                            sq = sq.replaceAll(":ORD_NO", valx);
                            sq = sq.replaceAll(":ORD_CODE", that.vars.ord_code);
                            sq = that.frm.parseString(sq);
                            return sq;
                        }
                    },
                    onCellRender: function (qry, rowno, colno, currentRowContext) {
                    },
                    beforeExeSql: function (frm, sq) {

                        var sq1 = "update order1 set sub_weeks=" + thatForm.frm.totweeks +
                            ", sub_days=" + that.frm.totdays + " where ord_no=" + thatForm.frm.getFieldValue("qry1.ord_no") + " and ord_code=" + that.vars.ord_code + ";";
                        return sq + sq1;
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
                        dml: "select *from order1 where ord_no=':pac'",
                        where_clause: " ord_no=':ord_no'",
                        update_exclude_fields: ["itemdes", "txt_sub_sun", "txt_sub_mon", "grpname"],
                        insert_exclude_fields: ["itemdes", "txt_sub_sun", "txt_sub_mon", "grpname"],
                        insert_default_values: {
                            "PERIODCODE": Util.quoted(sett["CURRENT_PERIOD"]),
                            "CREATDT": "sysdate",
                            "USERNM": Util.quoted(sett["LOGON_USER"]),
                            "ORD_TYPE": thatForm.vars.ord_type,
                            "ORD_CODE": thatForm.vars.ord_code
                        },
                        update_default_values: {
                        },
                        table_name: "order1",
                        edit_allowed: true,
                        insert_allowed: true,
                        delete_allowed: false,
                        fields: {
                            ord_no: {
                                colname: "ord_no",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"No #\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "20%" },
                                edit_allowed: false,
                                insert_allowed: true,
                                require: true
                            },
                            ord_date: {
                                colname: "ord_date",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: '@{\"text\":\"Date #\",\"width\":\"35%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "30%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true
                            },
                            ord_ref: {
                                colname: "ord_ref",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Cust #\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "20%",
                                    showValueHelp: true,
                                },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: true
                            },
                            ord_refnm: {
                                colname: "ord_refnm",
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
                                    width: "64%",
                                },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: true
                            },
                            ord_ship: {
                                colname: "ord_ship",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Item #\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "20%",
                                    showValueHelp: true,
                                    valueHelpRequest: function (e) {
                                        var control = thatForm.frm.objs["qry1.ord_ship"].obj;
                                        var cntname = thatForm.frm.objs["qry1.itemdes"].obj;
                                        if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                                            UtilGen.setControlValue(control, "", "", true);
                                            UtilGen.setControlValue(cntname, "", "", true);
                                            return;
                                        }

                                        var sq = "select reference,descr from items where childcounts=0 and reference like '9%' order by descr ";
                                        Util.showSearchList(sq, "DESCR", "REFERENCE", function (valx, val) {
                                            UtilGen.setControlValue(control, valx, valx, true);
                                            UtilGen.setControlValue(cntname, val, val, true);
                                        });
                                    }
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true
                            },
                            itemdes: {
                                colname: "itemdes",
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
                                    width: "34%",
                                },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: true
                            },
                            sub_tot_amt: {
                                colname: "sub_tot_amt",
                                data_type: FormView.DataType.Number,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Amount \",\"width\":\"10%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: sett["FORMAT_MONEY_1"],
                                other_settings: { width: "20%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true
                            },
                            sub_active_days: {
                                colname: "sub_active_days",
                                data_type: FormView.DataType.Number,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Active Days \",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "20%",
                                    change: function (e) {
                                        var aD = parseFloat(thatForm.frm.objs["qry1.sub_active_days"].obj.getValue());
                                        if (aD < 1)
                                            thatForm.frm.objs["qry1.sub_active_days"].obj.setValue(1);
                                        if (that.checkFromDate())
                                            thatForm.calcToDate();
                                    }
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true
                            },
                            sub_fromdate: {
                                colname: "sub_fromdate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: '@{\"text\":\"From \",\"width\":\"10%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "25%",
                                    change: function (e) {
                                        if (that.checkFromDate())
                                            thatForm.calcToDate();
                                    }
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true
                            },
                            sub_todate: {
                                colname: "sub_todate",
                                data_type: FormView.DataType.Date,
                                class_name: FormView.ClassTypes.DATEFIELD,
                                title: '@{\"text\":\"To \",\"width\":\"10%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "20%" },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: true
                            },
                            sub_group_item: {
                                colname: "sub_group_item",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Item #\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "20%",
                                    showValueHelp: true,
                                    valueHelpRequest: function (e) {
                                        var control = thatForm.frm.objs["qry1.sub_group_item"].obj;
                                        var cntname = thatForm.frm.objs["qry1.grpname"].obj;
                                        if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                                            UtilGen.setControlValue(control, "", "", true);
                                            UtilGen.setControlValue(cntname, "", "", true);
                                            return;
                                        }

                                        var sq = "select reference,descr from items where childcounts=0 and reference like '09%' order by descr ";
                                        Util.showSearchList(sq, "DESCR", "REFERENCE", function (valx, val) {
                                            UtilGen.setControlValue(control, valx, valx, true);
                                            UtilGen.setControlValue(cntname, val, val, true);
                                        });
                                    }
                                },

                                edit_allowed: true,
                                insert_allowed: true,
                                require: true
                            },
                            grpname: {
                                colname: "grpname",
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
                                    width: "84%",
                                },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: true
                            },
                            remarks: {
                                colname: "remarks",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Remarks\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "85%",
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true
                            },
                            sub_sun: {
                                colname: "sub_sun",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '{\"text\":\"Sun\",\"width\":\"7%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_CENTER",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "7%",
                                    select: function () {
                                        that.calcToDate();
                                    }
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                trueValues: ["Y", "N"]
                            },
                            sub_mon: {
                                colname: "sub_mon",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '@{\"text\":\"Mon\",\"width\":\"7%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_CENTER",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "7%",
                                    select: function () {
                                        that.calcToDate();
                                    }

                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                trueValues: ["Y", "N"]
                            },
                            sub_tue: {
                                colname: "sub_tue",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '@{\"text\":\"Tue\",\"width\":\"7%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_CENTER",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "7%",
                                    select: function () {
                                        that.calcToDate();
                                    }

                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                trueValues: ["Y", "N"]
                            },
                            sub_wed: {
                                colname: "sub_wed",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '@{\"text\":\"Wed\",\"width\":\"7%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_CENTER",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "7%",
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                trueValues: ["Y", "N"]
                            }, sub_thu: {
                                colname: "sub_thu",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '@{\"text\":\"Thu\",\"width\":\"7%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_CENTER",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "7%",
                                    select: function () {
                                        that.calcToDate();
                                    }

                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                trueValues: ["Y", "N"]
                            },
                            sub_fri: {
                                colname: "sub_fri",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '@{\"text\":\"Fri\",\"width\":\"7%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_CENTER",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "7%",
                                    select: function () {
                                        that.calcToDate();
                                    }

                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                trueValues: ["Y", "N"]
                            },
                            sub_sat: {
                                colname: "sub_sat",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.CHECKBOX,
                                title: '@{\"text\":\"Sat\",\"width\":\"7%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_CENTER",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "7%",
                                    select: function () {
                                        that.calcToDate();
                                    }
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                trueValues: ["Y", "N"]
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
                    }
                    ,
                    {
                        name: "cmdClose",
                        canvas:
                            "default_canvas",
                        title:
                            "Close",
                        obj:
                            new sap.m.Button({
                                icon: "sap-icon://decline",
                                press: function () {
                                    that2.joApp.backFunction();
                                }
                            })
                    }
                ],
                lists: [
                    {
                        name: 'list1',
                        title: "List ",
                        list_type: "sql",
                        cols: [
                            {
                                colname: 'CODE',
                                return_field: "pac",
                            },
                            {
                                colname: "TITLE",
                            },
                        ],  // [{colname:'code',width:'100',return_field:'pac' }]
                        sql: "",
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
    generateDaysSql: function () {
        var that = this;
        var thatForm = this;
        var sett = sap.ui.getCore().getModel("settings").getData();
        var aD = parseFloat(thatForm.frm.objs["qry1.sub_active_days"].obj.getValue());
        if (aD < 0)
            FormView.err("Err . Active days less then zero!");

        var dt = thatForm.frm.objs["qry1.sub_fromdate"].obj.getDateValue();
        var dt2 = new Date();
        var doff = []; // days off 
        var addDays = 0;
        var weekdays = 0;
        if (dt == null) FormView.err("Err ! , from date is null !");
        if (!this.frm.objs["qry1.sub_sun"].obj.getSelected()) {
            doff.push(0);
            weekdays++;
        }
        if (!this.frm.objs["qry1.sub_mon"].obj.getSelected())
            doff.push(1);
        else weekdays++;
        if (!this.frm.objs["qry1.sub_tue"].obj.getSelected())
            doff.push(2);
        else weekdays++;
        if (!this.frm.objs["qry1.sub_wed"].obj.getSelected())
            doff.push(3);
        else weekdays++;
        if (!this.frm.objs["qry1.sub_thu"].obj.getSelected())
            doff.push(4);
        else weekdays++;
        if (!this.frm.objs["qry1.sub_fri"].obj.getSelected())
            doff.push(5);
        else weekdays++;
        if (!this.frm.objs["qry1.sub_sat"].obj.getSelected())
            doff.push(6);
        else weekdays++;
        if (doff.indexOf(dt.getDay()) > -1)
            FormView.err("From date is day off , cant calculate to date !");
        var getSql = function (pDt, pWkno, pdn) {
            var sq = "insert into order_cust_plan " +
                " ( KEYFLD, ORD_NO, DELIVERY_DATE, WEEK_NO, DAY_NO, DELIVERY_BY, FLAG, DELIVER_TIME, ORDERED_BY, POSNO ) values " +
                " ( (select nvl(max(keyfld),0)+1 from order_cust_plan ) , :ORD_NO , :DELIVERY_DATE, :WEEK_NO, :DAY_NO, :DELIVERY_BY, 1, SYSDATE, :ORDERED_BY,0 ) ";
            sq = sq.replaceAll(":ORD_NO", ":qry1.ord_no");
            sq = sq.replaceAll(":DELIVERY_DATE", Util.toOraDateString(pDt));
            sq = sq.replaceAll(":WEEK_NO", pWkno);
            sq = sq.replaceAll(":DAY_NO", pdn);
            sq = sq.replaceAll(":DELIVERY_BY", Util.quoted(sett["LOGON_USER"]));
            sq = sq.replaceAll(":ORDERED_BY", Util.quoted(sett["LOGON_USER"]));
            return sq;
        }
        var sql = "";
        var wkno = 1;
        var dayno = 0;

        var ad1 = aD;
        var adi = 0;
        if (aD <= 1)
            sql = getSql(dt, wkno, dayno);
        else
            while (ad1 > 0) {
                dt2.setTime(dt.getTime() + ((adi++) * 86400000));
                if (doff.indexOf(dt2.getDay()) < 0) {
                    ad1--;
                    sql = sql + (sql.length > 0 ? ";" : "") + getSql(dt2, wkno, dayno)
                    if (dayno >= weekdays) {
                        wkno++;
                        dayno = 0;
                    } else dayno++;
                }
            }
        this.frm.totweeks = wkno;
        this.frm.totdays = dayno;

        return sql;

    },
    checkFromDate: function () {
        var that = this;
        var doff = []; // days off 
        var cont = that.frm.objs["qry1.sub_fromdate"].obj;
        var addDays = 0;
        if (!this.frm.objs["qry1.sub_sun"].obj.getSelected())
            doff.push(0);
        if (!this.frm.objs["qry1.sub_mon"].obj.getSelected())
            doff.push(1);
        if (!this.frm.objs["qry1.sub_tue"].obj.getSelected())
            doff.push(2);
        if (!this.frm.objs["qry1.sub_wed"].obj.getSelected())
            doff.push(3);
        if (!this.frm.objs["qry1.sub_thu"].obj.getSelected())
            doff.push(4);
        if (!this.frm.objs["qry1.sub_fri"].obj.getSelected())
            doff.push(5);
        if (!this.frm.objs["qry1.sub_sat"].obj.getSelected())
            doff.push(6);
        var dt = cont.getDateValue();
        if (dt == null) return true;
        if (doff.indexOf(dt.getDay()) > -1) {
            cont.setDateValue(null);
            sap.m.MessageToast.show("Can't choose from date as Day OFF");
        }
        return true;
    },
    calcToDate: function () {
        var thatForm = this;
        var aD = parseFloat(thatForm.frm.objs["qry1.sub_active_days"].obj.getValue());
        if (aD < 0)
            FormView.err("Err . Active days less then zero!");
        this.frm.totweeks = 1;
        this.frm.totdays = 0;
        var dt = thatForm.frm.objs["qry1.sub_fromdate"].obj.getDateValue();
        var dt2 = new Date();
        var doff = []; // days off 
        var addDays = 0;
        var weekdays = 0;
        if (dt == null) return true;
        if (!this.frm.objs["qry1.sub_sun"].obj.getSelected())
            doff.push(0);
        else weekdays++;
        if (!this.frm.objs["qry1.sub_mon"].obj.getSelected())
            doff.push(1);
        else weekdays++;
        if (!this.frm.objs["qry1.sub_tue"].obj.getSelected())
            doff.push(2);
        else weekdays++;
        if (!this.frm.objs["qry1.sub_wed"].obj.getSelected())
            doff.push(3);
        else weekdays++;
        if (!this.frm.objs["qry1.sub_thu"].obj.getSelected())
            doff.push(4);
        else weekdays++;
        if (!this.frm.objs["qry1.sub_fri"].obj.getSelected())
            doff.push(5);
        else weekdays++;
        if (!this.frm.objs["qry1.sub_sat"].obj.getSelected())
            doff.push(6);
        else weekdays++;
        if (doff.indexOf(dt.getDay()) > -1)
            FormView.err("From date is day off , cant calculate to date !");
        var ad1 = aD;
        var adi = 0;
        var wkno = 1;
        var dayno = 0;

        if (aD <= 1)
            dt2.setTime(dt.getTime());
        else
            while (ad1 > 0) {
                dt2.setTime(dt.getTime() + ((adi++) * 86400000));
                if (doff.indexOf(dt2.getDay()) < 0)
                    ad1--;
                if (dayno >= weekdays) {
                    wkno++;
                    dayno = 0;
                } else dayno++;

            }
        this.frm.totweeks = wkno;
        this.frm.totdays = dayno;
        thatForm.frm.objs["qry1.sub_todate"].obj.setDateValue(dt2);
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
        if (Util.nvl(this.oController.ord_no, "") != "" &&
            Util.nvl(this.oController.status, "view") == FormView.RecordStatus.VIEW) {
            this.frm.setFieldValue("pac", this.oController.accno, this.oController.ord_no, true);
            this.frm.loadData(undefined, FormView.RecordStatus.VIEW);
            this.oController.ord_no = "";
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



