sap.ui.jsfragment("bin.forms.yd.rp", {

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
            content: []
        }).addStyleClass("sapUiSizeCompact");
        this.subPage = new sap.m.Page({
            showHeader: false,
            content: []
        }).addStyleClass("sapUiSizeCompact");

        this.createView();
        this.loadData();
        this.joApp.addDetailPage(this.mainPage);
        this.joApp.addDetailPage(this.subPage);
        // this.joApp.addDetailPage(this.pgDetail);
        this.joApp.to(this.mainPage, "show");

        this.joApp.displayBack = function () {
            that.frm.refreshDisplay();
        };
        this.mainPage.attachBrowserEvent("keydown", function (oEvent) {
            if (that.frm.isFormEditable() && oEvent.key == 'F4') {
                that.get_new_cust();
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
    get_new_cust: function () {
        var that = this;
        var cod = Util.nvl(that.frm.getFieldValue("pac"), "");
        if (cod != "") {
            sap.m.MessageToast.show("You are  Editing Customer.# " + this.qryStr);
            return;
        }
        var pacc = that.frm.objs["qry1.parentcustomer"].obj;
        var paccname = that.frm.objs["qry1.parentcustname"].obj;
        var accno = that.frm.objs["qry1.code"].obj;
        if ((pacc.getEnabled()) && Util.nvl(UtilGen.getControlValue(pacc), "") == "") {
            UtilGen.doSearch(
                undefined, "select code,name title from c_ycust where usecount=0 order by path ", pacc, function () {
                    if (Util.nvl(UtilGen.getControlValue(pacc), "") == "")
                        return;
                    var pac = Util.nvl(UtilGen.getControlValue(pacc), "");
                    var nn = Util.getSQLValue("select to_number(nvl(max(code),0))+1 from c_ycust where parentcustomer=" + Util.quoted(pac));
                    if (nn == 1)
                        nn = pac + "01";
                    UtilGen.setControlValue(accno, nn, nn, true);
                }, "Select parent Cost center", paccname);
        } else {
            var pac = Util.nvl(UtilGen.getControlValue(pacc), "");
            var nn = Util.getSQLValue("select to_number(nvl(max(code),0))+1 from c_ycust where parentcustomer=" + Util.quoted(pac));
            UtilGen.setControlValue(accno, nn, nn, true);
        }

    },

    generateCustPath: function (pac, ac) {
        var that = this;
        var ret = "XXX\\" + ac + "\\";
        if (pac == "")
            return ret;

        var pth = Util.getSQLValue("select nvl(max(path),'') from c_ycust where code=" + Util.quoted(pac));
        if (pth == "")
            return "";
        return pth + ac + "\\";
    },
    canCustParent: function (pa) {
        this.errStr = "";

        if (!Util.isNull(pa)) {
            var n = Util.getSQLValue("select nvl(count(*),0) from acvoucher2 where cust_code=" + Util.quoted(pa));
            if (n > 0) {
                this.errStr = "Err ! , reference in account transaction !";
                return false;
            }
            n = Util.getSQLValue("select nvl(count(*),0) from pur1 where c_cus_no=" + Util.quoted(pa));
            if (n > 0) {
                this.errStr = "Err ! , reference in sales/purchase transaction !";
                return false;
            }
        }
        return true;
    },
    canAccAssign: function (ac) {
        if (Util.isNull(ac)) {
            this.errStr = "Err ! No account is assigned !";
            UtilGen.errorObj(this.frm.objs["qry1.ac_no"].obj);
            return false;
        }
        var n = Util.getSQLValue("select nvl(count(*),0) from acaccount where parentacc=" + Util.quoted(ac));
        if (n > 0) {
            this.errStr = "Err ! , Account  is having sub-accounts , cant assign  !";
            return false;
        }
        return true;
    },
    openSub: function (on) {
        var thatForm = this;
        if (thatForm.frm.objs["qry1"].status == FormView.RecordStatus.EDIT ||
            thatForm.frm.objs["qry1"].status == FormView.RecordStatus.NEW)
            thatForm.frm.save_data();
        var sp = sap.ui.jsfragment("bin.forms.yd.sl", {
            ord_ref: thatForm.frm.objs["qry1.code"].obj.getValue(),
            ord_refnm: thatForm.frm.objs["qry1.name"].obj.getValue(),
            ord_no: on,
            getView:
                function () {
                    return thatForm.view;
                },
            getForm: function () {
                return thatForm;
            }
        });
        sp.backFunction = function () {
            thatForm.joApp.to(thatForm.mainPage, "slide");
            thatForm.joApp.displayBack();
        }
        UtilGen.clearPage(thatForm.subPage);
        thatForm.subPage.addContent(sp);
        thatForm.joApp.to(thatForm.subPage, "slide");
        sp.displayBack();

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
                title: "R&P Card",
                toolbarBG: Util.nvl(UtilGen.toolBarBackColor, "#d1e189"),
                formSetting: {
                    width: { "S": 400, "M": 700, "L": 800 },
                    cssText: [
                        "padding-left:10px;" +
                        "padding-top:20px;" +
                        "border-width: thin;" +
                        "border-style: solid;" +
                        "border-color: lightgreen;" +
                        "margin: 5px;" +
                        "border-radius:25px;" +
                        "background-color:#d1e189;"
                    ]
                },
                customDisplay: function (vbHeader) {
                    Util.destroyID("numtxt" + thatForm.timeInLong, thatForm.view);
                    Util.destroyID("txtMsg" + thatForm.timeInLong, thatForm.view);
                    var txtMsg = new sap.m.Text(thatForm.view.createId("txtMsg" + thatForm.timeInLong)).addStyleClass("redMiniText");
                    var txt = new sap.m.Text(thatForm.view.createId("numtxt" + thatForm.timeInLong, { text: "0.000" }));
                    var scnt = 0;
                    var bt1 = new sap.m.Button(thatForm.view.createId("cmdNewSub" + thatForm.timeInLong), {
                        visible: false,
                        text: "New Subscription",
                        icon: "sap-icon://add",
                        press: function (e) {
                            thatForm.openSub();
                        }
                    });
                    var bt = new sap.m.Button(thatForm.view.createId("cmdSub" + thatForm.timeInLong), {
                        text: (scnt == 0 ? "اشتراك جديد" : "اشتراك"),
                        icon: scnt == 0 ? "sap-icon://add" : "sap-icon://edit",
                        press: function (e) {
                            var scnt = Util.getSQLValue("select nvl(count(*),0) from order1 where saleinv is null and ord_code=1011 and ord_ref=" + Util.quoted(thatForm.frm.objs["qry1.code"].obj.getValue()));
                            var sel_ord_no = undefined;
                            if (scnt > 0) {
                                var sq = "select ord_no,sub_fromdate FROMDATE,sub_todate TODATE from order1 where ord_code=1011 and ord_ref=" + Util.quoted(thatForm.frm.objs["qry1.code"].obj.getValue());
                                Util.show_list(sq, ["ORD_NO", "ORD_DATE", "SUB_FROMDATE", "SUB_TODATE", "SUB_TOT_AMT"], "", function (data) {
                                    if (data.length <= 0) return false;
                                    sel_ord_no = data.ORD_NO;
                                    thatForm.openSub(sel_ord_no);
                                    return true;
                                });
                            } else
                                thatForm.openSub();

                        }
                    });
                    var hb = new sap.m.Toolbar({
                        content: [txt, bt1, bt, new sap.m.ToolbarSpacer(), txtMsg]
                    });
                    txt.addStyleClass("totalVoucherTxt titleFontWithoutPad");
                    vbHeader.addItem(hb);
                },
                print_templates: [],
                events: {
                    afterExeSql: function (oSql) {
                        thatForm.frm.setFieldValue("pac", thatForm.frm.getFieldValue("qry1.code"));

                    },
                    afterLoadQry: function (qry) {
                        var sett = sap.ui.getCore().getModel("settings").getData();
                        var df = new DecimalFormat(sett["FORMAT_MONEY_1"]);
                        if (qry.name == "qry1") {
                            var par = that.frm.getFieldValue("qry1.parentcustomer");
                            if (Util.nvl(par, "") != "") {
                                var s = Util.getSQLValue("select name from c_ycust where code=" + Util.quoted(par));
                                UtilGen.setControlValue(that.frm.objs["qry1.parentcustomer"].obj, par, par, false);
                                UtilGen.setControlValue(that.frm.objs["qry1.parentcustname"].obj, s, s, false);
                            }
                            var acn = that.frm.getFieldValue("qry1.ac_no");
                            if (Util.nvl(acn, "") != "") {
                                var s = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(acn));
                                UtilGen.setControlValue(that.frm.objs["qry1.ac_no"].obj, acn, acn, false);
                                UtilGen.setControlValue(that.frm.objs["qry1.acname"].obj, s, s, false);
                            }
                            var sls = that.frm.getFieldValue("qry1.salesp");
                            if (Util.nvl(sls, "") != "") {
                                var s = Util.getSQLValue("select name from acaccount where accno=" + Util.quoted(sls));
                                UtilGen.setControlValue(that.frm.objs["qry1.salesp"].obj, sls, sls, false);
                                UtilGen.setControlValue(that.frm.objs["qry1.salesname"].obj, s, s, false);
                            }
                            var scnt = Util.getSQLValue("select nvl(count(*),0) from order1 where saleinv is null and ord_code=1011 and ord_ref=" + Util.quoted(thatForm.frm.objs["qry1.code"].obj.getValue()));

                            if (scnt > 0) {
                                thatForm.view.byId("cmdSub" + thatForm.timeInLong).setText("تعديل الاشتراك");
                                thatForm.view.byId("cmdSub" + thatForm.timeInLong).setIcon("sap-icon://edit");
                                thatForm.view.byId("cmdNewSub" + thatForm.timeInLong).setVisible(true);
                            }
                            else {
                                thatForm.view.byId("cmdSub" + thatForm.timeInLong).setText("اشتراك جديد");
                                thatForm.view.byId("cmdSub" + thatForm.timeInLong).setIcon("sap-icon://add");
                                thatForm.view.byId("cmdNewSub" + thatForm.timeInLong).setVisible(false);
                            }

                        }
                    },
                    addSqlAfterInsert: function (qry, rn) {
                        if (qry.name = "qry1" &&
                            qry.status == FormView.RecordStatus.NEW &&
                            Util.nvl(that.frm.getFieldValue("par"), "") == "") {
                            var sq = "insert into cbranch(BRNO, CODE, ACCNO, B_NAME) VALUES (1,':qry1.code',':qr1.ac_no',':qry1.name')";
                            sq = that.frm.parseString(sq) + ";";
                            return sq;
                        }
                        return "";
                    },
                    beforeLoadQry: function (qry, sql) {
                        return sql;
                    },
                    afterSaveQry: function (qry) {

                    },
                    afterSaveForm: function (frm, nxtStatus) {
                    },
                    beforeSaveQry: function (qry, sqlRow, rowNo) {
                        if (qry.name == "qry1") {
                            var par = that.frm.getFieldValue("qry1.parentcustomer");
                            var cod = that.frm.getFieldValue("qry1.code");
                            var acn = that.frm.getFieldValue("qry1.ac_no");
                            if (!that.canCustParent(par))
                                FormView.err(that.errStr);
                            if (!that.canAccAssign(acn))
                                FormView.err(that.errStr);


                            if (that.frm.getFieldValue("par") != "") {
                                var v1 = Util.getSQLValue("select parentcustomer from c_ycust where code=" + Util.quoted(cod));
                                if (v1 != par) {
                                    n = Util.getSQLValue("select nvl(count(*),0) from c_ycust where code=" + Util.quoted(cod));
                                    if (n > 0)
                                        FormView.err("Err ! ,due to change of Parent customer,  this customer have childerens  !");
                                }
                            }
                            sqlRow["path"] = Util.quoted(that.generateCustPath(par, cod));
                        }

                        return "";
                    },
                    afterNewRow: function (qry, idx, ld) {
                        if (qry.name == "qry1") {
                            that.frm.setFieldValue("pac", "", "", true);
                            // that.frm.setFieldValue("qry1.crd_limit", 0, 0, true);
                            that.frm.setFieldValue("qry1.parentcustomer", "1", "1", true);
                            var acn = Util.getSQLValue("select ac_no from c_ycust where code = '1'");
                            that.frm.setFieldValue("qry1.ac_no", acn, acn, true);
                            var pnm = Util.getSQLValue("select name from acaccount where ACCNO = " + Util.quoted(acn));
                            that.frm.setFieldValue("qry1.acname", pnm, pnm, true);
                            that.view.byId("txtMsg" + thatForm.timeInLong).setText("");
                            that.view.byId("numtxt" + thatForm.timeInLong).setText("");
                            that.frm.objs["qry1.etype"].obj.setSelectedItem(that.frm.objs["qry1.etype"].obj.getItems()[0]);
                            // that.frm.objs["qry1.type"].obj.setSelectedItem(that.frm.objs["qry1.type"].obj.getItems()[0]);
                        }
                    },
                    beforeDeleteValidate: function (frm) {
                        var qry = that.frm.objs["qry1"];
                        if (qry.name == "qry1" && (qry.status == FormView.RecordStatus.EDIT) ||
                            (qry.status == FormView.RecordStatus.VIEW)) {
                            var valx = that.frm.getFieldValue("pac");
                            var accno = that.frm.getFieldValue("qry1.code");
                            if (valx != accno) {
                                FormView.err("Customer is not same as " + accno + " <> " + valx + " , Refresh data !");
                            }
                            var vldtt = Util.getSQLValue("select nvl(count(*),0) from pur1 where c_cus_no = " + Util.quoted(valx));
                            if (Util.nvl(vldtt, 0) > 0) {
                                FormView.err("Err ! , this customer have transaction in Purchase/Sales #" + vldtt);
                            }
                            var vldtt = Util.getSQLValue("select nvl(count(*),0) from acvoucher2 where cust_code = " + Util.quoted(valx));
                            if (Util.nvl(vldtt, 0) > 0) {
                                FormView.err("Err ! , this customer have transaction in Accounts #" + vldtt);
                            }
                            var vldtt = Util.getSQLValue("select nvl(count(*),0) from c_ycust where parentcustomer = " + Util.quoted(valx));
                            if (Util.nvl(vldtt, 0) > 0) {
                                FormView.err("Err ! , this customer have sub-customers  #" + vldtt);
                            }
                        }
                    },
                    beforeDelRow: function (qry, idx, ld, data) {

                    },
                    afterDelRow: function (qry, ld, data) {

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
                        dml: "select *from c_ycust where code=':pac'",
                        where_clause: " code=':code'",
                        update_exclude_fields: ["parentcustname", "acname", "salesname", "code", "tit1"],
                        insert_exclude_fields: ["parentcustname", "acname", "salesname", "tit1"],
                        insert_default_values: {
                            "CREATDT": "sysdate",
                            "USERNM": Util.quoted(sett["LOGON_USER"]),
                            // "TYPE": 3,
                            type: "'ANY'",
                            crd_limit: 0,
                        },
                        update_default_values: {},
                        table_name: "c_ycust",
                        edit_allowed: true,
                        insert_allowed: true,
                        delete_allowed: false,
                        fields: {
                            code: {
                                colname: "code",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Code\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
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
                            etype: {
                                colname: "etype",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.COMBOBOX,
                                title: '@{\"text\":\"Type\",\"width\":\"30%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "35%",
                                    items: {
                                        path: "/",
                                        template: new sap.ui.core.ListItem({ text: "{NAME}", key: "{CODE}" }),
                                        templateShareable: true
                                    },
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true,
                                list: "@1/Local,2/Foreign"
                            },
                            name: {
                                colname: "name",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Name\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "35%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: true
                            },
                            namea: {
                                colname: "namea",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Name 2\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "35%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            parentcustomer: {
                                colname: "parentcustomer",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Parent\",\"width\":\"15%\","textAlign":"End","styleClass":"",visible:false}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "20%",
                                    visible: false,
                                    showValueHelp: true,
                                    valueHelpRequest: function (e) {
                                        if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                                            UtilGen.setControlValue(this, "", "", true);
                                            UtilGen.setControlValue(thatForm.frm.objs["qry1.parentcustname"].obj, "", "", true);
                                            return;
                                        }
                                        var control = this;
                                        var pacnm = thatForm.frm.objs["qry1.parentcustname"].obj
                                        var sq = "select code,name title from c_ycust order by path ";
                                        Util.showSearchList(sq, "TITLE", "CODE", function (valx, val) {
                                            UtilGen.setControlValue(control, valx, valx, true);
                                            UtilGen.setControlValue(pacnm, val, val, true);
                                        }, "Select Parent Customer");
                                    },
                                    change: function (e) {
                                        var control = this;
                                        var pacnm = thatForm.frm.objs["qry1.parentcustname"].obj;
                                        var vl = control.getValue();
                                        var pnm = Util.getSQLValue("select name from c_ycust where code = " + Util.quoted(vl));
                                        UtilGen.setControlValue(pacnm, pnm, pnm, true);
                                        UtilGen.setControlValue(control, vl, vl, false);
                                        that.get_new_cust(vl);

                                    }
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            parentcustname: {
                                colname: "parentcustname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\" \",\"width\":\"1%\","textAlign":"End","styleClass":"",visible:false}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    visible: false,
                                    width: "64%"
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false,
                            },
                            ac_no: {
                                colname: "ac_no",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"A/c No\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "20%",
                                    visible: false,
                                    showValueHelp: true,
                                    valueHelpRequest: function (e) {
                                        if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                                            UtilGen.setControlValue(this, "", "", true);
                                            UtilGen.setControlValue(thatForm.frm.objs["qry1.acname"].obj, "", "", true);
                                            return;
                                        }
                                        var control = this;
                                        var pacnm = thatForm.frm.objs["qry1.acname"].obj
                                        var sq = "select accno,name from acaccount where childcount=0 order by path ";
                                        Util.showSearchList(sq, "NAME", "ACCNO", function (valx, val) {
                                            UtilGen.setControlValue(control, valx, valx, true);
                                            UtilGen.setControlValue(pacnm, val, val, true);
                                        }, "Select Controlled A/c");
                                    },
                                },
                                edit_allowed: false,
                                insert_allowed: true,
                                require: true,

                            },
                            acname: {
                                colname: "acname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "64%", visible: false },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: false
                            },
                            salesp: {
                                colname: "salesp",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Sales Man\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: {
                                    width: "20%",
                                    showValueHelp: true,
                                    visible: false,
                                    valueHelpRequest: function (e) {
                                        if (e.getParameters().clearButtonPressed || e.getParameters().refreshButtonPressed) {
                                            UtilGen.setControlValue(this, "", "", true);
                                            UtilGen.setControlValue(thatForm.frm.objs["qry1.salesname"].obj, "", "", true);
                                            return;
                                        }
                                        var control = this;
                                        var pacnm = thatForm.frm.objs["qry1.salesname"].obj
                                        var sq = "select no,name from salesp where order by NO ";
                                        Util.showSearchList(sq, "NAME", "NO", function (valx, val) {
                                            UtilGen.setControlValue(control, valx, valx, true);
                                            UtilGen.setControlValue(pacnm, val, val, true);
                                        }, "Select Sales person");

                                    },
                                },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false,

                            },
                            salesname: {
                                colname: "salesname",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"\",\"width\":\"1%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "64%", visible: false },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: false,
                            },
                            tit1: {
                                colname: "tit1",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.LABEL,
                                title: '#{\"text\":\"Additional Details :\",\"width\":\"99%\","textAlign":"Begin","styleClass":"qrGroup","style":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "1%", visible: false },
                                edit_allowed: false,
                                insert_allowed: false,
                                require: false
                            },
                            reference: {
                                colname: "reference",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Reference\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "25%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            license: {
                                colname: "license",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Civil ID\",\"width\":\"10%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "20%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },

                            tel: {
                                colname: "tel",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Tel\",\"width\":\"10%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "20%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            addr: {
                                colname: "addr",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Address\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "25%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            area: {
                                colname: "area",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Area\",\"width\":\"10%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "20%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            fax: {
                                colname: "fax",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Fax\",\"width\":\"10%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "20%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            email: {
                                colname: "email",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '{\"text\":\"Email\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "35%" },
                                edit_allowed: true,
                                insert_allowed: true,
                                require: false
                            },
                            remark: {
                                colname: "remark",
                                data_type: FormView.DataType.String,
                                class_name: FormView.ClassTypes.TEXTFIELD,
                                title: '@{\"text\":\"Remark\",\"width\":\"15%\","textAlign":"End","styleClass":""}',
                                title2: "",
                                canvas: "default_canvas",
                                display_width: codSpan,
                                display_align: "ALIGN_RIGHT",
                                display_style: "",
                                display_format: "",
                                other_settings: { width: "35%" },
                                edit_allowed: true,
                                insert_allowed: true,
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
                        title: "New..",
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
                        title:
                            "SOA",
                        onPress:

                            function (e) {
                                var ac = that.frm.getFieldValue("pac");
                                UtilGen.execCmd("testRep5 formType=dialog repno=0 para_PARAFORM=false para_EXEC_REP=true costcent=" + ac + " fromdate=@01/01/2020", UtilGen.DBView, UtilGen.DBView, UtilGen.DBView.newPage);
                                return true;
                            }
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
                                colname: "NAME",
                            },
                        ],  // [{colname:'code',width:'100',return_field:'pac' }]
                        sql: "select code, name from c_ycust order by path",
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
        // if (Util.nvl(this.oController.accno, "") != "" &&
        //     Util.nvl(this.oController.status, "view") == FormView.RecordStatus.VIEW) {
        //     this.frm.setFieldValue("pac", this.oController.accno, this.oController.accno, true);
        //     this.frm.loadData(undefined, FormView.RecordStatus.VIEW);
        //     this.oController.accno = "";
        //     return;

        // }
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



